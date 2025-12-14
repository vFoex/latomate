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
  'button.reinit': {
    en: 'Reinit',
    fr: 'Réinitialiser',
  },

  // Menu
  'menu.statistics': {
    en: 'Statistics',
    fr: 'Statistiques',
  },
  'menu.settings': {
    en: 'Settings',
    fr: 'Paramètres',
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

  // Options Page
  'options.title': {
    en: 'Settings',
    fr: 'Paramètres',
  },
  'options.tab.general': {
    en: 'General',
    fr: 'Général',
  },
  'options.tab.timer': {
    en: 'Timer',
    fr: 'Minuteur',
  },
  'options.tab.theme': {
    en: 'Theme',
    fr: 'Thème',
  },

  // General Settings
  'general.language': {
    en: 'Language',
    fr: 'Langue',
  },
  'general.language.description': {
    en: 'Choose your preferred language',
    fr: 'Choisissez votre langue préférée',
  },
  'general.notifications': {
    en: 'Notifications',
    fr: 'Notifications',
  },
  'general.notifications.description': {
    en: 'Show notifications when sessions complete',
    fr: 'Afficher les notifications à la fin des sessions',
  },

  // Timer Settings
  'timer.mode': {
    en: 'Timer Mode',
    fr: 'Mode de minuteur',
  },
  'timer.mode.description': {
    en: 'Select your preferred work/break duration pattern',
    fr: 'Sélectionnez votre rythme de travail/pause préféré',
  },
  'timer.mode.pomodoro': {
    en: 'Pomodoro Classic',
    fr: 'Pomodoro Classique',
  },
  'timer.mode.pomodoro.desc': {
    en: '25 min work / 5 min break',
    fr: '25 min travail / 5 min pause',
  },
  'timer.mode.intensive': {
    en: 'Intensive Mode',
    fr: 'Mode Intensif',
  },
  'timer.mode.intensive.desc': {
    en: '45 min work / 15 min break',
    fr: '45 min travail / 15 min pause',
  },
  'timer.mode.52-17': {
    en: 'Developer Mode',
    fr: 'Mode Développeur',
  },
  'timer.mode.52-17.desc': {
    en: '52 min work / 17 min break (popular among devs)',
    fr: '52 min travail / 17 min pause (populaire chez les devs)',
  },
  'timer.mode.custom': {
    en: 'Custom Mode',
    fr: 'Mode Personnalisé',
  },
  'timer.mode.custom.desc': {
    en: 'Set your own durations',
    fr: 'Définissez vos propres durées',
  },
  'timer.custom.work': {
    en: 'Work duration (minutes)',
    fr: 'Durée de travail (minutes)',
  },
  'timer.custom.shortBreak': {
    en: 'Short break (minutes)',
    fr: 'Petite pause (minutes)',
  },
  'timer.custom.longBreak': {
    en: 'Long break (minutes)',
    fr: 'Grande pause (minutes)',
  },
  'timer.custom.interval': {
    en: 'Long break after',
    fr: 'Grande pause après',
  },
  'timer.custom.interval.sessions': {
    en: 'sessions',
    fr: 'sessions',
  },

  // Theme Settings
  'theme.mode': {
    en: 'Theme',
    fr: 'Thème',
  },
  'theme.mode.description': {
    en: 'Choose your color scheme preference',
    fr: 'Choisissez votre préférence de couleurs',
  },
  'theme.light': {
    en: 'Light',
    fr: 'Clair',
  },
  'theme.dark': {
    en: 'Dark',
    fr: 'Sombre',
  },
  'theme.auto': {
    en: 'Auto',
    fr: 'Automatique',
  },
  'theme.auto.description': {
    en: 'Follows your system preference',
    fr: 'Suit les préférences système',
  },

  // Common
  'common.save': {
    en: 'Save',
    fr: 'Enregistrer',
  },
  'common.saved': {
    en: 'Saved!',
    fr: 'Enregistré !',
  },
  'common.cancel': {
    en: 'Cancel',
    fr: 'Annuler',
  },

  // Stats page
  'stats.title': {
    en: 'Statistics',
    fr: 'Statistiques',
  },
  'stats.tabs.overview': {
    en: 'Overview',
    fr: 'Vue d\'ensemble',
  },
  'stats.tabs.details': {
    en: 'Details',
    fr: 'Détails',
  },
  'stats.tabs.charts': {
    en: 'Charts',
    fr: 'Graphiques',
  },
  'stats.tabs.tags': {
    en: 'Tags',
    fr: 'Tags',
  },
  'stats.today': {
    en: 'Today',
    fr: 'Aujourd\'hui',
  },
  'stats.thisWeek': {
    en: 'This Week',
    fr: 'Cette semaine',
  },
  'stats.thisMonth': {
    en: 'This Month',
    fr: 'Ce mois',
  },

  // Tags (v0.5.0+)
  'tags.title': {
    en: 'Tags',
    fr: 'Tags',
  },
  'tags.description': {
    en: 'Organize your sessions with custom tags',
    fr: 'Organisez vos sessions avec des tags personnalisés',
  },
  'tags.addNew': {
    en: 'Add Tag',
    fr: 'Ajouter un tag',
  },
  'tags.tagName': {
    en: 'Tag Name',
    fr: 'Nom du tag',
  },
  'tags.tagColor': {
    en: 'Color',
    fr: 'Couleur',
  },
  'tags.delete': {
    en: 'Delete',
    fr: 'Supprimer',
  },
  'tags.selectTags': {
    en: 'Select tags for this session',
    fr: 'Sélectionnez les tags pour cette session',
  },
  'tags.noTags': {
    en: 'No tags yet. Create one in settings!',
    fr: 'Aucun tag pour le moment. Créez-en un dans les paramètres !',
  },

  'stats.sessions': {
    en: 'Sessions',
    fr: 'Sessions',
  },
  'stats.session': {
    en: 'session',
    fr: 'session',
  },
  'stats.focusTime': {
    en: 'Focus Time',
    fr: 'Temps de focus',
  },
  'stats.currentStreak': {
    en: 'Current Streak',
    fr: 'Série actuelle',
  },
  'stats.days': {
    en: 'days',
    fr: 'jours',
  },
  'stats.hours': {
    en: 'hours',
    fr: 'heures',
  },
  'stats.minutes': {
    en: 'minutes',
    fr: 'minutes',
  },
  'stats.completed': {
    en: 'Completed',
    fr: 'Complétées',
  },
  'stats.interrupted': {
    en: 'Interrupted',
    fr: 'Interrompues',
  },
  'stats.totalSessions': {
    en: 'Total Sessions',
    fr: 'Sessions totales',
  },
  'stats.workSessions': {
    en: 'Work Sessions',
    fr: 'Sessions de travail',
  },
  'stats.completionRate': {
    en: 'Completion Rate',
    fr: 'Taux de complétion',
  },
  'stats.charts.sessionsOverTime': {
    en: 'Sessions Over Time',
    fr: 'Sessions au fil du temps',
  },
  'stats.charts.focusTimeByDay': {
    en: 'Focus Time by Day',
    fr: 'Temps de focus par jour',
  },
  'stats.charts.sessionsByType': {
    en: 'Sessions by Type',
    fr: 'Sessions par type',
  },
  'stats.charts.completionRate': {
    en: 'Completion Rate',
    fr: 'Taux de complétion',
  },
  'stats.charts.work': {
    en: 'Work',
    fr: 'Travail',
  },
  'stats.charts.shortBreak': {
    en: 'Short Break',
    fr: 'Pause courte',
  },
  'stats.charts.longBreak': {
    en: 'Long Break',
    fr: 'Pause longue',
  },
  'stats.charts.last7days': {
    en: 'Last 7 Days',
    fr: '7 derniers jours',
  },
  'stats.charts.last30days': {
    en: 'Last 30 Days',
    fr: '30 derniers jours',
  },
  'stats.activityHeatmap': {
    en: 'Activity Heatmap',
    fr: 'Carte de chaleur d\'activité',
  },
  'stats.last12Months': {
    en: 'in the last 12 months',
    fr: 'dans les 12 derniers mois',
  },
  'stats.less': {
    en: 'Less',
    fr: 'Moins',
  },
  'stats.more': {
    en: 'Plus',
    fr: 'Plus',
  },

  // Feedback Section
  'feedback.title': {
    en: 'Help us improve LaTomate',
    fr: 'Aidez-nous à améliorer LaTomate',
  },
  'feedback.description': {
    en: 'Your feedback helps make LaTomate better for everyone! Share your thoughts, request features, or report issues.',
    fr: 'Vos retours aident à améliorer LaTomate pour tout le monde ! Partagez vos idées, demandez des fonctionnalités ou signalez des problèmes.',
  },
  'feedback.rate': {
    en: 'Rate on Chrome Store',
    fr: 'Noter sur Chrome Store',
  },
  'feedback.suggest': {
    en: 'Suggest a Feature',
    fr: 'Suggérer une fonctionnalité',
  },
  'feedback.bug': {
    en: 'Report a Bug',
    fr: 'Signaler un bug',
  },
  'feedback.note': {
    en: '💡 Your suggestions directly influence our roadmap!',
    fr: '💡 Vos suggestions influencent directement notre feuille de route !',
  },

  // Authentication
  'auth.signIn': {
    en: 'Sign in with Google',
    fr: 'Se connecter avec Google',
  },
  'auth.signOut': {
    en: 'Sign out',
    fr: 'Se déconnecter',
  },
  'auth.loading': {
    en: 'Loading...',
    fr: 'Chargement...',
  },
  'auth.prompt': {
    en: 'Sign in to sync your data across devices',
    fr: 'Connectez-vous pour synchroniser vos données entre appareils',
  },
  'auth.profile': {
    en: 'Profile',
    fr: 'Profil',
  },

  // Sync
  'sync.status': {
    en: 'Sync Status',
    fr: 'État de la synchronisation',
  },
  'sync.syncing': {
    en: 'Syncing...',
    fr: 'Synchronisation...',
  },
  'sync.synced': {
    en: 'Synced',
    fr: 'Synchronisé',
  },
  'sync.error': {
    en: 'Sync error',
    fr: 'Erreur de synchronisation',
  },
  'sync.lastSync': {
    en: 'Last sync',
    fr: 'Dernière synchro',
  },
  'sync.never': {
    en: 'Never',
    fr: 'Jamais',
  },
  'sync.now': {
    en: 'Sync now',
    fr: 'Synchroniser',
  },
  'sync.settings': {
    en: 'Sync Settings',
    fr: 'Paramètres de synchronisation',
  },
  'sync.settingsOnly': {
    en: 'Settings only',
    fr: 'Paramètres uniquement',
  },
  'sync.fullHistory': {
    en: 'Full session history',
    fr: 'Historique complet des sessions',
  },
  'sync.deleteCloud': {
    en: 'Delete all cloud data',
    fr: 'Supprimer toutes les données cloud',
  },
  'sync.deleteConfirm': {
    en: 'Are you sure? This cannot be undone.',
    fr: 'Êtes-vous sûr ? Cette action est irréversible.',
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
