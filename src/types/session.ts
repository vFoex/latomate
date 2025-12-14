// Session recording types

import type { SessionType, TimerMode } from './timer';

export interface SessionRecord {
  id: string;
  userId?: string; // Pour Firebase sync (Phase 4.9)
  type: SessionType;
  timerMode: TimerMode;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  duration: number; // in seconds
  completed: boolean;
  interrupted: boolean;
  notes?: string; // Pour Phase 6 (Prise de notes)
  tags?: string[]; // Tags associés à la session (Phase 5.1)
}

export interface SessionStats {
  completedPomodoros: number;
  totalFocusTime: number; // in minutes
  lastSessionDate?: string;
  currentStreak?: number;
  bestStreak?: number;
}
