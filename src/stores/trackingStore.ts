import { create } from 'zustand';
import { db } from '@/lib/db/db';
import { haversineDistanceMeters } from '@/lib/geo/haversine';
import { useMapStore } from '@/stores/mapStore';
import type { Trip, TrackPoint } from '@/types/trip';
import { DEFAULT_ACTIVITY, type ActivityType } from '@/types/activity';
import { isNativePlatform } from '@/lib/platform';
import type { RawFix } from '@/lib/geo/rawFix';
import { startNativeBackgroundWatch, stopNativeBackgroundWatch } from '@/lib/geo/nativeBackgroundWatch';

export type TrackingStatus = 'idle' | 'recording' | 'paused';

/** Un point GPS plus imprécis que ce seuil (mètres) n'est pas ajouté à la trace. */
const MAX_ACCEPTABLE_ACCURACY_M = 100;
/** Vitesse jugée impossible pour canot/kayak/paddle : le point est rejeté (saut GPS). */
const MAX_PLAUSIBLE_SPEED_MS = 12.5; // ~45 km/h
/** Nombre de points bufferisés avant écriture en base, pour limiter la perte en cas de crash. */
const FLUSH_EVERY_N_POINTS = 20;
/**
 * Variation d'altitude (m) en dessous de laquelle on considère que c'est du
 * bruit GPS plutôt qu'un vrai changement d'élévation. Le GPS d'un téléphone
 * est nettement moins précis en altitude qu'en position horizontale ; sans
 * ce filtre, le dénivelé cumulé gonfle artificiellement même à plat.
 */
const ELEVATION_NOISE_THRESHOLD_M = 2;

interface TrackingState {
  status: TrackingStatus;
  activeTripId: string | null;
  tripName: string;
  activityType: ActivityType;
  points: TrackPoint[];
  lastPoint: TrackPoint | null;
  distanceMeters: number;
  currentSpeedMs: number | null;
  avgSpeedMs: number;
  elapsedMs: number;
  currentAccuracyM: number | null;
  /** Dernière altitude GPS reçue (m), sans lissage — pour affichage seulement. */
  currentElevationM: number | null;
  /** Cumul des montées significatives (m) depuis le début de l'enregistrement. */
  elevationGainM: number;
  /** Cumul des descentes significatives (m, valeur positive) depuis le début. */
  elevationLossM: number;
  gpsError: string | null;
  /**
   * true si l'écran est activement maintenu allumé (Wake Lock) pendant
   * l'enregistrement — sur mobile, l'écran qui se verrouille suspend le
   * suivi GPS, ce n'est pas une limite de BoLac mais du navigateur.
   */
  wakeLockActive: boolean;
  /** Horloge murale (epoch ms) du début de l'enregistrement — sert au calcul du temps écoulé réel. */
  recordingStartedAt: number | null;
  /** Cumul du temps passé en pause, à soustraire du temps écoulé. */
  pausedAccumMs: number;
  /** epoch ms du début de la pause en cours, s'il y en a une. */
  pausedAt: number | null;

  startRecording: (name: string, activityType: ActivityType) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: (finalName?: string) => Promise<void>;
}

const initialState = {
  status: 'idle' as TrackingStatus,
  activeTripId: null,
  tripName: '',
  activityType: DEFAULT_ACTIVITY,
  points: [] as TrackPoint[],
  lastPoint: null as TrackPoint | null,
  distanceMeters: 0,
  currentSpeedMs: null as number | null,
  avgSpeedMs: 0,
  elapsedMs: 0,
  currentAccuracyM: null as number | null,
  currentElevationM: null as number | null,
  elevationGainM: 0,
  elevationLossM: 0,
  gpsError: null as string | null,
  wakeLockActive: false,
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
/** Id du watcher natif (plugin de géolocalisation en arrière-plan) — équivalent de `watchId` côté Capacitor. */
let nativeWatcherId: string | null = null;
let tickIntervalId: ReturnType<typeof setInterval> | null = null;
let unflushedPoints: TrackPoint[] = [];
let wakeLockSentinel: WakeLockSentinel | null = null;
/**
 * Dernière altitude retenue comme référence pour le calcul du dénivelé
 * (distincte de `currentElevationM`, qui suit chaque lecture brute pour
 * l'affichage). Ne bouge que quand une variation dépasse le seuil de bruit
 * — persiste à travers une pause/reprise, remise à zéro seulement au
 * démarrage d'un nouvel enregistrement.
 */
let elevationBaselineM: number | null = null;

async function flushPoints(): Promise<void> {
  if (unflushedPoints.length === 0) return;
  const toFlush = unflushedPoints;
  unflushedPoints = [];
  await db.trackPoints.bulkAdd(toFlush);
}

function stopWatch(): void {
  if (isNativePlatform()) {
    if (nativeWatcherId !== null) {
      void stopNativeBackgroundWatch(nativeWatcherId);
      nativeWatcherId = null;
    }
  } else if (watchId !== null) {
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

/** Adapte une position de l'API web `navigator.geolocation` vers la forme neutre `RawFix`. */
function fromGeolocationPosition(position: GeolocationPosition): RawFix {
  const { latitude, longitude, altitude, accuracy, speed } = position.coords;
  return {
    lat: latitude,
    lon: longitude,
    elevation: altitude,
    accuracyM: accuracy,
    speedMs: typeof speed === 'number' ? speed : null,
    timestamp: position.timestamp,
  };
}

export const useTrackingStore = create<TrackingState>((set, get) => {
  function handleFix(fix: RawFix): void {
    const state = get();
    if (state.status !== 'recording' || !state.activeTripId) return;

    const { lat, lon, elevation, accuracyM, speedMs, timestamp } = fix;
    set({ currentAccuracyM: accuracyM, gpsError: null });

    // Signal trop imprécis : on garde l'indicateur de précision à jour mais
    // on n'ajoute pas ce point à la trace pour ne pas fausser la distance.
    if (accuracyM > MAX_ACCEPTABLE_ACCURACY_M) return;

    const last = state.lastPoint;
    let incrementalDistance = 0;
    let deltaSeconds = 0;
    if (last) {
      incrementalDistance = haversineDistanceMeters(last, { lat, lon });
      deltaSeconds = (timestamp - last.timestamp) / 1000;
      if (deltaSeconds > 0 && incrementalDistance / deltaSeconds > MAX_PLAUSIBLE_SPEED_MS) {
        return; // saut GPS improbable, on ignore ce point
      }
    }

    const point: TrackPoint = {
      id: crypto.randomUUID(),
      tripId: state.activeTripId,
      lat,
      lon,
      elevation,
      accuracyM,
      speedMs,
      timestamp,
    };

    const distanceMeters = state.distanceMeters + incrementalDistance;
    const currentSpeedMs =
      point.speedMs ??
      (deltaSeconds > 0 ? incrementalDistance / deltaSeconds : state.currentSpeedMs);
    const elapsedNowMs = activeElapsedMs(state, Date.now());
    const avgSpeedMs = elapsedNowMs > 0 ? distanceMeters / (elapsedNowMs / 1000) : 0;

    // Dénivelé : on compare chaque nouvelle altitude à la dernière référence
    // "significative", pas au point précédent — sinon des micro-oscillations
    // de bruit GPS s'additionnent indéfiniment même à plat. Le seuil ignore
    // les variations sous ELEVATION_NOISE_THRESHOLD_M, et la référence
    // n'avance que quand un vrai changement est détecté.
    let { elevationGainM, elevationLossM } = state;
    if (elevation !== null) {
      if (elevationBaselineM === null) {
        elevationBaselineM = elevation;
      } else {
        const deltaElevation = elevation - elevationBaselineM;
        if (Math.abs(deltaElevation) >= ELEVATION_NOISE_THRESHOLD_M) {
          if (deltaElevation > 0) elevationGainM += deltaElevation;
          else elevationLossM += -deltaElevation;
          elevationBaselineM = elevation;
        }
      }
    }

    set({
      points: [...state.points, point],
      lastPoint: point,
      distanceMeters,
      currentSpeedMs,
      avgSpeedMs,
      elapsedMs: elapsedNowMs,
      currentElevationM: elevation,
      elevationGainM,
      elevationLossM,
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
    if (isNativePlatform()) {
      if (nativeWatcherId === null) {
        startNativeBackgroundWatch(handleFix, (message) => set({ gpsError: message }))
          .then((id) => {
            nativeWatcherId = id;
          })
          .catch((err: unknown) => {
            set({ gpsError: `Suivi GPS natif indisponible : ${String(err)}` });
          });
      }
    } else if (watchId === null) {
      watchId = navigator.geolocation.watchPosition(
        (position) => handleFix(fromGeolocationPosition(position)),
        handlePositionError,
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
      );
    }
    if (tickIntervalId === null) {
      tickIntervalId = setInterval(() => {
        set((s) => ({ elapsedMs: activeElapsedMs(s, Date.now()) }));
      }, 1000);
    }
    // Sur natif, le service de premier plan garde l'app active écran
    // éteint — le Wake Lock web (qui force l'écran à rester allumé) n'y
    // apporte rien et coûterait de la batterie pour rien.
    if (!isNativePlatform()) void requestWakeLock();
  }

  /**
   * Empêche l'écran de s'éteindre/se verrouiller automatiquement tant que
   * l'enregistrement est actif : sur mobile, un écran verrouillé suspend
   * l'exécution JS (donc watchPosition) — limite du navigateur, pas de
   * BoLac. Sans effet si l'API n'est pas supportée (échoue silencieusement).
   */
  async function requestWakeLock(): Promise<void> {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      set({ wakeLockActive: true });
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
        set({ wakeLockActive: false });
      });
    } catch {
      // Refusé par le navigateur/OS (ex: mode économie de batterie) : on
      // continue sans, le suivi GPS reste actif tant que l'écran ne
      // s'éteint pas de lui-même.
      wakeLockSentinel = null;
      set({ wakeLockActive: false });
    }
  }

  async function releaseWakeLock(): Promise<void> {
    if (wakeLockSentinel) {
      await wakeLockSentinel.release().catch(() => undefined);
      wakeLockSentinel = null;
    }
    set({ wakeLockActive: false });
  }

  // Le navigateur relâche automatiquement le wake lock quand l'onglet perd
  // la visibilité (changement d'app, écran éteint manuellement) ; on le
  // redemande dès qu'on redevient visible, tant que l'enregistrement est
  // toujours en cours. Sans objet sur natif (pas de wake lock demandé).
  document.addEventListener('visibilitychange', () => {
    if (!isNativePlatform() && document.visibilityState === 'visible' && get().status === 'recording') {
      void requestWakeLock();
    }
  });

  return {
    ...initialState,

    startRecording: async (name, activityType) => {
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
        activityType,
        elevationGainM: 0,
        elevationLossM: 0,
      };
      await db.trips.add(trip);

      // Évite d'afficher simultanément un trajet historique (ou un repère
      // de recherche, ou une zone hors ligne consultée) et la trace en
      // cours d'enregistrement sur la carte.
      useMapStore.getState().setViewedTrip(null);
      useMapStore.getState().setSearchResult(null);
      useMapStore.getState().setViewedZone(null);

      elevationBaselineM = null;
      set({
        ...initialState,
        status: 'recording',
        activeTripId: tripId,
        tripName: name,
        activityType,
        recordingStartedAt: now,
      });
      startWatch();
    },

    pauseRecording: () => {
      const now = Date.now();
      stopWatch();
      void releaseWakeLock();
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
      void releaseWakeLock();
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
          elevationGainM: state.elevationGainM,
          elevationLossM: state.elevationLossM,
        });
      }

      set({ ...initialState });
    },
  };
});
