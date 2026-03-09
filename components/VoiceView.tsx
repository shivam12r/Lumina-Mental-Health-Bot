import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Activity, Volume2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';

interface VoiceViewProps {
  onEndCall: () => void;
  systemInstruction: string;
}

const VoiceView: React.FC<VoiceViewProps> = ({ onEndCall, systemInstruction }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback State
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session
  const sessionRef = useRef<any>(null); // To hold the session promise result
  const mountedRef = useRef(true);

  useEffect(() => {
    let cleanup = () => {};

    const startSession = async () => {
      try {
        setError(null);
        setIsConnecting(true);

        // 1. Initialize Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

        // 2. Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // 3. Setup Gemini Live Connection
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Define callbacks
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction,
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // 'Kore' is a calming voice
            },
          },
          callbacks: {
            onopen: () => {
              console.log("Gemini Live Connected");
              if (!mountedRef.current) return;
              setIsConnecting(false);
              
              // Start Input Processing
              if (inputAudioContextRef.current && streamRef.current) {
                const ctx = inputAudioContextRef.current;
                sourceRef.current = ctx.createMediaStreamSource(streamRef.current);
                // Use deprecated ScriptProcessor for raw PCM access (standard for this API usage currently)
                scriptProcessorRef.current = ctx.createScriptProcessor(4096, 1, 1);
                
                scriptProcessorRef.current.onaudioprocess = (e) => {
                  if (isMuted) return; // Don't send data if muted

                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcmBlob = createBlob(inputData);
                  
                  // Send to model
                  sessionPromise.then((session) => {
                      session.sendRealtimeInput({ media: pcmBlob });
                  });
                };

                sourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(ctx.destination);
              }
            },
            onmessage: async (message: LiveServerMessage) => {
              if (!mountedRef.current || !audioContextRef.current) return;

              // Handle Audio Output
              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              
              if (base64Audio) {
                setIsSpeaking(true);
                const ctx = audioContextRef.current;
                
                // Ensure scheduling is smooth
                nextStartTimeRef.current = Math.max(
                  nextStartTimeRef.current,
                  ctx.currentTime
                );

                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                   if (sourcesRef.current.size === 0) {
                     setIsSpeaking(false);
                   }
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }

              // Handle Interruption
              if (message.serverContent?.interrupted) {
                console.log("Interrupted");
                // Stop all currently playing sources
                for (const source of sourcesRef.current) {
                  source.stop();
                }
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
              }
            },
            onclose: () => {
              console.log("Connection closed");
              if (mountedRef.current) onEndCall();
            },
            onerror: (err) => {
              console.error("Connection error", err);
              if (mountedRef.current) setError("Connection failed. Please try again.");
            }
          }
        });
        
        // Store session promise to close later
        sessionRef.current = sessionPromise;

      } catch (err) {
        console.error("Setup error:", err);
        if (mountedRef.current) setError("Could not access microphone or connect. Please check permissions.");
      }
    };

    startSession();

    // Cleanup function
    cleanup = () => {
      mountedRef.current = false;
      
      // Stop streams
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      // Disconnect audio nodes
      sourceRef.current?.disconnect();
      scriptProcessorRef.current?.disconnect();
      
      // Close contexts
      inputAudioContextRef.current?.close();
      audioContextRef.current?.close();

      // Close Gemini Session
      if (sessionRef.current) {
        sessionRef.current.then((session: any) => {
            try {
                session.close();
            } catch(e) {
                console.error("Error closing session", e);
            }
        });
      }
    };

    return cleanup;
  }, [onEndCall, systemInstruction]); // Dependencies essentially static for this component's lifecycle

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Background Ambient Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500 rounded-full blur-[100px] transition-all duration-700 ${isSpeaking ? 'scale-150 opacity-60' : 'scale-100 opacity-30'}`}></div>
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] opacity-30"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Activity className="text-teal-400" size={20} />
            <span className="font-medium tracking-wide text-sm uppercase text-teal-100">Live Voice</span>
         </div>
         <div className="px-3 py-1 bg-white/10 rounded-full text-xs backdrop-blur-md border border-white/10">
            {isConnecting ? 'Connecting...' : 'Secure & Private'}
         </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-8">
        
        {/* Avatar / Visualizer */}
        <div className="relative mb-12">
           {/* Rings */}
           {!isConnecting && isSpeaking && (
              <>
                 <div className="absolute inset-0 rounded-full border border-teal-500/30 animate-pulse-ring"></div>
                 <div className="absolute inset-0 rounded-full border border-teal-400/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
              </>
           )}
           
           <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20 transition-transform duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
              <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center">
                 {isConnecting ? (
                   <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                 ) : (
                    <div className="flex gap-1 items-end h-8">
                       {/* Simple bar visualizer simulation */}
                       <div className={`w-1 bg-teal-400 rounded-full transition-all duration-100 ${isSpeaking ? 'h-8' : 'h-2'}`}></div>
                       <div className={`w-1 bg-teal-400 rounded-full transition-all duration-100 delay-75 ${isSpeaking ? 'h-12' : 'h-3'}`}></div>
                       <div className={`w-1 bg-teal-400 rounded-full transition-all duration-100 delay-150 ${isSpeaking ? 'h-6' : 'h-2'}`}></div>
                       <div className={`w-1 bg-teal-400 rounded-full transition-all duration-100 delay-100 ${isSpeaking ? 'h-10' : 'h-2'}`}></div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="text-center space-y-2 max-w-md">
            <h2 className="text-2xl font-light text-white">
              {isConnecting ? 'Establishing Connection...' : isSpeaking ? 'Lumina is speaking...' : 'Listening...'}
            </h2>
            <p className="text-slate-400 text-sm">
               {error ? error : "Speak naturally. I'm here to listen."}
            </p>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 p-8 pb-12 flex justify-center items-center gap-8">
         <button 
           onClick={toggleMute}
           className={`p-4 rounded-full transition-all duration-200 ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
         >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
         </button>
         
         <button 
           onClick={onEndCall}
           className="p-6 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30 hover:scale-105 transition-all duration-200"
         >
            <PhoneOff size={32} />
         </button>

         {/* Placeholder for future feature, kept for symmetry */}
         <div className="p-4 rounded-full bg-transparent text-transparent pointer-events-none">
            <Volume2 size={24} />
         </div>
      </div>
    </div>
  );
};

export default VoiceView;