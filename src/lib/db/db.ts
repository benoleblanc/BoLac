import Dexie, { type Table } from 'dexie';
import type { Trip, TrackPoint } from '@/types/trip';
import type { Waypoint } from '@/types/waypoint';
import type { Photo } from '@/types/photo';
import type { CachedTile, DownloadZone } from '@/types/tile';

/**
 * Base IndexedDB locale de BoLac — source de vérité offline pour les trajets,
 * waypoints, photos et tuiles de carte téléchargées.
 *
 * Les relations (tripId, waypointId, zoneId) sont gérées applicativement :
 * Dexie ne fait pas d'intégrité référentielle, donc toute suppression en
 * cascade (ex: effacer un trip et ses trackPoints/photos) doit être
 * implémentée explicitement dans les repos CRUD à venir.
 */
export class BoLacDB extends Dexie {
  trips!: Table<Trip, string>;
  trackPoints!: Table<TrackPoint, string>;
  waypoints!: Table<Waypoint, string>;
  photos!: Table<Photo, string>;
  tiles!: Table<CachedTile, string>;
  zones!: Table<DownloadZone, string>;

  constructor() {
    super('bolac');

    this.version(1).stores({
      trips: 'id, status, createdAt',
      trackPoints: 'id, tripId, timestamp',
      waypoints: 'id, tripId, createdAt',
      photos: 'id, tripId, waypointId, takenAt',
      tiles: 'key, zoneId, [z+x+y]',
      zones: 'id, status, createdAt',
    });

    // v2 : ajout du sport pratiqué (activityType) et du dénivelé (gain/perte)
    // sur Trip, pour permettre d'autres activités de plein air que les
    // sports nautiques. Aucun nouvel index requis, mais les trajets déjà
    // enregistrés n'ont pas ces champs — on les complète avec des valeurs
    // par défaut neutres pour que le reste de l'app puisse les lire sans
    // undefined.
    this.version(2)
      .stores({
        trips: 'id, status, createdAt',
        trackPoints: 'id, tripId, timestamp',
        waypoints: 'id, tripId, createdAt',
        photos: 'id, tripId, waypointId, takenAt',
        tiles: 'key, zoneId, [z+x+y]',
        zones: 'id, status, createdAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('trips')
          .toCollection()
          .modify((trip) => {
            if (trip.activityType === undefined) trip.activityType = 'kayak';
            if (trip.elevationGainM === undefined) trip.elevationGainM = 0;
            if (trip.elevationLossM === undefined) trip.elevationLossM = 0;
          });
      });
  }
}

export const db = new BoLacDB();
