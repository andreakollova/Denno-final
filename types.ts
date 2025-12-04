
export interface Article {
  title: string;
  summary: string;
  link: string;
  published: string; // ISO date string
  source: string;
  imageUrl?: string;
}

export interface DigestSection {
  title: string;
  whatIsNew: string;
  whatChanged: string;
  keyPoints: string[]; // Changed: 5 bullet points summary
  tags: string[];
  sourceTitle?: string; 
  sourceLink?: string; 
  whatToWatch?: string; // Legacy field for backward compatibility
}

export interface BusyItem {
  title: string;
  summary: string;
}

export interface DailyDigest {
  id: string; // usually YYYY-MM-DD
  date: string; // ISO date string
  mainTitle: string;
  oneSentenceOverview: string; 
  busyRead: BusyItem[]; 
  sections: DigestSection[]; 
  sourceArticles: Article[]; 
  createdAt: number;
  personaUsed: string;
}

export interface SavedInsight {
  id: string;
  section: DigestSection;
  savedAt: number;
  sourceDigestId: string;
  sourceDigestDate: string;
}

export interface UserNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface Topic {
  id: string;
  name: string;
  rssUrls: string[];
  category: string;
}

export enum NotificationFrequency {
  DAILY = 'daily',
  EVERY_OTHER = 'every_other',
  THREE_TIMES_DAY = 'three_times',
  WEEKLY = 'weekly',
  OFF = 'off'
}

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  LIFETIME = 'lifetime'
}

export enum SubscriptionPlan {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  NONE = 'none'
}

export interface UserProfile {
  streak: number;
  longestStreak: number; // New field
  activityHistory: string[]; // New field: List of YYYY-MM-DD dates
  lastVisit: string;
  totalDigests: number;
  selectedPersona: PersonaType;
  city?: string;
  theme: 'light' | 'dark';
  notificationFrequency: NotificationFrequency;
  lastNotification?: number;
  // Subscription fields
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  trialStartDate: number;
  subscriptionExpiryDate?: number;
  // Learning Progress
  completedLearningTopics: string[];
}

export interface LearningPack {
  topic: string;
  definition: string;
  history: string;
  keyConcepts: string[];
  futureOutlook: string;
  quizQuestion: string;
}

export enum PersonaType {
  DEFAULT = 'default',
  CEO = 'ceo',
  ELI5 = 'eli5',
  NERD = 'nerd'
}

export enum AppTab {
  DIGEST = 'digest',
  HISTORY = 'history', // Kept for logic compatibility, mapped to "Uložené"
  TOOLS = 'tools',
  SETTINGS = 'settings'
}
