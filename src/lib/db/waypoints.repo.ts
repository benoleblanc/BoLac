import { db } from '@/lib/db/db';
import type { Waypoint } from '@/types/waypoint';

interface CreateWaypointInput {
  name: string;
  lat: number;
  lon: number;
  note?: string | null;
  tripId?: string | null;
}

export async function createWaypoint(input: CreateWaypointInput): Promise<Waypoint> {
  const waypoint: Waypoint = {
    id: crypto.randomUUID(),
    name: input.name,
    lat: input.lat,
    lon: input.lon,
    tripId: input.tripId ?? null,
    createdAt: Date.now(),
    note: input.note ?? null,
  };
  await db.waypoints.add(waypoint);
  return waypoint;
}

/** Renomme un waypoint déjà enregistré. */
export async function renameWaypoint(waypointId: string, name: string): Promise<void> {
  await db.waypoints.update(waypointId, { name });
}

/** Supprime un waypoint et les photos qui lui sont rattachées. */
export async function deleteWaypoint(waypointId: string): Promise<void> {
  await db.transaction('rw', db.waypoints, db.photos, async () => {
    await db.photos.where('waypointId').equals(waypointId).delete();
    await db.waypoints.delete(waypointId);
  });
}
