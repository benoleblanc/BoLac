import L from 'leaflet';
import { getTile } from '@/lib/db/tiles.repo';
import { tileUrl } from '@/lib/tiles/tileUrl';

/**
 * TileLayer qui lit d'abord le cache IndexedDB (tuiles téléchargées via une
 * zone hors ligne, voir downloadZone.ts) avant de retomber sur le réseau.
 *
 * Ne met PAS en cache automatiquement les tuiles vues au fil de la
 * navigation en ligne — choix du produit : seules les zones explicitement
 * téléchargées à l'avance sont persistées (voir DownloadZonePanel), pas de
 * cache opportuniste.
 */
// @types/leaflet type ses classes de base `Class.extend()` pour renvoyer un
// constructeur générique (perd la signature (url, options) de TileLayer) —
// on republie le résultat avec le bon type de constructeur plutôt que de
// forcer un cast à chaque site d'utilisation.
const OfflineTileLayerClass = L.TileLayer.extend({
  createTile(coords: { x: number; y: number; z: number }, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('img');
    const { x, y, z } = coords;

    getTile(z, x, y)
      .then((cached) => {
        if (cached) {
          const objectUrl = URL.createObjectURL(cached.blob);
          tile.onload = () => {
            done(undefined, tile);
            URL.revokeObjectURL(objectUrl);
          };
          tile.onerror = () => done(new Error('Tuile en cache invalide'), tile);
          tile.src = objectUrl;
          return;
        }

        if (navigator.onLine) {
          tile.onload = () => done(undefined, tile);
          tile.onerror = () => done(new Error('Échec du chargement de la tuile'), tile);
          tile.src = tileUrl(z, x, y);
          return;
        }

        // Hors ligne et absente du cache : tuile vide (pas d'erreur bloquante),
        // teintée légèrement pour signaler visuellement un trou de couverture.
        tile.style.backgroundColor = '#e5e7eb';
        done(undefined, tile);
      })
      .catch(() => done(new Error('Erreur de lecture du cache de tuiles'), tile));

    return tile;
  },
});

export const OfflineTileLayer = OfflineTileLayerClass as unknown as new (
  urlTemplate: string,
  options?: L.TileLayerOptions,
) => L.TileLayer;
