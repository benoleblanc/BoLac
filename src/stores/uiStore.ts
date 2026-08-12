import { create } from 'zustand';

export type Screen = 'map' | 'trips' | 'waypoints' | 'export' | 'settings';
export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bolac-theme';
const DIM_DELAY_STORAGE_KEY = 'bolac-dim-delay-ms';

/** Choix possibles pour le délai avant l'écran noir pendant un enregistrement inactif. */
export const DIM_DELAY_OPTIONS_MS = [30_000, 60_000, 90_000, 120_000] as const;
const DEFAULT_DIM_DELAY_MS = 120_000;

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getInitialDimDelayMs(): number {
  const stored = Number(localStorage.getItem(DIM_DELAY_STORAGE_KEY));
  return (DIM_DELAY_OPTIONS_MS as readonly number[]).includes(stored)
    ? stored
    : DEFAULT_DIM_DELAY_MS;
}

interface UiState {
  activeScreen: Screen;
  theme: Theme;
  /** Délai (ms) avant l'écran noir pendant un enregistrement inactif — voir ScreenDimOverlay. */
  dimDelayMs: number;
  /**
   * Nombre de dialogues (Portal) actuellement ouverts, tous confondus.
   * Sert à mettre en pause l'assombrissement automatique de l'écran
   * pendant l'enregistrement (voir ScreenDimOverlay) : pas question que
   * l'écran devienne noir en plein milieu d'une saisie.
   */
  openPortalCount: number;
  setActiveScreen: (screen: Screen) => void;
  toggleTheme: () => void;
  setDimDelayMs: (ms: number) => void;
  incrementPortalCount: () => void;
  decrementPortalCount: () => void;
}

/**
 * État d'interface transverse : écran actif (remplace un routeur — l'app a
 * une bottom-nav à 5 écrans fixes), thème clair/sombre, et préférences
 * persistées (délai avant écran noir).
 */
export const useUiStore = create<UiState>((set, get) => ({
  activeScreen: 'map',
  theme: getInitialTheme(),
  dimDelayMs: getInitialDimDelayMs(),
  openPortalCount: 0,

  setActiveScreen: (screen) => set({ activeScreen: screen }),

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, next);
    set({ theme: next });
  },

  setDimDelayMs: (ms) => {
    localStorage.setItem(DIM_DELAY_STORAGE_KEY, String(ms));
    set({ dimDelayMs: ms });
  },

  incrementPortalCount: () => set((s) => ({ openPortalCount: s.openPortalCount + 1 })),
  decrementPortalCount: () => set((s) => ({ openPortalCount: Math.max(0, s.openPortalCount - 1) })),
}));
