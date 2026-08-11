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
  /**
   * Nombre de dialogues (Portal) actuellement ouverts, tous confondus.
   * Sert à mettre en pause l'assombrissement automatique de l'écran
   * pendant l'enregistrement (voir ScreenDimOverlay) : pas question que
   * l'écran devienne noir en plein milieu d'une saisie.
   */
  openPortalCount: number;
  setActiveScreen: (screen: Screen) => void;
  toggleTheme: () => void;
  incrementPortalCount: () => void;
  decrementPortalCount: () => void;
}

/**
 * État d'interface transverse : écran actif (remplace un routeur — l'app a
 * une bottom-nav à 5 écrans fixes) et thème clair/sombre.
 */
export const useUiStore = create<UiState>((set, get) => ({
  activeScreen: 'map',
  theme: getInitialTheme(),
  openPortalCount: 0,

  setActiveScreen: (screen) => set({ activeScreen: screen }),

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, next);
    set({ theme: next });
  },

  incrementPortalCount: () => set((s) => ({ openPortalCount: s.openPortalCount + 1 })),
  decrementPortalCount: () => set((s) => ({ openPortalCount: Math.max(0, s.openPortalCount - 1) })),
}));
