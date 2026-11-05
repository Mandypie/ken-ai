import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings } from '../lib/storage';

type Theme = 'light' | 'dark';
type ThemeSetting = 'system' | 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Global shared state across all hook consumers
let currentThemeSetting: ThemeSetting = 'system';
let currentResolvedTheme: Theme = getSystemTheme();
const subscribers = new Set<() => void>();

function notifyAll() {
  subscribers.forEach((fn) => fn());
}

function applyThemeGlobally(setting: ThemeSetting) {
  currentThemeSetting = setting;
  const resolved = setting === 'system' ? getSystemTheme() : setting;
  currentResolvedTheme = resolved;

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', resolved === 'dark' ? '#070812' : '#F7F6FB');
    }
  }

  notifyAll();
}

// Initialize on module load
if (typeof window !== 'undefined') {
  getSettings().then((s) => {
    if (s && s.theme) {
      applyThemeGlobally(s.theme);
    } else {
      applyThemeGlobally('system');
    }
  });

  const mq = window.matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', () => {
    if (currentThemeSetting === 'system') {
      applyThemeGlobally('system');
    }
  });
}

export function useTheme() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    subscribers.add(rerender);
    return () => {
      subscribers.delete(rerender);
    };
  }, []);

  const setTheme = useCallback(async (setting: ThemeSetting) => {
    applyThemeGlobally(setting);
    const current = await getSettings();
    await saveSettings({ ...current, theme: setting });
  }, []);

  const toggle = useCallback(() => {
    const next = currentResolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [setTheme]);

  return {
    theme: currentResolvedTheme,
    themeSetting: currentThemeSetting,
    setTheme,
    toggle,
  };
}
