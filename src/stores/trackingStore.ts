import { create } from 'zustand';
import { db } from '@/lib/db/db';
import { haversineDistanceMeters } from '@/lib/geo/haversine';
import { useMapStore } from '@/stores/mapStore';
import type { Trip, TrackPoint } from '@/types/trip';

export type TrackingStatus = 'idle' | 'recording' | 'paused';

/** Un point GPS plus imprécis que ce seuil (mètres) n'est pas ajouté à la trace. */
const MAX_ACCEPTABLE_ACCURACY_M = 100;
/** Vitesse jugée impossible pour canot/kayak/paddle : le point est rejeté (saut GPS). */
const MAX_PLAUSIBLE_SPEED_MS = 12.5; // ~45 km/h
/** Nombre de points bufferisés avant écriture en base, pour limiter la perte en cas de crash. */
const FLUSH_EVERY_N_POINTS = 20;

interface TrackingState {
  status: TrackingStatus;
  activeTripId: string | null;
  tripName: string;
  points: TrackPoint[];
  lastPoint: TrackPoint | null;
  distanceMeters: number;
  currentSpeedMs: number | null;
  avgSpeedMs: number;
  elapsedMs: number;
  currentAccuracyM: number | null;
  gpsError: string | null;
  /** Horloge murale (epoch ms) du début de l'enregistrement — sert au calcul du temps écoulé réel. */
  recordingStartedAt: number | null;
  /** Cumul du temps passé en pause, à soustraire du temps écoulé. */
  pausedAccumMs: number;
  /** epoch ms du début de la pause en cours, s'il y en a une. */
  pausedAt: number | null;

  startRecording: (name: string) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: (finalName?: string) => Promise<void>;
}

const initialState = {
  status: 'idle' as TrackingStatus,
  activeTripId: null,
  tripName: '',
  points: [] as TrackPoint[],
  lastPoint: null as TrackPoint | null,
  distanceMeters: 0,
  currentSpeedMs: null as number | null,
  avgSpeedMs: 0,
  elapsedMs: 0,
  currentAccuracyM: null as number | null,
  gpsError: null as string | null,
  recordingStartedAt: null as number | null,
  pausedAccumMs: 0,
  pausedAt: null as number | null,
};

/**
 * Temps réellement passé en enregistrement (hors pauses) jusqu'à `now`, en
 * ms. Dérivé des horodatages réels plutôt que d'un compteur incrémenté
 * toutes les secondes : évite qu'un calcul de vitesse moyenne tombe à 0
 * juste parce que le tic d'affichage n'est pas encore passé.
 */
function activeElapsedMs(
  state: Pick<TrackingState, 'recordingStartedAt' | 'pausedAccumMs' | 'pausedAt' | 'status'>,
  now: number,
): number {
  if (state.recordingStartedAt === null) return 0;
  const ongoingPauseMs =
    state.status === 'paused' && state.pausedAt !== null ? now - state.pausedAt : 0;
  return Math.max(0, now - state.recordingStartedAt - state.pausedAccumMs - ongoingPauseMs);
}

// Handles impératifs de la session en cours (watchPosition, interval, buffer
// d'écriture) : volontairement hors du state Zustand, ce ne sont pas des
// données affichables mais des ressources à nettoyer nous-mêmes.
let watchId: number | null = null;
let tickIntervalId: ReturnType<typeof setInterval> | null = null;
let unflushedPoints: TrackPoint[] = [];

async function flushPoints(): Promise<void> {
  if (unflushedPoints.length === 0) return;
  const toFlush = unflushedPoints;
  unflushedPoints = [];
  await db.trackPoints.bulkAdd(toFlush);
}

function stopWatch(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (tickIntervalId !== null) {
    clearInterval(tickIntervalId);
    tickIntervalId = null;
  }
}

function describeGeoError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Localisation refusée — autorise la géolocalisation pour enregistrer un trajet.';
    case error.POSITION_UNAVAILABLE:
      return 'Position indisponible — vérifie le signal GPS.';
    case error.TIMEOUT:
      return 'Signal GPS trop lent à répondre, nouvelle tentative en cours.';
    default:
      return 'Erreur de géolocalisation.';
  }
}

export const useTrackingStore = create<TrackingState>((set, get) => {
  function handlePosition(position: GeolocationPosition): void {
    const state = get();
    if (state.status !== 'recording' || !state.activeTripId) return;

    const { latitude, longitude, altitude, accuracy, speed } = position.coords;
    set({ currentAccuracyM: accuracy, gpsError: null });

    // Signal trop imprécis : on garde l'indicateur de précision à jour mais
    // on n'ajoute pas ce point à la trace pour ne pas fausser la distance.
    if (accuracy > MAX_ACCEPTABLE_ACCURACY_M) return;

    const last = state.lastPoint;
    let incrementalDistance = 0;
    let deltaSeconds = 0;
    if (last) {
      incrementalDistance = haversineDistanceMeters(last, { lat: latitude, lon: longitude });
      deltaSeconds = (position.timestamp - last.timestamp) / 1000;
      if (deltaSeconds > 0 && incrementalDistance / deltaSeconds > MAX_PLAUSIBLE_SPEED_MS) {
        return; // saut GPS improbable, on ignore ce point
      }
    }

    const point: TrackPoint = {
      id: crypto.randomUUID(),
      tripId: state.activeTripId,
      lat: latitude,
      lon: longitude,
      elevation: altitude,
      accuracyM: accuracy,
      speedMs: typeof speed === 'number' ? speed : null,
      timestamp: position.timestamp,
    };

    const distanceMeters = state.distanceMeters + incrementalDistance;
    const currentSpeedMs =
      point.speedMs ??
      (deltaSeconds > 0 ? incrementalDistance / deltaSeconds : state.currentSpeedMs);
    const elapsedNowMs = activeElapsedMs(state, Date.now());
    const avgSpeedMs = elapsedNowMs > 0 ? distanceMeters / (elapsedNowMs / 1000) : 0;

    set({
      points: [...state.points, point],
      lastPoint: point,
      distanceMeters,
      currentSpeedMs,
      avgSpeedMs,
      elapsedMs: elapsedNowMs,
    });

    unflushedPoints.push(point);
    if (unflushedPoints.length >= FLUSH_EVERY_N_POINTS) {
      void flushPoints();
    }
  }

  function handlePositionError(error: GeolocationPositionError): void {
    set({ gpsError: describeGeoError(error) });
  }

  function startWatch(): void {
    if (watchId === null) {
      watchId = navigator.geolocation.watchPosition(handlePosition, handlePositionError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      });
    }
    if (tickIntervalId === null) {
      tickIntervalId = setInterval(() => {
        set((s) => ({ elapsedMs: activeElapsedMs(s, Date.now()) }));
      }, 1000);
    }
  }

  return {
    ...initialState,

    startRecording: async (name) => {
      const tripId = crypto.randomUUID();
      const now = Date.now();
      const trip: Trip = {
        id: tripId,
        name,
        createdAt: now,
        startedAt: now,
        endedAt: null,
        distanceMeters: 0,
        durationMs: 0,
        avgSpeedKmh: 0,
        status: 'recording',
      };
      await db.trips.add(trip);

      // Évite d'afficher simultanément un trajet historique et la trace en
      // cours d'enregistrement sur la carte.
      useMapStore.getState().setViewedTrip(null);

      set({
        ...initialState,
        status: 'recording',
        activeTripId: tripId,
        tripName: name,
        recordingStartedAt: now,
      });
      startWatch();
    },

    pauseRecording: () => {
      const now = Date.now();
      stopWatch();
      set((s) => ({ status: 'paused', pausedAt: now, elapsedMs: activeElapsedMs(s, now) }));
    },

    resumeRecording: () => {
      set((s) => {
        const now = Date.now();
        const pausedAccumMs = s.pausedAccumMs + (s.pausedAt !== null ? now - s.pausedAt : 0);
        return { status: 'recording', pausedAt: null, pausedAccumMs };
      });
      startWatch();
    },

    stopRecording: async (finalName) => {
      stopWatch();
      await flushPoints();

      const state = get();
      const finalElapsedMs = activeElapsedMs(state, Date.now());
      if (state.activeTripId) {
        const endedAt = Date.now();
        const avgSpeedKmh =
          finalElapsedMs > 0 ? (state.distanceMeters / (finalElapsedMs / 1000)) * 3.6 : 0;
        await db.trips.update(state.activeTripId, {
          name: finalName ?? state.tripName,
          endedAt,
          distanceMeters: state.distanceMeters,
          durationMs: finalElapsedMs,
          avgSpeedKmh,
          status: 'completed',
        });
      }

      set({ ...initialState });
    },
  };
});
