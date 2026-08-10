import { create } from 'zustand';
import type { TrackPoint } from '@/types/trip';

export type TrackingStatus = 'idle' | 'recording' | 'paused';

interface TrackingState {
  status: TrackingStatus;
  activeTripId: string | null;
  watchId: number | null;
  /** Buffer en mémoire des points de la session en cours. */
  points: TrackPoint[];
  distanceMeters: number;
  currentSpeedMs: number | null;
  avgSpeedMs: number;
  startedAt: number | null;
  elapsedMs: number;
  currentAccuracyM: number | null;

  // Squelette d'API — la logique (watchPosition, calculs haversine,
  // persistance Dexie) sera branchée au lot "tracking GPS en direct".
  startRecording: (name: string) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<void>;
  addPoint: (point: TrackPoint) => void;
}

const initialState = {
  status: 'idle' as TrackingStatus,
  activeTripId: null,
  watchId: null,
  points: [],
  distanceMeters: 0,
  currentSpeedMs: null,
  avgSpeedMs: 0,
  startedAt: null,
  elapsedMs: 0,
  currentAccuracyM: null,
};

export const useTrackingStore = create<TrackingState>((set) => ({
  ...initialState,

  startRecording: async (_name) => {
    throw new Error('Not implemented yet — lot "tracking GPS en direct".');
  },
  pauseRecording: () => {
    throw new Error('Not implemented yet — lot "tracking GPS en direct".');
  },
  resumeRecording: () => {
    throw new Error('Not implemented yet — lot "tracking GPS en direct".');
  },
  stopRecording: async () => {
    throw new Error('Not implemented yet — lot "tracking GPS en direct".');
  },
  addPoint: (point) =>
    set((state) => ({ points: [...state.points, point] })),
}));
