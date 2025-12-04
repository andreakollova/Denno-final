import { NotificationFrequency, UserProfile } from '../types';
import { updateLastNotification, getUserProfile } from './storageService';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    alert("Tento prehliadač nepodporuje notifikácie.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    // If on mobile PWA, sometimes vibration helps
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    
    const options = {
      body,
      icon: 'https://cdn.shopify.com/s/files/1/0804/4226/1839/files/54325342.png?v=1764569599', // App Logo
      badge: 'https://cdn.shopify.com/s/files/1/0804/4226/1839/files/54325342.png?v=1764569599',
      tag: 'ai-digest-update'
    };
    
    new Notification(title, options);
    updateLastNotification();
  }
};

export const checkAndTriggerNotification = () => {
  const profile = getUserProfile();
  const freq = profile.notificationFrequency;
  
  if (freq === NotificationFrequency.OFF) return;
  if (Notification.permission !== "granted") return;

  const now = Date.now();
  const last = profile.lastNotification || 0;
  const hoursSinceLast = (now - last) / (1000 * 60 * 60);
  const currentHour = new Date().getHours();

  let shouldNotify = false;
  let title = "Tvoj denný prehľad";
  let body = "Nové správy sú pripravené. Poď sa pozrieť, čo je nové.";

  switch (freq) {
    case NotificationFrequency.DAILY:
      // Notify if it's past 9 AM and we haven't notified in 20 hours
      if (currentHour >= 9 && hoursSinceLast > 20) {
        shouldNotify = true;
        title = "Ranný prehľad je hotový ☕";
        body = "Váš denný súhrn noviniek čaká. Začnite deň informovane.";
      }
      break;

    case NotificationFrequency.THREE_TIMES_DAY:
      // 9 AM, 1 PM, 6 PM
      // If we are in a slot and haven't notified in 3 hours
      if (hoursSinceLast > 3) {
         if (currentHour >= 9 && currentHour < 13) {
            shouldNotify = true;
            title = "Ranný update ☀️";
         } else if (currentHour >= 13 && currentHour < 18) {
            shouldNotify = true;
            title = "Poobedný briefing 🥪";
         } else if (currentHour >= 18) {
            shouldNotify = true;
            title = "Večerný súhrn 🌙";
         }
      }
      break;

    case NotificationFrequency.EVERY_OTHER:
      // Notify if > 46 hours passed and it's morning
      if (currentHour >= 9 && hoursSinceLast > 46) {
        shouldNotify = true;
        title = "Čerstvé novinky";
      }
      break;

    case NotificationFrequency.WEEKLY:
      // Notify if it's Monday morning and > 6 days passed
      const day = new Date().getDay(); // 1 = Monday
      if (day === 1 && currentHour >= 9 && hoursSinceLast > 150) {
        shouldNotify = true;
        title = "Týždenný špeciál 📅";
        body = "Prehľad najdôležitejších udalostí za tento týždeň.";
      }
      break;
  }

  if (shouldNotify) {
    sendNotification(title, body);
  }
};