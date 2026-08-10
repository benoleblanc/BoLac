import { db } from '@/lib/db/db';
import type { CachedTile, DownloadZone } from '@/types/tile';

export async function getTile(z: number, x: number, y: number): Promise<CachedTile | undefined> {
  return db.tiles.get(`${z}/${x}/${y}`);
}

interface CreateZoneInput {
  name: string;
  bounds: DownloadZone['bounds'];
  minZoom: number;
  maxZoom: number;
  tileCount: number;
  sizeBytesEstimate: number;
}

export async function createZone(input: CreateZoneInput): Promise<DownloadZone> {
  const zone: DownloadZone = {
    id: crypto.randomUUID(),
    name: input.name,
    bounds: input.bounds,
    minZoom: input.minZoom,
    maxZoom: input.maxZoom,
    tileCount: input.tileCount,
    sizeBytesEstimate: input.sizeBytesEstimate,
    createdAt: Date.now(),
    status: 'downloading',
  };
  await db.zones.add(zone);
  return zone;
}

/** Supprime une zone téléchargée et toutes ses tuiles. */
export async function deleteZone(zoneId: string): Promise<void> {
  await db.transaction('rw', db.zones, db.tiles, async () => {
    await db.tiles.where('zoneId').equals(zoneId).delete();
    await db.zones.delete(zoneId);
  });
}
