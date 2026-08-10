/** Un trajet enregistré (sortie en canot, kayak ou paddleboard). */
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
