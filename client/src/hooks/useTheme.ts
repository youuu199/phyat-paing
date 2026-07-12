import { useState, useEffect } from 'react';

/**
 * Simple global theme store.
 * ThemeEffect reads from this, SettingsPage writes to it.
 */
let globalTheme = 'system';
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export function getTheme() {
  return globalTheme;
}

export function setTheme(theme: string) {
  globalTheme = theme;
  // Apply to document immediately
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.add('light');
  }
  // Save to localStorage as fallback
  localStorage.setItem('app-theme', theme);
  notify();
}

/**
 * Hook to read and write the global theme.
 */
export function useThemeStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((fn) => fn !== listener);
    };
  }, []);

  return {
    theme: globalTheme,
    setTheme,
  };
}

/**
 * Initialize theme from localStorage on app start.
 */
export function initTheme() {
  const saved = localStorage.getItem('app-theme');
  if (saved) {
    globalTheme = saved;
  }
  // Apply immediately
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (globalTheme === 'dark') {
    root.classList.add('dark');
  } else if (globalTheme === 'light') {
    root.classList.add('light');
  }
}
