// Background service worker for LaTomate
// Handles alarms, notifications, and background tasks

import { getActiveTimerDurations, getStoredTimerMode } from '../utils/timerModes';
import { generateSessionId, saveSession, updateSession } from '../utils/storage';
import type { SessionRecord } from '../types';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  endTime: number | null;
  sessionType: 'work' | 'shortBreak' | 'longBreak';
  completedPomodoros: number;
  currentSessionId?: string; // Track current session being recorded
  selectedTags?: string[]; // Track tags for current session
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
    notificationsEnabled: true,
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
async function handleTimerComplete(state: TimerState) {
  const isWorkSession = state.sessionType === 'work';
  
  console.log('⏰ Timer completed!', { 
    sessionType: state.sessionType,
    tags: state.selectedTags,
    tagCount: state.selectedTags?.length || 0
  });
  
  // Complete the current session record
  if (state.currentSessionId) {
    await updateSession(state.currentSessionId, {
      endTime: new Date().toISOString(),
      completed: true,
      interrupted: false,
    });
    console.log('✅ Session completed and recorded:', { 
      sessionId: state.currentSessionId,
      tags: state.selectedTags,
      tagCount: state.selectedTags?.length || 0
    });
  }
  
  // Check if notifications are enabled
  const result = await chrome.storage.local.get(['notificationsEnabled']);
  const notificationsEnabled = result.notificationsEnabled ?? true;
  
  if (!notificationsEnabled) {
    console.log('🔕 Notifications disabled, skipping');
  }
  
  // Get timer durations to check long break interval
  const durations = await getActiveTimerDurations();
  
  if (isWorkSession) {
    const newCount = state.completedPomodoros + 1;
    const nextSession = newCount % durations.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
    
    chrome.storage.local.set({
      timerState: {
        isRunning: false,
        isPaused: false,
        endTime: null,
        sessionType: nextSession,
        completedPomodoros: newCount,
        currentSessionId: undefined, // Clear current session
      },
      completedPomodoros: newCount,
    });
    
    if (notificationsEnabled) {
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
    }
  } else {
    chrome.storage.local.set({
      timerState: {
        isRunning: false,
        isPaused: false,
        endTime: null,
        sessionType: 'work',
        completedPomodoros: state.completedPomodoros,
        currentSessionId: undefined, // Clear current session
      },
    });
    
    if (notificationsEnabled) {
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

// Listen for messages from popup to start/stop session recording
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'startSession') {
    try {
      console.log('🍅 [Service Worker] Received startSession message:', { 
        sessionType: message.data?.sessionType,
        tags: message.data?.tags,
        tagCount: message.data?.tags?.length || 0 
      });
      handleStartSession(message.data).then(() => {
        console.log('✅ [Service Worker] startSession handler completed');
        sendResponse({ success: true });
      }).catch(error => {
        console.error('❌ [Service Worker] Error in handleStartSession:', error);
        sendResponse({ success: false, error });
      });
    } catch (error) {
      console.error('❌ [Service Worker] Error processing startSession:', error);
      sendResponse({ success: false, error });
    }
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'interruptSession') {
    try {
      handleInterruptSession().then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        console.error('❌ [Service Worker] Error in handleInterruptSession:', error);
        sendResponse({ success: false, error });
      });
    } catch (error) {
      console.error('❌ [Service Worker] Error processing interruptSession:', error);
      sendResponse({ success: false, error });
    }
    return true;
  }
});

// Create a new session record when timer starts
async function handleStartSession(data: {
  sessionType: 'work' | 'shortBreak' | 'longBreak';
  endTime: number;
  tags?: string[];
}) {
  const timerMode = await getStoredTimerMode();
  const sessionId = generateSessionId();
  const startTime = new Date().toISOString();
  const endTime = new Date(data.endTime).toISOString();
  const duration = Math.ceil((data.endTime - Date.now()) / 1000);
  
  const session: SessionRecord = {
    id: sessionId,
    type: data.sessionType,
    timerMode,
    startTime,
    endTime, // Will be updated when session completes
    duration,
    completed: false,
    interrupted: false,
    tags: data.tags || [], // Store tags with session
  };
  
  console.log('📝 [Service Worker] Creating session record:', { 
    sessionId,
    type: data.sessionType,
    tags: session.tags ?? [],
    tagCount: (session.tags ?? []).length,
    duration
  });
  
  await saveSession(session);
  
  // Store session ID and tags in timer state
  chrome.storage.local.get(['timerState'], (result) => {
    const state = result.timerState as TimerState;
    chrome.storage.local.set({
      timerState: {
        ...state,
        currentSessionId: sessionId,
        selectedTags: data.tags || [],
      },
    });
  });
  
  console.log('📝 Session started:', sessionId, session.type);
}

// Handle session interruption (reset or pause)
async function handleInterruptSession() {
  chrome.storage.local.get(['timerState'], async (result) => {
    const state = result.timerState as TimerState;
    
    if (state.currentSessionId) {
      await updateSession(state.currentSessionId, {
        endTime: new Date().toISOString(),
        completed: false,
        interrupted: true,
      });
      
      console.log('⏸️ Session interrupted:', state.currentSessionId);
      
      // Clear current session ID
      chrome.storage.local.set({
        timerState: {
          ...state,
          currentSessionId: undefined,
        },
      });
    }
  });
}

// Export for use in other parts of the extension
export {};
