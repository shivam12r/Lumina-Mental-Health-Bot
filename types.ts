export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ViewMode = 'onboarding' | 'chat' | 'voice';

export interface ResourceLink {
  name: string;
  phone?: string;
  url?: string;
  description: string;
}

export const CRISIS_RESOURCES: ResourceLink[] = [
  {
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    url: "https://988lifeline.org",
    description: "24/7, free and confidential support."
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
    description: "Free, 24/7 support via text."
  },
  {
    name: "The Trevor Project",
    phone: "1-866-488-7386",
    url: "https://www.thetrevorproject.org",
    description: "Crisis intervention for LGBTQ+ youth."
  }
];