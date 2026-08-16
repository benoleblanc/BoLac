import JSZip from 'jszip';
import { db } from '@/lib/db/db';
import { parseGpx } from '@/lib/gpx/parseGpx';
import { createThumbnail } from '@/lib/media/createThumbnail';
import type { Trip, TrackPoint } from '@/types/trip';
import type { Waypoint } from '@/types/waypoint';
import type { Photo } from '@/types/photo';
import type { ActivityType } from '@/types/activity';

interface BackupTripMeta {
  id: string;
  name: string;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  distanceMeters: number;
  durationMs: number;
  avgSpeedKmh: number;
  activityType?: ActivityType;
  elevationGainM?: number;
  elevationLossM?: number;
  gpxFile: string;
}

interface BackupWaypointMeta {
  id: string;
  name: string;
  lat: number;
  lon: number;
  note: string | null;
  createdAt: number;
  tripId: string | null;
}

interface BackupPhotoMeta {
  id: string;
  lat: number | null;
  lon: number | null;
  takenAt: number;
  tripId: string | null;
  waypointId: string | null;
  file: string;
}

interface BackupMetadata {
  app: string;
  trips: BackupTripMeta[];
  waypoints: BackupWaypointMeta[];
  photos: BackupPhotoMeta[];
}

export interface ZipImportResult {
  trips: number;
  waypoints: number;
  photos: number;
}

function inferPhotoMime(filePath: string): string {
  return filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
}

/**
 * Restaure une sauvegarde .zip produite par "Télécharger la sauvegarde"
 * (metadata.json + un .gpx par trajet + les photos) — typiquement pour
 * transférer ses trajets d'un téléphone à l'autre. N'écrase jamais les
 * données déjà présentes : tout est réimporté avec de nouveaux
 * identifiants (les liens trajet/waypoint/photo sont recréés via une
 * table de correspondance ancien id → nouvel id), donc importer deux fois
 * la même sauvegarde crée simplement une deuxième copie plutôt que
 * d'écraser ou de planter.
 */
export async function importZipBackup(file: File | Blob): Promise<ZipImportResult> {
  const zip = await JSZip.loadAsync(file);
  const metadataEntry = zip.file('metadata.json');
  if (!metadataEntry) {
    throw new Error('Fichier de sauvegarde invalide (metadata.json manquant).');
  }
  const metadata = JSON.parse(await metadataEntry.async('string')) as BackupMetadata;

  const tripIdMap = new Map<string, string>();
  const waypointIdMap = new Map<string, string>();

  for (const tripMeta of metadata.trips) {
    const newTripId = crypto.randomUUID();
    tripIdMap.set(tripMeta.id, newTripId);

    const points: TrackPoint[] = [];
    const gpxEntry = zip.file(tripMeta.gpxFile);
    if (gpxEntry) {
      const parsed = parseGpx(await gpxEntry.async('string'));
      for (const p of parsed.trackPoints) {
        points.push({
          id: crypto.randomUUID(),
          tripId: newTripId,
          lat: p.lat,
          lon: p.lon,
          elevation: p.elevation,
          accuracyM: 0,
          speedMs: null,
          timestamp: p.timestamp,
        });
      }
    }

    const trip: Trip = {
      id: newTripId,
      name: tripMeta.name,
      createdAt: tripMeta.createdAt,
      startedAt: tripMeta.startedAt,
      endedAt: tripMeta.endedAt,
      distanceMeters: tripMeta.distanceMeters,
      durationMs: tripMeta.durationMs,
      avgSpeedKmh: tripMeta.avgSpeedKmh,
      // Un trajet importé est forcément déjà terminé, même si la sauvegarde
      // d'origine avait été faite en plein enregistrement (aucune session
      // en direct ne peut être "reprise" derrière un import).
      status: 'completed',
      activityType: tripMeta.activityType ?? 'kayak',
      elevationGainM: tripMeta.elevationGainM ?? 0,
      elevationLossM: tripMeta.elevationLossM ?? 0,
    };
    await db.trips.add(trip);
    if (points.length > 0) await db.trackPoints.bulkAdd(points);
  }

  for (const wptMeta of metadata.waypoints) {
    const newWaypointId = crypto.randomUUID();
    waypointIdMap.set(wptMeta.id, newWaypointId);

    const waypoint: Waypoint = {
      id: newWaypointId,
      name: wptMeta.name,
      lat: wptMeta.lat,
      lon: wptMeta.lon,
      tripId: wptMeta.tripId ? (tripIdMap.get(wptMeta.tripId) ?? null) : null,
      createdAt: wptMeta.createdAt,
      note: wptMeta.note,
    };
    await db.waypoints.add(waypoint);
  }

  let photoCount = 0;
  for (const photoMeta of metadata.photos) {
    const entry = zip.file(photoMeta.file);
    if (!entry) continue;

    const arrayBuffer = await entry.async('arraybuffer');
    const blob = new Blob([arrayBuffer], { type: inferPhotoMime(photoMeta.file) });
    const thumbnailBlob = await createThumbnail(blob).catch(() => null);

    const photo: Photo = {
      id: crypto.randomUUID(),
      blob,
      thumbnailBlob,
      lat: photoMeta.lat,
      lon: photoMeta.lon,
      takenAt: photoMeta.takenAt,
      tripId: photoMeta.tripId ? (tripIdMap.get(photoMeta.tripId) ?? null) : null,
      waypointId: photoMeta.waypointId ? (waypointIdMap.get(photoMeta.waypointId) ?? null) : null,
    };
    await db.photos.add(photo);
    photoCount += 1;
  }

  return { trips: metadata.trips.length, waypoints: metadata.waypoints.length, photos: photoCount };
}
