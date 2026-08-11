import type { ActivityType } from '@/types/activity';

/** Un trajet enregistré (sortie en canot, kayak, paddleboard, randonnée, vélo...). */
export interface Trip {
  id: string;
  name: string;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  distanceMeters: number;
  durationMs: number;
  avgSpeedKmh: number;
  status: 'recording' | 'paused' | 'completed';
  activityType: ActivityType;
  /** Somme des montées significatives (m), lissée pour ignorer le bruit GPS d'altitude. */
  elevationGainM: number;
  /** Somme des descentes significatives (m, valeur positive), même lissage. */
  elevationLossM: number;
}

/** Un point GPS relevé pendant l'enregistrement d'un trajet. */
export interface TrackPoint {
  id: string;
  tripId: string;
  lat: number;
  lon: number;
  elevation: number | null;
  accuracyM: number;
  speedMs: number | null;
  timestamp: number;
}
