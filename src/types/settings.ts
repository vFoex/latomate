// User settings and preferences types

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface SessionTag {
  id: string;
  name: string;
  color: string; // HEX color code
  createdAt: string; // ISO timestamp
}

export interface UserTags {
  tags: SessionTag[];
}
