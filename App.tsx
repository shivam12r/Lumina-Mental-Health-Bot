import React, { useState } from 'react';
import { MessageCircle, Mic, Heart, ShieldCheck, Sun } from 'lucide-react';
import ChatView from './components/ChatView';
import VoiceView from './components/VoiceView';
import CrisisResources from './components/CrisisResources';
import { ViewMode } from './types';

const SYSTEM_INSTRUCTION = `You are Lumina, a warm, compassionate, and supportive AI companion for a teenager dealing with anxiety and depression. 
Your tone is calm, non-judgmental, and validating. 
You are NOT a mental health professional, therapist, or doctor. 
If the user mentions self-harm, suicide, or severe crisis, you MUST gently but firmly encourage them to seek help from a trusted adult or emergency services, and provide the 988 lifeline number.
For general anxiety/depression:
1. Validate their feelings ("It makes sense you feel that way").
2. Ask open-ended questions to help them process.
3. Suggest simple grounding techniques (e.g., box breathing, naming 5 things they see) if they seem overwhelmed.
4. Keep voice responses concise (1-3 sentences) to maintain a natural conversation flow.
5. Never diagnose.
`;

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('onboarding');

  const renderContent = () => {
    switch (viewMode) {
      case 'chat':
        return <ChatView onBack={() => setViewMode('onboarding')} systemInstruction={SYSTEM_INSTRUCTION} />;
      case 'voice':
        return <VoiceView onEndCall={() => setViewMode('onboarding')} systemInstruction={SYSTEM_INSTRUCTION} />;
      default:
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            <header className="p-6 md:p-8">
               <div className="flex items-center gap-2 mb-2 text-teal-600">
                  <Sun size={24} />
                  <span className="font-semibold tracking-tight uppercase text-xs">Lumina AI</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-light text-slate-800 mb-2">
                 Hi, friend. <br />
                 <span className="font-semibold text-teal-600">How are you feeling?</span>
               </h1>
               <p className="text-slate-500 max-w-md">
                 I'm here to listen, support, and help you find your calm. No judgment, just a safe space to be you.
               </p>
            </header>

            <main className="flex-1 px-6 md:px-8 pb-8 max-w-3xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setViewMode('chat')}
                  className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-teal-200 transition-all text-left"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageCircle size={80} className="text-teal-600" />
                  </div>
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">Text Chat</h3>
                  <p className="text-sm text-slate-500">Write down your thoughts at your own pace.</p>
                </button>

                <button 
                  onClick={() => setViewMode('voice')}
                  className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-left text-white"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                    <Mic size={80} className="text-white" />
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Mic size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">Voice Call</h3>
                    <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">LIVE</span>
                  </div>
                  <p className="text-sm text-indigo-100">Talk it out in real-time. Just like a phone call.</p>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                 <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm uppercase tracking-wider font-medium">
                    <ShieldCheck size={16} />
                    <span>Safe Space Promise</span>
                 </div>
                 <p className="text-slate-600 text-sm leading-relaxed mb-4">
                   Your conversations with Lumina are private. I'm an AI designed to help you navigate tough emotions, but I'm not a replacement for a human therapist or doctor.
                 </p>
                 <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs">
                      <Heart size={12} className="text-rose-400" /> Anxiety Support
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs">
                      <Heart size={12} className="text-rose-400" /> Depression Help
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs">
                      <Heart size={12} className="text-rose-400" /> Coping Skills
                    </span>
                 </div>
              </div>

              <CrisisResources />
            </main>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-200">
         {renderContent()}
      </div>
    </div>
  );
};

export default App;