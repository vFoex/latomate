// Storage utilities for LaTomate sessions
// Uses Chrome Storage API for local-first approach

import { SessionRecord } from '../types';

const SESSIONS_STORAGE_KEY = 'sessions';
const MAX_SESSIONS = 1000; // Limite pour éviter de dépasser 10MB Chrome Storage

/**
 * Generate a unique ID for a session
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save a new session or update an existing one
 */
export async function saveSession(session: SessionRecord): Promise<void> {
  const sessions = await getSessions();
  
  // Check if session already exists (update case)
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    // Update existing session
    sessions[existingIndex] = session;
  } else {
    // Add new session
    sessions.push(session);
    
    // Keep only the most recent sessions if we exceed the limit
    if (sessions.length > MAX_SESSIONS) {
      // Sort by startTime descending and keep the most recent ones
      sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      sessions.splice(MAX_SESSIONS);
    }
  }
  
  // Save to storage
  await chrome.storage.local.set({ [SESSIONS_STORAGE_KEY]: sessions });
  console.log('💾 Session saved:', session.id);
}

/**
 * Get all sessions, optionally filtered
 */
export async function getSessions(filters?: {
  type?: 'work' | 'shortBreak' | 'longBreak';
  timerMode?: 'pomodoro' | 'intensive' | '52-17' | 'custom';
  completed?: boolean;
  startDate?: Date;
  endDate?: Date;
}): Promise<SessionRecord[]> {
  const result = await chrome.storage.local.get([SESSIONS_STORAGE_KEY]);
  let sessions: SessionRecord[] = result[SESSIONS_STORAGE_KEY] || [];
  
  // Apply filters if provided
  if (filters) {
    if (filters.type !== undefined) {
      sessions = sessions.filter(s => s.type === filters.type);
    }
    
    if (filters.timerMode !== undefined) {
      sessions = sessions.filter(s => s.timerMode === filters.timerMode);
    }
    
    if (filters.completed !== undefined) {
      sessions = sessions.filter(s => s.completed === filters.completed);
    }
    
    if (filters.startDate) {
      sessions = sessions.filter(s => new Date(s.startTime) >= filters.startDate!);
    }
    
    if (filters.endDate) {
      sessions = sessions.filter(s => new Date(s.startTime) <= filters.endDate!);
    }
  }
  
  // Sort by startTime descending (most recent first)
  sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  console.log('💾 [Storage] getSessions() returning:', {
    totalSessions: sessions.length,
    sessionsWithTags: sessions.filter(s => s.tags && s.tags.length > 0).length,
    sampleSessions: sessions.slice(0, 3).map(s => ({ id: s.id, type: s.type, tags: s.tags, tagCount: s.tags?.length || 0 }))
  });
  
  return sessions;
}

/**
 * Get a single session by ID
 */
export async function getSession(id: string): Promise<SessionRecord | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id) || null;
}

/**
 * Update a session
 */
export async function updateSession(id: string, updates: Partial<SessionRecord>): Promise<void> {
  const session = await getSession(id);
  
  if (!session) {
    console.warn('⚠️ Session not found for update:', id);
    return;
  }
  
  const updatedSession = { ...session, ...updates };
  await saveSession(updatedSession);
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<void> {
  const sessions = await getSessions();
  const filteredSessions = sessions.filter(s => s.id !== id);
  
  await chrome.storage.local.set({ [SESSIONS_STORAGE_KEY]: filteredSessions });
  console.log('🗑️ Session deleted:', id);
}

/**
 * Delete all sessions (useful for testing or data reset)
 */
export async function deleteAllSessions(): Promise<void> {
  await chrome.storage.local.set({ [SESSIONS_STORAGE_KEY]: [] });
  console.log('🗑️ All sessions deleted');
}

/**
 * Get sessions count
 */
export async function getSessionsCount(): Promise<number> {
  const sessions = await getSessions();
  return sessions.length;
}

/**
 * Get storage size estimate (in bytes)
 */
export async function getStorageSize(): Promise<number> {
  const sessions = await getSessions();
  const serialized = JSON.stringify(sessions);
  return new Blob([serialized]).size;
}

/**
 * Clean up old sessions (older than N months)
 */
export async function cleanupOldSessions(monthsToKeep: number = 6): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
  
  const sessions = await getSessions();
  const initialCount = sessions.length;
  
  const recentSessions = sessions.filter(s => new Date(s.startTime) >= cutoffDate);
  
  await chrome.storage.local.set({ [SESSIONS_STORAGE_KEY]: recentSessions });
  
  const deletedCount = initialCount - recentSessions.length;
  console.log(`🧹 Cleaned up ${deletedCount} old sessions (keeping last ${monthsToKeep} months)`);
  
  return deletedCount;
}
