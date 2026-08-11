import { db } from '@/lib/db/db';
import { buildGpx } from '@/lib/gpx/buildGpx';
import { buildWaypointsGpx } from '@/lib/gpx/buildWaypointsGpx';
import { buildFullBackupZip } from '@/lib/export/buildFullBackupZip';
import { downloadBlob } from '@/lib/browser/downloadBlob';
import { slugify } from '@/lib/text/slugify';

/** Exporte un trajet (trace + ses propres waypoints) en GPX standard. */
export async function exportTripGpx(tripId: string): Promise<void> {
  const trip = await db.trips.get(tripId);
  if (!trip) return;

  const [trackPoints, waypoints] = await Promise.all([
    db.trackPoints.where('tripId').equals(tripId).sortBy('timestamp'),
    db.waypoints.where('tripId').equals(tripId).toArray(),
  ]);

  const gpx = buildGpx(trip, trackPoints, waypoints);
  downloadBlob(new Blob([gpx], { type: 'application/gpx+xml' }), `${slugify(trip.name)}.gpx`);
}

/** Exporte tous les waypoints enregistrés (indépendamment des trajets) en GPX. */
export async function exportAllWaypointsGpx(): Promise<void> {
  const waypoints = await db.waypoints.toArray();
  const gpx = buildWaypointsGpx(waypoints, 'Waypoints BoLac');
  downloadBlob(new Blob([gpx], { type: 'application/gpx+xml' }), 'bolac-waypoints.gpx');
}

/** Exporte la sauvegarde complète (tous les trajets, waypoints et photos) en une archive .zip. */
export async function exportFullBackup(): Promise<void> {
  const blob = await buildFullBackupZip();
  const dateSuffix = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `BoLac-sauvegarde-${dateSuffix}.zip`);
}
