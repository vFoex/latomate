// Chrome Storage data structure types

import type { PomodoroSettings } from './settings';
import type { SessionRecord } from './session';

export interface StorageData {
  completedPomodoros: number;
  totalFocusTime: number;
  settings: PomodoroSettings;
  sessions?: SessionRecord[];
}
