import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Language, getStoredLanguage, setStoredLanguage, getTranslation } from '../utils/i18n';
import { Theme, getStoredTheme, setStoredTheme, applyTheme, watchSystemTheme } from '../utils/theme';
import { TimerMode, TimerDurations, getStoredTimerMode, setStoredTimerMode, getStoredCustomDurations, setStoredCustomDurations, TIMER_PRESETS } from '../utils/timerModes';
import './options.css';

type Tab = 'general' | 'timer' | 'theme';

function OptionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('auto');
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [customDurations, setCustomDurations] = useState<TimerDurations>(TIMER_PRESETS.custom);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    loadSettings();
    
    // Watch for system theme changes when in auto mode
    const unwatch = watchSystemTheme(() => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    });
    
    return unwatch;
  }, [theme]);

  async function loadSettings() {
    const [lang, themeValue, mode, customDur, notifEnabled] = await Promise.all([
      getStoredLanguage(),
      getStoredTheme(),
      getStoredTimerMode(),
      getStoredCustomDurations(),
      getNotificationsEnabled(),
    ]);
    
    setLanguage(lang);
    setTheme(themeValue);
    setTimerMode(mode);
    setCustomDurations(customDur);
    setNotificationsEnabled(notifEnabled);
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

  const t = (key: string) => getTranslation(key, language);

  async function handleLanguageChange(newLang: Language) {
    setLanguage(newLang);
    await setStoredLanguage(newLang);
    showSaveStatus();
  }

  async function handleThemeChange(newTheme: Theme) {
    setTheme(newTheme);
    await setStoredTheme(newTheme);
    applyTheme(newTheme);
    showSaveStatus();
  }

  async function handleTimerModeChange(newMode: TimerMode) {
    setTimerMode(newMode);
    await setStoredTimerMode(newMode);
    showSaveStatus();
  }

  async function handleCustomDurationChange(field: keyof TimerDurations, value: number) {
    const newDurations = { ...customDurations, [field]: value };
    setCustomDurations(newDurations);
    await setStoredCustomDurations(newDurations);
    showSaveStatus();
  }

  async function handleNotificationsToggle(enabled: boolean) {
    setNotificationsEnabled(enabled);
    await setNotificationsEnabledStorage(enabled);
    showSaveStatus();
  }

  function showSaveStatus() {
    setSaveStatus(t('common.saved'));
    setTimeout(() => setSaveStatus(''), 2000);
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>
          <img src="/icons/icon48.png" alt="LaTomate" className="header-icon" />
          {t('options.title')}
        </h1>
        {saveStatus && <span className="save-status">{saveStatus}</span>}
      </header>

      <div className="options-content">
        <nav className="options-tabs">
          <button
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ {t('options.tab.general')}
          </button>
          <button
            className={`tab-button ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            ⏱️ {t('options.tab.timer')}
          </button>
          <button
            className={`tab-button ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            🎨 {t('options.tab.theme')}
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
                    value={language} 
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
                    checked={notificationsEnabled}
                    onChange={(e) => handleNotificationsToggle(e.target.checked)}
                    className="toggle-input"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'timer' && (
            <div className="settings-section">
              <h2>{t('timer.mode')}</h2>
              <p className="section-description">{t('timer.mode.description')}</p>
              
              <div className="timer-modes">
                <label className={`mode-card ${timerMode === 'pomodoro' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="pomodoro"
                    checked={timerMode === 'pomodoro'}
                    onChange={() => handleTimerModeChange('pomodoro')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.pomodoro')}</strong>
                    <span className="mode-description">{t('timer.mode.pomodoro.desc')}</span>
                  </div>
                </label>

                <label className={`mode-card ${timerMode === 'intensive' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="intensive"
                    checked={timerMode === 'intensive'}
                    onChange={() => handleTimerModeChange('intensive')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.intensive')}</strong>
                    <span className="mode-description">{t('timer.mode.intensive.desc')}</span>
                  </div>
                </label>

                <label className={`mode-card ${timerMode === '52-17' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="52-17"
                    checked={timerMode === '52-17'}
                    onChange={() => handleTimerModeChange('52-17')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.52-17')}</strong>
                    <span className="mode-description">{t('timer.mode.52-17.desc')}</span>
                  </div>
                </label>

                <label className={`mode-card ${timerMode === 'custom' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timerMode"
                    value="custom"
                    checked={timerMode === 'custom'}
                    onChange={() => handleTimerModeChange('custom')}
                  />
                  <div className="mode-content">
                    <strong>{t('timer.mode.custom')}</strong>
                    <span className="mode-description">{t('timer.mode.custom.desc')}</span>
                  </div>
                </label>
              </div>

              {timerMode === 'custom' && (
                <div className="custom-durations">
                  <h3>{t('timer.mode.custom')}</h3>
                  <div className="duration-inputs">
                    <label>
                      <span>{t('timer.custom.work')}</span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={customDurations.work}
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
                        value={customDurations.shortBreak}
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
                        value={customDurations.longBreak}
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
                        value={customDurations.longBreakInterval}
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
                <label className={`theme-card ${theme === 'light' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => handleThemeChange('light')}
                  />
                  <div className="theme-preview light-preview">
                    <div className="preview-header"></div>
                    <div className="preview-content"></div>
                  </div>
                  <strong>{t('theme.light')}</strong>
                </label>

                <label className={`theme-card ${theme === 'dark' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => handleThemeChange('dark')}
                  />
                  <div className="theme-preview dark-preview">
                    <div className="preview-header"></div>
                    <div className="preview-content"></div>
                  </div>
                  <strong>{t('theme.dark')}</strong>
                </label>

                <label className={`theme-card ${theme === 'auto' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={theme === 'auto'}
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
        </main>
      </div>

      <footer className="options-footer">
        <p>
          <img src="/icons/icon16.png" alt="LaTomate" className="footer-icon" />
          LaTomate v0.2.0 • {t('app.madeBy')} <a href="https://github.com/vFoex" target="_blank" rel="noopener noreferrer">vFoex</a>
        </p>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<OptionsPage />);
