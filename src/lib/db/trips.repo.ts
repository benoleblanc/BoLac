import { db } from '@/lib/db/db';

/**
 * Supprime un trajet et les données qu'il possède en propre (sa trace GPS,
 * ses photos). Les waypoints rattachés ne sont pas supprimés — ce sont des
 * points d'intérêt réutilisables indépendamment du trajet — seulement
 * détachés (tripId remis à null).
 */
export async function deleteTrip(tripId: string): Promise<void> {
  await db.transaction('rw', db.trips, db.trackPoints, db.waypoints, db.photos, async () => {
    await db.trackPoints.where('tripId').equals(tripId).delete();
    await db.photos.where('tripId').equals(tripId).delete();
    await db.waypoints.where('tripId').equals(tripId).modify({ tripId: null });
    await db.trips.delete(tripId);
  });
}
