import { db } from '@/lib/db/db';
import { parseGpx } from '@/lib/gpx/parseGpx';
import { computeTripSummary } from '@/lib/geo/tripSummary';
import { ACTIVITY_LABELS, ACTIVITY_ORDER, DEFAULT_ACTIVITY, type ActivityType } from '@/types/activity';
import type { Trip, TrackPoint } from '@/types/trip';
import type { Waypoint } from '@/types/waypoint';

export interface GpxImportResult {
  trips: number;
  waypoints: number;
}

/** Retrouve l'ActivityType dont le libellé français correspond au `<type>` du GPX, sinon une valeur par défaut. */
function resolveActivityType(label: string | null): ActivityType {
  if (!label) return DEFAULT_ACTIVITY;
  const match = ACTIVITY_ORDER.find((key) => ACTIVITY_LABELS[key] === label);
  return match ?? DEFAULT_ACTIVITY;
}

/**
 * Importe un fichier .gpx isolé (exporté par BoLac, ou par une autre
 * application) : crée un nouveau trajet si le fichier contient une trace
 * (`<trkpt>`), et/ou des waypoints s'il en contient (`<wpt>`), rattachés à
 * ce trajet le cas échéant. Les statistiques (distance, durée, dénivelé)
 * sont recalculées à partir des points, faute de les avoir déjà toutes
 * faites (contrairement à un import de sauvegarde .zip).
 */
export async function importGpxFile(file: File | Blob, fallbackName: string): Promise<GpxImportResult> {
  const text = await file.text();
  const parsed = parseGpx(text);

  let tripId: string | null = null;
  let tripsCreated = 0;

  if (parsed.trackPoints.length > 0) {
    tripId = crypto.randomUUID();
    const summary = computeTripSummary(parsed.trackPoints);
    const startedAt = parsed.trackPoints[0]?.timestamp ?? Date.now();
    const endedAt = parsed.trackPoints.at(-1)?.timestamp ?? startedAt;

    const trip: Trip = {
      id: tripId,
      name: parsed.name ?? fallbackName,
      createdAt: startedAt,
      startedAt,
      endedAt,
      distanceMeters: summary.distanceMeters,
      durationMs: summary.durationMs,
      avgSpeedKmh: summary.avgSpeedKmh,
      status: 'completed',
      activityType: resolveActivityType(parsed.activityTypeLabel),
      elevationGainM: summary.elevationGainM,
      elevationLossM: summary.elevationLossM,
    };
    await db.trips.add(trip);

    const points: TrackPoint[] = parsed.trackPoints.map((p) => ({
      id: crypto.randomUUID(),
      tripId: tripId!,
      lat: p.lat,
      lon: p.lon,
      elevation: p.elevation,
      // Un point rejoué depuis un fichier GPX n'a pas de précision GPS
      // d'origine à conserver — il ne sera de toute façon plus jamais
      // filtré/recalculé après coup, seulement affiché.
      accuracyM: 0,
      speedMs: null,
      timestamp: p.timestamp,
    }));
    await db.trackPoints.bulkAdd(points);
    tripsCreated = 1;
  }

  const waypoints: Waypoint[] = parsed.waypoints.map((w) => ({
    id: crypto.randomUUID(),
    name: w.name,
    lat: w.lat,
    lon: w.lon,
    tripId,
    createdAt: w.createdAt,
    note: w.note,
  }));
  if (waypoints.length > 0) await db.waypoints.bulkAdd(waypoints);

  return { trips: tripsCreated, waypoints: waypoints.length };
}
