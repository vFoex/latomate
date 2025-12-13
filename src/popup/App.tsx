import { useState, useEffect } from 'react';
import { getTranslation, getStoredLanguage, type Language } from '../utils/i18n';
import { getStoredTheme, applyTheme, watchSystemTheme } from '../utils/theme';
import { getActiveTimerDurations, type TimerDurations } from '../utils/timerModes';
import '../styles/icons.css';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface StoredTimerState {
  isRunning: boolean;
  isPaused: boolean;
  endTime: number | null;
  sessionType: SessionType;
  completedPomodoros: number;
}

function App() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetClicked, setResetClicked] = useState(false);

  // Load state from storage on mount
  useEffect(() => {
    // Load language
    getStoredLanguage().then(setLanguage);
    
    // Load theme
    getStoredTheme().then((theme) => {
      applyTheme(theme);
    });
    
    // Watch for system theme changes
    const unwatch = watchSystemTheme(async () => {
      const theme = await getStoredTheme();
      applyTheme(theme);
    });
    
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        const state = result.timerState as StoredTimerState;
        setSessionType(state.sessionType);
        setCompletedPomodoros(state.completedPomodoros);
        
        if (state.isRunning && state.endTime) {
          const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
          setTimeLeft(remaining);
          setTimerState('running');
        } else if (state.isPaused && state.endTime) {
          const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
          setTimeLeft(remaining);
          setTimerState('paused');
        } else {
          getActiveTimerDurations().then((dur) => {
            setTimeLeft(getSessionDuration(state.sessionType, dur));
            setTimerState('idle');
          });
        }
      } else {
        // Initialize with current durations
        getActiveTimerDurations().then((dur) => {
          setTimeLeft(dur.work * 60);
        });
      }
    });

    // Listen for storage changes to sync state across popup opens/closes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.timerState) {
        const newState = changes.timerState.newValue as StoredTimerState;
        setSessionType(newState.sessionType);
        setCompletedPomodoros(newState.completedPomodoros);
        
        if (newState.isRunning && newState.endTime) {
          const remaining = Math.max(0, Math.ceil((newState.endTime - Date.now()) / 1000));
          setTimeLeft(remaining);
          setTimerState('running');
        } else if (newState.isPaused && newState.endTime) {
          const remaining = Math.max(0, Math.ceil((newState.endTime - Date.now()) / 1000));
          setTimeLeft(remaining);
          setTimerState('paused');
        } else {
          getActiveTimerDurations().then((dur) => {
            setTimeLeft(getSessionDuration(newState.sessionType, dur));
            setTimerState('idle');
          });
        }
      }
      
      // Reload durations when timer mode changes
      if (changes.timerMode || changes.customDurations) {
        // Timer will reload on next action
      }
      
      // Reload theme when it changes
      if (changes.theme) {
        applyTheme(changes.theme.newValue);
      }
      
      // Reload language when it changes
      if (changes.language) {
        setLanguage(changes.language.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      unwatch();
    };
  }, []);

  // Update timeLeft every second when running
  useEffect(() => {
    let interval: number | undefined;

    if (timerState === 'running') {
      interval = window.setInterval(() => {
        chrome.storage.local.get(['timerState'], (result) => {
          if (result.timerState && result.timerState.endTime) {
            const remaining = Math.max(0, Math.ceil((result.timerState.endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            
            if (remaining === 0) {
              handleSessionComplete();
            }
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);

  const getSessionDuration = (type: SessionType, dur: TimerDurations): number => {
    switch (type) {
      case 'work': return dur.work * 60;
      case 'shortBreak': return dur.shortBreak * 60;
      case 'longBreak': return dur.longBreak * 60;
    }
  };

  const handleSessionComplete = () => {
    // Session completion is now handled by the background worker
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        const state = result.timerState as StoredTimerState;
        setSessionType(state.sessionType);
        setCompletedPomodoros(state.completedPomodoros);
        getActiveTimerDurations().then((dur) => {
          setTimeLeft(getSessionDuration(state.sessionType, dur));
          setTimerState('idle');
        });
      }
    });
  };

  const handleStart = () => {
    const endTime = Date.now() + (timeLeft * 1000);
    
    chrome.storage.local.set({
      timerState: {
        isRunning: true,
        isPaused: false,
        endTime: endTime,
        sessionType: sessionType,
        completedPomodoros: completedPomodoros,
      }
    });
    
    // Notify background worker to start session recording
    chrome.runtime.sendMessage({
      action: 'startSession',
      data: {
        sessionType: sessionType,
        endTime: endTime,
      }
    });
    
    setTimerState('running');
  };

  const handlePause = () => {
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        chrome.storage.local.set({
          timerState: {
            ...result.timerState,
            isRunning: false,
            isPaused: true,
          }
        });
      }
    });
    
    setTimerState('paused');
  };

  const handleReset = () => {
    // If timer is idle and reset was already clicked, do a full reinit
    if (timerState === 'idle' && resetClicked) {
      getActiveTimerDurations().then((dur) => {
        const workDuration = dur.work * 60;
        
        // Reset everything: timer, sessions, and step
        chrome.storage.local.set({
          timerState: {
            isRunning: false,
            isPaused: false,
            endTime: null,
            sessionType: 'work',
            completedPomodoros: 0, // Reset completed pomodoros
          }
        });
        
        setTimerState('idle');
        setSessionType('work');
        setTimeLeft(workDuration);
        setCompletedPomodoros(0);
        setResetClicked(false); // Reset the flag
      });
      return;
    }
    
    // First reset: just reset the timer if it's running/paused
    if (timerState === 'running' || timerState === 'paused') {
      // Notify background worker to mark session as interrupted
      chrome.runtime.sendMessage({
        action: 'interruptSession'
      });
      
      getActiveTimerDurations().then((dur) => {
        const workDuration = dur.work * 60;
        
        chrome.storage.local.set({
          timerState: {
            isRunning: false,
            isPaused: false,
            endTime: null,
            sessionType: 'work',
            completedPomodoros: completedPomodoros, // Keep current count
          }
        });
        
        setTimerState('idle');
        setSessionType('work');
        setTimeLeft(workDuration);
        setResetClicked(false);
      });
      return;
    }
    
    // If already idle, set the flag to indicate next click will do full reset
    setResetClicked(true);
    
    // Auto-reset the flag after 2 seconds if not clicked again
    const timeout = setTimeout(() => {
      setResetClicked(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionLabel = (): string => {
    switch (sessionType) {
      case 'work':
        return getTranslation('session.work', language);
      case 'shortBreak':
        return getTranslation('session.shortBreak', language);
      case 'longBreak':
        return getTranslation('session.longBreak', language);
    }
  };

  const getSessionColor = (): string => {
    switch (sessionType) {
      case 'work':
        return '#e74c3c'; // Tomato red
      case 'shortBreak':
        return '#3498db'; // Blue
      case 'longBreak':
        return '#2ecc71'; // Green
    }
  };

  const getButtonColor = (): string => {
    // Use session color for start button when not in work mode
    if (timerState === 'idle' || timerState === 'paused') {
      return getSessionColor();
    }
    return '#f39c12'; // Orange for pause
  };

  return (
    <div className="app" style={{ borderTopColor: getSessionColor() }}>
      <header className="header">
        <div className="header-top">
          <h1 className="title">
            <img src="/icons/icon32.png" alt="LaTomate" className="title-icon" />
            {getTranslation('app.title', language)}
          </h1>
          <div className="menu-container">
            <button 
              className="menu-btn" 
              onClick={() => setMenuOpen(!menuOpen)}
              title="Menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            {menuOpen && (
              <>
                <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="menu-dropdown">
                  <button 
                    className="menu-item" 
                    onClick={() => {
                      chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
                      setMenuOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined menu-icon">bar_chart</span>
                    <span className="menu-label">{getTranslation('menu.statistics', language)}</span>
                  </button>
                  <button 
                    className="menu-item" 
                    onClick={() => {
                      chrome.runtime.openOptionsPage();
                      setMenuOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined menu-icon">settings</span>
                    <span className="menu-label">{getTranslation('menu.settings', language)}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="session-type">{getSessionLabel()}</p>
      </header>

      <main className="main">
        <div className="timer-display" style={{ color: getSessionColor() }}>
          {formatTime(timeLeft)}
        </div>

        <div className="pomodoro-count">
          <span className="count-label">{getTranslation('stats.completedPomodoros', language)}:</span>
          <span className="count-value">{completedPomodoros}</span>
        </div>

        <div className="controls">
          {timerState === 'idle' || timerState === 'paused' ? (
            <button 
              className="btn btn-start" 
              onClick={handleStart}
              style={{ backgroundColor: getButtonColor() }}
            >
              {timerState === 'idle' 
                ? getTranslation('button.start', language)
                : getTranslation('button.resume', language)
              }
            </button>
          ) : (
            <button className="btn btn-pause" onClick={handlePause}>
              {getTranslation('button.pause', language)}
            </button>
          )}
          <button className="btn btn-reset" onClick={handleReset}>
            {resetClicked && timerState === 'idle'
              ? getTranslation('button.reinit', language)
              : getTranslation('button.reset', language)
            }
          </button>
        </div>

        <div className="progress-dots">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`dot ${i < (completedPomodoros % 4) ? 'completed' : ''}`}
              style={{ backgroundColor: i < (completedPomodoros % 4) ? getSessionColor() : undefined }}
            />
          ))}
        </div>
      </main>

      <footer className="footer">
        <p className="tagline">{getTranslation('app.madeBy', language)} <a href="https://github.com/vFoex" target="_blank" rel="noopener noreferrer">vFoex</a></p>
      </footer>
    </div>
  );
}

export default App;
