import { create } from 'zustand';

export type Screen = 'map' | 'trips' | 'waypoints' | 'export' | 'settings';
export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bolac-theme';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

interface UiState {
  activeScreen: Screen;
  theme: Theme;
  setActiveScreen: (screen: Screen) => void;
  toggleTheme: () => void;
}

/**
 * État d'interface transverse : écran actif (remplace un routeur — l'app a
 * une bottom-nav à 5 écrans fixes) et thème clair/sombre.
 */
export const useUiStore = create<UiState>((set, get) => ({
  activeScreen: 'map',
  theme: getInitialTheme(),

  setActiveScreen: (screen) => set({ activeScreen: screen }),

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, next);
    set({ theme: next });
  },
}));
