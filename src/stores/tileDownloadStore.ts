import { create } from 'zustand';

export type TileDownloadStatus = 'idle' | 'downloading' | 'done' | 'error';

interface TileDownloadState {
  zoneId: string | null;
  total: number;
  completed: number;
  failed: number;
  status: TileDownloadStatus;

  start: (zoneId: string, total: number) => void;
  reportProgress: (succeeded: boolean) => void;
  finish: () => void;
  reset: () => void;
}

const initialState = {
  zoneId: null as string | null,
  total: 0,
  completed: 0,
  failed: 0,
  status: 'idle' as TileDownloadStatus,
};

/**
 * État global (un seul téléchargement de zone à la fois) partagé entre le
 * bouton qui déclenche le téléchargement et le panneau de progression —
 * survit même si le panneau qui l'a lancé se ferme entre-temps.
 */
export const useTileDownloadStore = create<TileDownloadState>((set, get) => ({
  ...initialState,

  start: (zoneId, total) => set({ ...initialState, zoneId, total, status: 'downloading' }),

  reportProgress: (succeeded) =>
    set((s) => ({
      completed: s.completed + 1,
      failed: s.failed + (succeeded ? 0 : 1),
    })),

  finish: () => set({ status: get().failed > 0 ? 'error' : 'done' }),

  reset: () => set({ ...initialState }),
}));
