// Theme utilities for LaTomate

export type Theme = 'light' | 'dark' | 'auto';

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): Promise<Theme> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['theme'], (result) => {
      resolve(result.theme || 'auto');
    });
  });
}

export function setStoredTheme(theme: Theme): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ theme }, () => {
      resolve();
    });
  });
}

export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') {
    return getSystemTheme();
  }
  return theme;
}

export function applyTheme(theme: Theme) {
  const effectiveTheme = getEffectiveTheme(theme);
  document.documentElement.setAttribute('data-theme', effectiveTheme);
}

// Listen to system theme changes
export function watchSystemTheme(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}
