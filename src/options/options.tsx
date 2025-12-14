import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Language, getStoredLanguage, setStoredLanguage, getTranslation } from '../utils/i18n';
import { Theme, getStoredTheme, setStoredTheme, applyTheme, watchSystemTheme } from '../utils/theme';
import { TimerMode, TimerDurations, getStoredTimerMode, setStoredTimerMode, getStoredCustomDurations, setStoredCustomDurations, TIMER_PRESETS } from '../utils/timerModes';
import PageLayout from '../components/PageLayout';
import FeedbackSection from '../components/FeedbackSection';
import AuthButton from '../components/AuthButton';
import { TagsManager } from '../components/TagsManager';
import './options.css';

type Tab = 'general' | 'timer' | 'theme' | 'tags';

interface Settings {
  language: Language;
  theme: Theme;
  timerMode: TimerMode;
  customDurations: TimerDurations;
  notificationsEnabled: boolean;
}

function OptionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // Current saved settings
  const [savedSettings, setSavedSettings] = useState<Settings>({
    language: 'en',
    theme: 'auto',
    timerMode: 'pomodoro',
    customDurations: TIMER_PRESETS.custom,
    notificationsEnabled: true,
  });
  
  // Pending changes (draft)
  const [draftSettings, setDraftSettings] = useState<Settings>({
    language: 'en',
    theme: 'auto',
    timerMode: 'pomodoro',
    customDurations: TIMER_PRESETS.custom,
    notificationsEnabled: true,
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
    
    // Watch for system theme changes when in auto mode
    const unwatch = watchSystemTheme(() => {
      if (savedSettings.theme === 'auto') {
        applyTheme('auto');
      }
    });
    
    return unwatch;
  }, [savedSettings.theme]);

  // Check if there are pending changes (excluding theme)
  useEffect(() => {
    const savedWithoutTheme = { ...savedSettings };
    const draftWithoutTheme = { ...draftSettings };
    delete (savedWithoutTheme as any).theme;
    delete (draftWithoutTheme as any).theme;
    
    const changed = JSON.stringify(savedWithoutTheme) !== JSON.stringify(draftWithoutTheme);
    setHasChanges(changed);
  }, [savedSettings, draftSettings]);

  async function loadSettings() {
    const [lang, themeValue, mode, customDur, notifEnabled] = await Promise.all([
      getStoredLanguage(),
      getStoredTheme(),
      getStoredTimerMode(),
      getStoredCustomDurations(),
      getNotificationsEnabled(),
    ]);
    
    const loadedSettings: Settings = {
      language: lang,
      theme: themeValue,
      timerMode: mode,
      customDurations: customDur,
      notificationsEnabled: notifEnabled,
    };
    
    setSavedSettings(loadedSettings);
    setDraftSettings(loadedSettings);
    applyTheme(themeValue);
  }

  async function getNotificationsEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['notificationsEnabled'], (result) => {
        resolve(result.notificationsEnabled ?? true);
      });
    });
  }

  async function setNotificationsEnabledStorage(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ notificationsEnabled: enabled }, () => {
        resolve();
      });
    });
  }

  const t = (key: string) => getTranslation(key, draftSettings.language);

  // Draft change handlers (don't save immediately)
  function handleLanguageChange(newLang: Language) {
    setDraftSettings({ ...draftSettings, language: newLang });
  }

  async function handleThemeChange(newTheme: Theme) {
    // Theme changes are applied and saved immediately
    setDraftSettings({ ...draftSettings, theme: newTheme });
    setSavedSettings({ ...savedSettings, theme: newTheme });
    await setStoredTheme(newTheme);
    applyTheme(newTheme);
  }

  function handleTimerModeChange(newMode: TimerMode) {
    setDraftSettings({ ...draftSettings, timerMode: newMode });
  }

  function handleCustomDurationChange(field: keyof TimerDurations, value: number) {
    const newDurations = { ...draftSettings.customDurations, [field]: value };
    setDraftSettings({ ...draftSettings, customDurations: newDurations });
  }

  function handleNotificationsToggle(enabled: boolean) {
    setDraftSettings({ ...draftSettings, notificationsEnabled: enabled });
  }

  // Save all changes at once (excluding theme which is auto-saved)
  async function handleSave() {
    setSaveStatus('saving');
    
    try {
      await Promise.all([
        setStoredLanguage(draftSettings.language),
        // Theme already saved immediately, no need to save again
        setStoredTimerMode(draftSettings.timerMode),
        setStoredCustomDurations(draftSettings.customDurations),
        setNotificationsEnabledStorage(draftSettings.notificationsEnabled),
      ]);
      
      setSavedSettings(draftSettings);
      setSaveStatus('saved');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('idle');
    }
  }

  // Cancel changes and revert to saved
  function handleCancel() {
    setDraftSettings(savedSettings);
    applyTheme(savedSettings.theme);
  }

  return (
    <PageLayout
      title={t('options.title')}
      icon={<img src="/icons/icon48.png" alt="LaTomate" />}
      language={savedSettings.language}
    >
      <nav className="options-tabs">
        <button
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span className="material-symbols-outlined icon-md">settings</span> {t('options.tab.general')}
        </button>
        <button
          className={`tab-button ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          <span className="material-symbols-outlined icon-md">timer</span> {t('options.tab.timer')}
        </button>
        <button
          className={`tab-button ${activeTab === 'theme' ? 'active' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          <span className="material-symbols-outlined icon-md">palette</span> {t('options.tab.theme')}
        </button>
        <button
          className={`tab-button ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          <span className="material-symbols-outlined icon-md">label</span> {t('tags.title')}
        </button>
      </nav>

      <main className="options-main">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>{t('options.tab.general')}</h2>
              
              <div className="setting-item">
                <label>
                  <div className="setting-label">
                    <strong>{t('general.language')}</strong>
                    <span className="setting-description">{t('general.language.description')}</span>
                  </div>
                  <select 
                    value={draftSettings.language} 
                    onChange={(e) => handleLanguageChange(e.target.value as Language)}
                    className="select-input"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </label>
              </div>

              <div className="setting-item">
                <label className="toggle-label">
                  <div className="setting-label">
                    <strong>{t('general.notifications')}</strong>
                    <span className="setting-description">{t('general.notifications.description')}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftSettings.notificationsEnabled}
                    onChange={(e) => handleNotificationsToggle(e.target.checked)}
                    className="toggle-input"
                  />
                </label>
              </div>

              {/* Cloud Sync / Auth */}
              <AuthButton language={savedSettings.language} />

              {/* Feedback Section */}
              <FeedbackSection language={savedSettings.language} />
            </div>
          )}

          {activeTab === 'timer' && (
            <div className="settings-section">
              <h2>{t('timer.mode')}</h2>
              <p className="section-description">{t('timer.mode.description')}</p>
              
              <div className="timer-modes">
                <label className={`mode-card ${draftSettings.timerMode === 'pomodoro' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="pomodoro"
                    checked={draftSettings.timerMode === 'pomodoro'}
                    onChange={() => handleTimerModeChange('pomodoro')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.pomodoro')}</strong>
                    <span className="mode-description">{t('timer.mode.pomodoro.desc')}</span>
                  </div>
                </label>

                <label className={`mode-card ${draftSettings.timerMode === 'intensive' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="intensive"
                    checked={draftSettings.timerMode === 'intensive'}
                    onChange={() => handleTimerModeChange('intensive')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.intensive')}</strong>
                    <span className="mode-description">{t('timer.mode.intensive.desc')}</span>
                  </div>
                </label>

                <label className={`mode-card ${draftSettings.timerMode === '52-17' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="52-17"
                    checked={draftSettings.timerMode === '52-17'}
                    onChange={() => handleTimerModeChange('52-17')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.52-17')}</strong>
                    <span className="mode-description">{t('timer.mode.52-17.desc')}</span>
                  </div>
                </label>

                <label className={`mode-card ${draftSettings.timerMode === 'custom' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="custom"
                    checked={draftSettings.timerMode === 'custom'}
                    onChange={() => handleTimerModeChange('custom')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.custom')}</strong>
                    <span className="mode-description">{t('timer.mode.custom.desc')}</span>
                  </div>
                </label>
              </div>

              {draftSettings.timerMode === 'custom' && (
                <div className="custom-durations">
                  <h3>{t('timer.mode.custom')}</h3>
                  <div className="duration-inputs">
                    <label>
                      <span>{t('timer.custom.work')}</span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={draftSettings.customDurations.work}
                        onChange={(e) => handleCustomDurationChange('work', parseInt(e.target.value) || 1)}
                        className="number-input"
                      />
                    </label>
                    <label>
                      <span>{t('timer.custom.shortBreak')}</span>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={draftSettings.customDurations.shortBreak}
                        onChange={(e) => handleCustomDurationChange('shortBreak', parseInt(e.target.value) || 1)}
                        className="number-input"
                      />
                    </label>
                    <label>
                      <span>{t('timer.custom.longBreak')}</span>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={draftSettings.customDurations.longBreak}
                        onChange={(e) => handleCustomDurationChange('longBreak', parseInt(e.target.value) || 1)}
                        className="number-input"
                      />
                    </label>
                    <label>
                      <span>{t('timer.custom.interval')} ({t('timer.custom.interval.sessions')})</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={draftSettings.customDurations.longBreakInterval}
                        onChange={(e) => handleCustomDurationChange('longBreakInterval', parseInt(e.target.value) || 1)}
                        className="number-input"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="settings-section">
              <h2>{t('theme.mode')}</h2>
              <p className="section-description">{t('theme.mode.description')}</p>
              
              <div className="theme-options">
                <label className={`theme-card ${draftSettings.theme === 'light' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={draftSettings.theme === 'light'}
                    onChange={() => handleThemeChange('light')}
                  />
                  <div className="theme-preview light-preview">
                    <div className="preview-header"></div>
                    <div className="preview-content"></div>
                  </div>
                  <strong>{t('theme.light')}</strong>
                </label>

                <label className={`theme-card ${draftSettings.theme === 'dark' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={draftSettings.theme === 'dark'}
                    onChange={() => handleThemeChange('dark')}
                  />
                  <div className="theme-preview dark-preview">
                    <div className="preview-header"></div>
                    <div className="preview-content"></div>
                  </div>
                  <strong>{t('theme.dark')}</strong>
                </label>

                <label className={`theme-card ${draftSettings.theme === 'auto' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={draftSettings.theme === 'auto'}
                    onChange={() => handleThemeChange('auto')}
                  />
                  <div className="theme-preview auto-preview">
                    <div className="preview-split">
                      <div className="preview-half light"></div>
                      <div className="preview-half dark"></div>
                    </div>
                  </div>
                  <strong>{t('theme.auto')}</strong>
                  <span className="theme-description">{t('theme.auto.description')}</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="settings-section">
              <h2>{t('tags.title')}</h2>
              <p className="section-description">{t('tags.description')}</p>
              <TagsManager language={savedSettings.language} />
            </div>
          )}
        </main>

      {/* Save Portal - appears when there are unsaved changes */}
      {hasChanges && (
        <div className="save-portal">
          <div className="save-portal-content">
            {saveStatus === 'saved' ? (
              <div className="save-success">
                <span className="success-icon">✓</span>
                <span>{t('common.saved')}</span>
              </div>
            ) : (
              <div className="save-portal-actions">
                <button 
                  className="btn-cancel" 
                  onClick={handleCancel}
                  disabled={saveStatus === 'saving'}
                >
                  {t('common.cancel')}
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Saving...' : t('common.save')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<OptionsPage />);
