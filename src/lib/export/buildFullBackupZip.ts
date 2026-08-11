import JSZip from 'jszip';
import { db } from '@/lib/db/db';
import { buildGpx } from '@/lib/gpx/buildGpx';
import { slugify } from '@/lib/text/slugify';

/**
 * Sauvegarde complète de l'expédition, pour transfert manuel vers OneDrive
 * (ou ailleurs) : un GPX par trajet (trace + ses waypoints), un dossier
 * photos, et un metadata.json qui relie le tout.
 *
 * Structure du zip :
 *   metadata.json
 *   trips/<nom-trajet>-<id>.gpx
 *   photos/<numéro>_<id>.jpg
 */
export async function buildFullBackupZip(): Promise<Blob> {
  const [trips, waypoints, photos] = await Promise.all([
    db.trips.orderBy('createdAt').toArray(),
    db.waypoints.toArray(),
    db.photos.toArray(),
  ]);

  const zip = new JSZip();
  const tripsFolder = zip.folder('trips');
  const photosFolder = zip.folder('photos');

  const tripsMeta = [];
  for (const trip of trips) {
    const trackPoints = await db.trackPoints.where('tripId').equals(trip.id).sortBy('timestamp');
    const tripWaypoints = waypoints.filter((w) => w.tripId === trip.id);
    const gpxFileName = `${slugify(trip.name)}-${trip.id.slice(0, 8)}.gpx`;
    tripsFolder?.file(gpxFileName, buildGpx(trip, trackPoints, tripWaypoints));
    tripsMeta.push({
      id: trip.id,
      name: trip.name,
      createdAt: trip.createdAt,
      startedAt: trip.startedAt,
      endedAt: trip.endedAt,
      distanceMeters: trip.distanceMeters,
      durationMs: trip.durationMs,
      avgSpeedKmh: trip.avgSpeedKmh,
      status: trip.status,
      activityType: trip.activityType,
      elevationGainM: trip.elevationGainM,
      elevationLossM: trip.elevationLossM,
      gpxFile: `trips/${gpxFileName}`,
    });
  }

  const photosMeta = photos.map((photo, index) => {
    const ext = photo.blob.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${String(index + 1).padStart(3, '0')}_${photo.id.slice(0, 8)}.${ext}`;
    photosFolder?.file(fileName, photo.blob);
    return {
      id: photo.id,
      lat: photo.lat,
      lon: photo.lon,
      takenAt: photo.takenAt,
      tripId: photo.tripId,
      waypointId: photo.waypointId,
      file: `photos/${fileName}`,
    };
  });

  const metadata = {
    app: 'BoLac',
    exportedAt: new Date().toISOString(),
    trips: tripsMeta,
    waypoints: waypoints.map((w) => ({
      id: w.id,
      name: w.name,
      lat: w.lat,
      lon: w.lon,
      note: w.note,
      createdAt: w.createdAt,
      tripId: w.tripId,
    })),
    photos: photosMeta,
  };
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  return zip.generateAsync({ type: 'blob' });
}
