// Tags management utilities

import type { SessionTag, UserTags } from '../types/settings';

const TAGS_STORAGE_KEY = 'userTags';

// Default colors for tags
const DEFAULT_COLORS = [
  '#e74c3c', // Red
  '#3498db', // Blue
  '#2ecc71', // Green
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#e67e22', // Dark Orange
  '#34495e', // Dark Gray
];

/**
 * Get all user tags
 */
export async function getUserTags(): Promise<SessionTag[]> {
  const result = await chrome.storage.local.get([TAGS_STORAGE_KEY]);
  const userTags = result[TAGS_STORAGE_KEY] as UserTags | undefined;
  return userTags?.tags || [];
}

/**
 * Add a new tag
 */
export async function addTag(name: string, color?: string): Promise<SessionTag> {
  const tags = await getUserTags();
  
  // Check if tag already exists (case-insensitive)
  const exists = tags.some(tag => tag.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    throw new Error(`Tag "${name}" already exists`);
  }
  
  const newTag: SessionTag = {
    id: `tag_${Date.now()}`,
    name,
    color: color || DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length],
    createdAt: new Date().toISOString(),
  };
  
  const updatedTags = [...tags, newTag];
  await chrome.storage.local.set({
    [TAGS_STORAGE_KEY]: { tags: updatedTags }
  });
  
  return newTag;
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string): Promise<void> {
  const tags = await getUserTags();
  const updatedTags = tags.filter(tag => tag.id !== tagId);
  
  await chrome.storage.local.set({
    [TAGS_STORAGE_KEY]: { tags: updatedTags }
  });
}

/**
 * Update a tag
 */
export async function updateTag(tagId: string, updates: Partial<Omit<SessionTag, 'id' | 'createdAt'>>): Promise<SessionTag> {
  const tags = await getUserTags();
  const tagIndex = tags.findIndex(tag => tag.id === tagId);
  
  if (tagIndex === -1) {
    throw new Error(`Tag with id "${tagId}" not found`);
  }
  
  const updatedTag: SessionTag = {
    ...tags[tagIndex],
    ...updates,
  };
  
  tags[tagIndex] = updatedTag;
  await chrome.storage.local.set({
    [TAGS_STORAGE_KEY]: { tags }
  });
  
  return updatedTag;
}

/**
 * Get a tag by ID
 */
export async function getTagById(tagId: string): Promise<SessionTag | null> {
  const tags = await getUserTags();
  return tags.find(tag => tag.id === tagId) || null;
}

/**
 * Get default color for a new tag based on index
 */
export function getDefaultColor(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}
