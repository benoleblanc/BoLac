import { db } from '@/lib/db/db';
import { tilesForBounds } from '@/lib/geo/tiles';
import { tileUrl } from '@/lib/tiles/tileUrl';
import { useTileDownloadStore } from '@/stores/tileDownloadStore';
import type { DownloadZone } from '@/types/tile';

/**
 * Requêtes en parallèle pendant le téléchargement — reste modeste pour un
 * usage responsable d'un service tuile public gratuit (OpenTopoMap), pas
 * une valeur maximisant la vitesse.
 */
const CONCURRENCY = 4;

/**
 * Télécharge toutes les tuiles d'une zone et les écrit dans IndexedDB au fur
 * et à mesure. Une tuile déjà présente (reprise après une interruption,
 * zones qui se chevauchent) n'est pas re-téléchargée. Tourne indépendamment
 * du cycle de vie d'un composant React — un panneau qui se ferme n'annule
 * pas le téléchargement en cours.
 */
export async function downloadZone(zone: DownloadZone): Promise<void> {
  const tiles = tilesForBounds(zone.bounds, zone.minZoom, zone.maxZoom);
  useTileDownloadStore.getState().start(zone.id, tiles.length);

  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tiles.length) {
      const tile = tiles[nextIndex++];
      if (!tile) continue;
      const { z, x, y } = tile;
      const key = `${z}/${x}/${y}`;

      const existing = await db.tiles.get(key);
      if (existing) {
        useTileDownloadStore.getState().reportProgress(true);
        continue;
      }

      try {
        const response = await fetch(tileUrl(z, x, y));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        await db.tiles.put({ key, z, x, y, blob, zoneId: zone.id, downloadedAt: Date.now() });
        useTileDownloadStore.getState().reportProgress(true);
      } catch {
        useTileDownloadStore.getState().reportProgress(false);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  useTileDownloadStore.getState().finish();

  // Affine les métadonnées de la zone avec les chiffres réels plutôt que
  // l'estimation d'avant-téléchargement (taille exacte des blobs, nombre de
  // tuiles réellement obtenues si certaines ont échoué).
  const downloadedTiles = await db.tiles.where('zoneId').equals(zone.id).toArray();
  const sizeBytes = downloadedTiles.reduce((sum, t) => sum + t.blob.size, 0);
  const failed = useTileDownloadStore.getState().failed;

  await db.zones.update(zone.id, {
    status: failed > 0 ? 'error' : 'complete',
    tileCount: downloadedTiles.length,
    sizeBytesEstimate: sizeBytes,
  });
}
