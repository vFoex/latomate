// Background service worker for LaTomate
// Handles alarms, notifications, and background tasks

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  endTime: number | null;
  sessionType: 'work' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('LaTomate 🍅 installed successfully!');
  
  // Initialize storage with default values
  chrome.storage.local.set({
    completedPomodoros: 0,
    totalFocusTime: 0,
    timerState: {
      isRunning: false,
      isPaused: false,
      endTime: null,
      sessionType: 'work',
      completedPomodoros: 0,
    },
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      pomodorosUntilLongBreak: 4,
      notificationsEnabled: true,
      soundEnabled: true,
    },
  });
});

// Update badge with remaining time
function updateBadge() {
  chrome.storage.local.get(['timerState'], (result) => {
    const state = result.timerState as TimerState;
    if (state && state.isRunning && state.endTime) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((state.endTime - now) / 1000));
      
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        
        // Format badge text to fit in limited space (max 4 chars)
        let badgeText: string;
        if (minutes > 0) {
          // For 10+ minutes, show only minutes (e.g., "25m")
          badgeText = `${minutes}m`;
        } else {
          // For under 1 minute, show just seconds (e.g., "45s")
          badgeText = `${seconds.toString()}s`;
        }
        
        chrome.action.setBadgeText({ text: badgeText });
        chrome.action.setBadgeBackgroundColor({ 
          color: state.sessionType === 'work' ? '#e74c3c' : '#3498db' 
        });
      } else {
        chrome.action.setBadgeText({ text: '' });
        handleTimerComplete(state);
      }
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

// Handle timer completion
function handleTimerComplete(state: TimerState) {
  const isWorkSession = state.sessionType === 'work';
  
  console.log('⏰ Timer completed! Session type:', state.sessionType);
  
  // Play notification sound
  playNotificationSound();
  
  if (isWorkSession) {
    const newCount = state.completedPomodoros + 1;
    const nextSession = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
    
    chrome.storage.local.set({
      timerState: {
        isRunning: false,
        isPaused: false,
        endTime: null,
        sessionType: nextSession,
        completedPomodoros: newCount,
      },
      completedPomodoros: newCount,
    });
    
    console.log('🔔 Creating work complete notification...');
    chrome.notifications.create('pomodoro-complete-' + Date.now(), {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'LaTomate 🍅 - Work Session Complete!',
      message: 'Great job! Time for a break. Click to continue.',
      priority: 2,
      requireInteraction: false,
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Notification error:', chrome.runtime.lastError);
      } else {
        console.log('✅ Notification created:', notificationId);
      }
    });
  } else {
    chrome.storage.local.set({
      timerState: {
        isRunning: false,
        isPaused: false,
        endTime: null,
        sessionType: 'work',
        completedPomodoros: state.completedPomodoros,
      },
    });
    
    console.log('🔔 Creating break complete notification...');
    chrome.notifications.create('break-complete-' + Date.now(), {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'LaTomate 🍅 - Break Complete!',
      message: 'Refreshed and ready? Click to start a new session.',
      priority: 2,
      requireInteraction: false,
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Notification error:', chrome.runtime.lastError);
      } else {
        console.log('✅ Notification created:', notificationId);
      }
    });
  }
}

// Play notification sound
function playNotificationSound() {
  // Create an audio element to play the sound
  // Note: In service workers, we can't directly play audio,
  // but we can send a message to any open tabs or use the notification API
  chrome.storage.local.get(['settings'], (result) => {
    if (result.settings && result.settings.soundEnabled !== false) {
      // Use the browser's notification sound
      console.log('🔔 Timer completed!');
    }
  });
}

// Update badge every second when timer is running
setInterval(() => {
  updateBadge();
}, 1000);

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('🖱️ Notification clicked:', notificationId);
  
  // Clear the notification
  chrome.notifications.clear(notificationId);
  
  // Try to open the popup (only works if user action)
  // This will bring focus to Chrome and show the extension icon
  chrome.action.openPopup().catch(() => {
    // If openPopup fails, we can't do much due to Chrome restrictions
    // The click itself will bring Chrome to focus
    console.log('ℹ️ Popup cannot be opened programmatically, but Chrome is now focused');
  });
});

// Export for use in other parts of the extension
export {};
