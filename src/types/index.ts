// Type definitions for LaTomate

export type TimerState = 'idle' | 'running' | 'paused';

export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface SessionStats {
  completedPomodoros: number;
  totalFocusTime: number; // in minutes
  lastSessionDate?: string;
  currentStreak?: number;
}

export interface StorageData {
  completedPomodoros: number;
  totalFocusTime: number;
  settings: PomodoroSettings;
  sessions?: SessionRecord[];
}

export interface SessionRecord {
  id: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  completed: boolean;
  interrupted: boolean;
  notes?: string;
}
