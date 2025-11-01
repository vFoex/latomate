// Timer mode types and utilities

export type TimerMode = 'pomodoro' | 'intensive' | '52-17' | 'custom';

export interface TimerDurations {
  work: number;        // in minutes
  shortBreak: number;  // in minutes
  longBreak: number;   // in minutes
  longBreakInterval: number; // after how many work sessions
}

export const TIMER_PRESETS: Record<TimerMode, TimerDurations> = {
  pomodoro: {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
  },
  intensive: {
    work: 45,
    shortBreak: 15,
    longBreak: 30,
    longBreakInterval: 4,
  },
  '52-17': {
    work: 52,
    shortBreak: 17,
    longBreak: 17,
    longBreakInterval: 4,
  },
  custom: {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
  },
};

export function getStoredTimerMode(): Promise<TimerMode> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['timerMode'], (result) => {
      resolve(result.timerMode || 'pomodoro');
    });
  });
}

export function setStoredTimerMode(mode: TimerMode): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ timerMode: mode }, () => {
      resolve();
    });
  });
}

export function getStoredCustomDurations(): Promise<TimerDurations> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customDurations'], (result) => {
      resolve(result.customDurations || TIMER_PRESETS.custom);
    });
  });
}

export function setStoredCustomDurations(durations: TimerDurations): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customDurations: durations }, () => {
      resolve();
    });
  });
}

export async function getActiveTimerDurations(): Promise<TimerDurations> {
  const mode = await getStoredTimerMode();
  if (mode === 'custom') {
    return await getStoredCustomDurations();
  }
  return TIMER_PRESETS[mode];
}
