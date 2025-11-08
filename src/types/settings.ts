// User settings and preferences types

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
