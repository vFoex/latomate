// Internationalization utilities for LaTomate

export type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  // App title
  'app.title': {
    en: 'LaTomate',
    fr: 'LaTomate',
  },
  'app.madeBy': {
    en: 'Made by',
    fr: 'Fait par',
  },

  // Session types
  'session.work': {
    en: 'Work Session',
    fr: 'Session de travail',
  },
  'session.shortBreak': {
    en: 'Short Break',
    fr: 'Petite pause',
  },
  'session.longBreak': {
    en: 'Long Break',
    fr: 'Grande pause',
  },

  // Buttons
  'button.start': {
    en: 'Start',
    fr: 'Démarrer',
  },
  'button.resume': {
    en: 'Resume',
    fr: 'Reprendre',
  },
  'button.pause': {
    en: 'Pause',
    fr: 'Pause',
  },
  'button.reset': {
    en: 'Reset',
    fr: 'Reset',
  },

  // Stats
  'stats.completedPomodoros': {
    en: 'Completed Pomodoros',
    fr: 'Pomodoros complétés',
  },

  // Notifications
  'notification.workComplete': {
    en: 'Work session complete! Take a break.',
    fr: 'Session de travail terminée ! Prenez une pause.',
  },
  'notification.breakComplete': {
    en: 'Break complete! Ready for a new session?',
    fr: 'Pause terminée ! Prêt pour une nouvelle session ?',
  },
};

export function getTranslation(key: string, lang: Language = 'en'): string {
  return translations[key]?.[lang] || key;
}

export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}

export function getStoredLanguage(): Promise<Language> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      resolve(result.language || getBrowserLanguage());
    });
  });
}

export function setStoredLanguage(lang: Language): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ language: lang }, () => {
      resolve();
    });
  });
}
