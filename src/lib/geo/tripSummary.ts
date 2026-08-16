import { haversineDistanceMeters, type LatLon } from '@/lib/geo/haversine';

/**
 * Même seuil anti-bruit que trackingStore.ts (voir ELEVATION_NOISE_THRESHOLD_M
 * là-bas) — dupliqué ici volontairement plutôt qu'importé, pour ne pas
 * coupler le module d'import au store de suivi en direct.
 */
const ELEVATION_NOISE_THRESHOLD_M = 2;

export interface SummarizablePoint extends LatLon {
  elevation: number | null;
  timestamp: number;
}

export interface TripSummary {
  distanceMeters: number;
  durationMs: number;
  avgSpeedKmh: number;
  elevationGainM: number;
  elevationLossM: number;
}

/**
 * Recalcule les statistiques d'un trajet (distance, durée, vitesse
 * moyenne, dénivelé) directement à partir de sa liste de points — utilisé
 * pour importer un fichier .gpx externe, qui n'a pas ces agrégats déjà
 * calculés (contrairement à une sauvegarde .zip BoLac, dont le
 * metadata.json les contient déjà).
 */
export function computeTripSummary(points: SummarizablePoint[]): TripSummary {
  let distanceMeters = 0;
  let elevationGainM = 0;
  let elevationLossM = 0;
  let elevationBaseline: number | null = null;
  let last: LatLon | null = null;

  for (const p of points) {
    if (last) distanceMeters += haversineDistanceMeters(last, p);
    last = p;

    if (p.elevation !== null) {
      if (elevationBaseline === null) {
        elevationBaseline = p.elevation;
      } else {
        const delta = p.elevation - elevationBaseline;
        if (Math.abs(delta) >= ELEVATION_NOISE_THRESHOLD_M) {
          if (delta > 0) elevationGainM += delta;
          else elevationLossM += -delta;
          elevationBaseline = p.elevation;
        }
      }
    }
  }

  const first = points.at(0) ?? null;
  const lastPoint = points.at(-1) ?? null;
  const durationMs = first && lastPoint ? Math.max(0, lastPoint.timestamp - first.timestamp) : 0;
  const avgSpeedKmh = durationMs > 0 ? (distanceMeters / (durationMs / 1000)) * 3.6 : 0;

  return { distanceMeters, durationMs, avgSpeedKmh, elevationGainM, elevationLossM };
}
