
import { DailyDigest, UserProfile, PersonaType, SavedInsight, DigestSection, UserNote, NotificationFrequency, SubscriptionStatus, SubscriptionPlan } from '../types';

const TOPICS_KEY = 'ai_digest_topics';
const DIGESTS_KEY = 'ai_digest_history';
const PROFILE_KEY = 'ai_digest_profile';
const COLLECTION_KEY = 'ai_digest_collection';
const NOTES_KEY = 'ai_digest_notes';
const SECRET_CODE = 'AK2026'; // The code to unlock lifetime access

export const getSelectedTopicIds = (): string[] => {
  const stored = localStorage.getItem(TOPICS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSelectedTopicIds = (ids: string[]) => {
  localStorage.setItem(TOPICS_KEY, JSON.stringify(ids));
};

export const getDigests = (): DailyDigest[] => {
  const stored = localStorage.getItem(DIGESTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveDigest = (digest: DailyDigest) => {
  const current = getDigests();
  const existsIndex = current.findIndex(d => d.id === digest.id);
  
  if (existsIndex >= 0) {
    current[existsIndex] = digest;
  } else {
    current.unshift(digest);
    updateStreak(); // Update streak when saving a new digest
  }
  
  localStorage.setItem(DIGESTS_KEY, JSON.stringify(current));
};

export const deleteDigest = (id: string) => {
  const current = getDigests();
  const updated = current.filter(d => d.id !== id);
  localStorage.setItem(DIGESTS_KEY, JSON.stringify(updated));
};

export const getDigestById = (id: string): DailyDigest | undefined => {
  const digests = getDigests();
  return digests.find(d => d.id === id);
};

// --- SAVED COLLECTION (INSIGHTS) ---

export const getSavedInsights = (): SavedInsight[] => {
  const stored = localStorage.getItem(COLLECTION_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveInsight = (section: DigestSection, sourceDigestId: string, sourceDigestDate: string) => {
  const current = getSavedInsights();
  // Unique ID based on title + date
  const id = `${sourceDigestId}-${section.title.substring(0, 10).replace(/\s+/g, '')}`;
  
  // Avoid duplicates
  if (current.some(i => i.id === id)) return;

  const newInsight: SavedInsight = {
    id,
    section,
    savedAt: Date.now(),
    sourceDigestId,
    sourceDigestDate
  };

  localStorage.setItem(COLLECTION_KEY, JSON.stringify([newInsight, ...current]));
};

export const removeInsight = (id: string) => {
  const current = getSavedInsights();
  const updated = current.filter(i => i.id !== id);
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updated));
};

export const isInsightSaved = (sectionTitle: string, sourceDigestId: string): boolean => {
  const current = getSavedInsights();
  const id = `${sourceDigestId}-${sectionTitle.substring(0, 10).replace(/\s+/g, '')}`;
  return current.some(i => i.id === id);
};

// --- USER NOTES (MYŠLIENKY) ---

export const getNotes = (): UserNote[] => {
  const stored = localStorage.getItem(NOTES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveNote = (text: string) => {
  const current = getNotes();
  const newNote: UserNote = {
    id: Date.now().toString(),
    text,
    createdAt: Date.now()
  };
  localStorage.setItem(NOTES_KEY, JSON.stringify([newNote, ...current]));
};

export const deleteNote = (id: string) => {
  const current = getNotes();
  const updated = current.filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
};

// --- USER PROFILE & SUBSCRIPTION ---

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(PROFILE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Backward compatibility & Safety checks
    if (!parsed.theme || (parsed.theme !== 'light' && parsed.theme !== 'dark')) {
        parsed.theme = 'light'; 
    }
    if (!parsed.notificationFrequency) parsed.notificationFrequency = NotificationFrequency.DAILY;
    
    // Initialize Subscription if missing
    if (!parsed.subscriptionStatus) {
        parsed.subscriptionStatus = SubscriptionStatus.TRIAL;
        parsed.subscriptionPlan = SubscriptionPlan.NONE;
        parsed.trialStartDate = Date.now();
    }

    // Initialize Completed Topics if missing
    if (!parsed.completedLearningTopics) {
        parsed.completedLearningTopics = [];
    }

    // Initialize Activity History if missing
    if (!parsed.activityHistory) {
        parsed.activityHistory = [];
        parsed.longestStreak = parsed.streak || 0;
    }
    
    return parsed;
  }
  return {
    streak: 0,
    longestStreak: 0,
    activityHistory: [],
    lastVisit: '',
    totalDigests: 0,
    selectedPersona: PersonaType.DEFAULT,
    city: 'Bratislava',
    theme: 'light', // Default to light
    notificationFrequency: NotificationFrequency.DAILY,
    lastNotification: 0,
    // New Subscription Defaults
    subscriptionStatus: SubscriptionStatus.TRIAL,
    subscriptionPlan: SubscriptionPlan.NONE,
    trialStartDate: Date.now(),
    completedLearningTopics: []
  };
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const markLearningTopicComplete = (topic: string) => {
    const profile = getUserProfile();
    // Case insensitive check
    if (!profile.completedLearningTopics.some(t => t.toLowerCase() === topic.toLowerCase())) {
        saveUserProfile({
            ...profile,
            completedLearningTopics: [...profile.completedLearningTopics, topic]
        });
    }
};

export const getTrialDaysLeft = (): number => {
    const profile = getUserProfile();
    if (profile.subscriptionStatus !== SubscriptionStatus.TRIAL) return 0;
    
    const now = Date.now();
    const trialLength = 7 * 24 * 60 * 60 * 1000;
    const diff = now - profile.trialStartDate;
    const remaining = Math.max(0, Math.ceil((trialLength - diff) / (24 * 60 * 60 * 1000)));
    return remaining;
};

// Check if user has access
export const checkSubscriptionAccess = (): boolean => {
    const profile = getUserProfile();
    
    if (profile.subscriptionStatus === SubscriptionStatus.LIFETIME) return true;
    if (profile.subscriptionStatus === SubscriptionStatus.ACTIVE) {
        // In real app, check receipt expiry date here
        return true;
    }

    if (profile.subscriptionStatus === SubscriptionStatus.TRIAL) {
        const now = Date.now();
        const trialLength = 7 * 24 * 60 * 60 * 1000; // 7 days
        const diff = now - profile.trialStartDate;
        
        if (diff > trialLength) {
            // Trial Expired
            const updated = { ...profile, subscriptionStatus: SubscriptionStatus.EXPIRED };
            saveUserProfile(updated);
            return false;
        }
        return true;
    }

    return false; // Expired
};

// Activate plan (Mock payment success)
export const activateSubscription = (plan: SubscriptionPlan) => {
    const profile = getUserProfile();
    saveUserProfile({
        ...profile,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionPlan: plan,
        subscriptionExpiryDate: Date.now() + (plan === SubscriptionPlan.YEARLY ? 31536000000 : 2592000000)
    });
};

// Unlock via Secret Code
export const redeemSecretCode = (code: string): boolean => {
    if (code.trim() === SECRET_CODE) {
        const profile = getUserProfile();
        saveUserProfile({
            ...profile,
            subscriptionStatus: SubscriptionStatus.LIFETIME,
            subscriptionPlan: SubscriptionPlan.NONE
        });
        return true;
    }
    return false;
};

// TESTING HELPER: Force expire the trial to test UI
export const simulateTrialExpiry = () => {
    const profile = getUserProfile();
    // Set start date to 8 days ago
    const pastDate = Date.now() - (8 * 24 * 60 * 60 * 1000);
    saveUserProfile({
        ...profile,
        subscriptionStatus: SubscriptionStatus.TRIAL, // Will be auto-converted to EXPIRED on check
        trialStartDate: pastDate
    });
};


export const updateStreak = () => {
  const profile = getUserProfile();
  const today = new Date().toISOString().split('T')[0];
  
  if (profile.lastVisit === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = profile.streak;

  if (profile.lastVisit === yesterdayStr) {
    newStreak += 1;
  } else {
    newStreak = 1; // Reset streak if missed a day
  }

  const newLongest = Math.max(profile.longestStreak || 0, newStreak);
  const newHistory = profile.activityHistory ? [...profile.activityHistory] : [];
  if (!newHistory.includes(today)) {
      newHistory.push(today);
  }

  saveUserProfile({
    ...profile,
    streak: newStreak,
    longestStreak: newLongest,
    activityHistory: newHistory,
    lastVisit: today,
    totalDigests: profile.totalDigests + 1
  });
};

export const setPersona = (persona: PersonaType) => {
  const profile = getUserProfile();
  saveUserProfile({ ...profile, selectedPersona: persona });
};

export const toggleTheme = () => {
  const profile = getUserProfile();
  const newTheme = profile.theme === 'dark' ? 'light' : 'dark';
  saveUserProfile({ ...profile, theme: newTheme });
  return newTheme;
};

export const updateLastNotification = () => {
  const profile = getUserProfile();
  saveUserProfile({ ...profile, lastNotification: Date.now() });
};

// --- DATA BACKUP & RESTORE (The "Database" Feature) ---

export const exportUserData = (): string => {
  const data = {
    profile: getUserProfile(),
    topics: getSelectedTopicIds(),
    savedInsights: getSavedInsights(),
    notes: getNotes(),
    // We generally don't export digest history to keep file size small, but can if needed
  };
  return JSON.stringify(data);
};

export const importUserData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveUserProfile(data.profile);
    if (data.topics) saveSelectedTopicIds(data.topics);
    if (data.savedInsights) localStorage.setItem(COLLECTION_KEY, JSON.stringify(data.savedInsights));
    if (data.notes) localStorage.setItem(NOTES_KEY, JSON.stringify(data.notes));
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

// --- HARD RESET (Account Deletion Compliance) ---
export const hardResetApp = () => {
    localStorage.clear();
    window.location.reload();
};
