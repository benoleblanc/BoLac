import { useMemo, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { tilesForBounds } from '@/lib/geo/tiles';
import { createZone } from '@/lib/db/tiles.repo';
import { downloadZone } from '@/lib/tiles/downloadZone';
import { useTileDownloadStore } from '@/stores/tileDownloadStore';
import { formatBytes } from '@/lib/format';
import { Portal } from '@/components/Portal';

/** Estimation moyenne de la taille d'une tuile PNG OpenTopoMap, pour l'affichage avant téléchargement. */
const AVG_TILE_BYTES = 18_000;
const MIN_ZOOM_OPTION = 8;
const MAX_ZOOM_OPTION = 17;
const LARGE_ZONE_WARNING_THRESHOLD = 2000;

interface DownloadZonePanelProps {
  open: boolean;
  map: LeafletMap;
  onClose: () => void;
}

export function DownloadZonePanel({ open, map, onClose }: DownloadZonePanelProps) {
  const [name, setName] = useState('');
  const [minZoom, setMinZoom] = useState(12);
  const [maxZoom, setMaxZoom] = useState(16);
  const [isStarting, setIsStarting] = useState(false);

  const status = useTileDownloadStore((s) => s.status);
  const completed = useTileDownloadStore((s) => s.completed);
  const total = useTileDownloadStore((s) => s.total);
  const failed = useTileDownloadStore((s) => s.failed);
  const reset = useTileDownloadStore((s) => s.reset);

  const estimate = useMemo(() => {
    if (!open) return { count: 0, bytes: 0 };
    const bounds = map.getBounds();
    const tiles = tilesForBounds(
      {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      minZoom,
      maxZoom,
    );
    return { count: tiles.length, bytes: tiles.length * AVG_TILE_BYTES };
  }, [open, map, minZoom, maxZoom]);

  if (!open) return null;

  async function handleStart() {
    const bounds = map.getBounds();
    setIsStarting(true);
    try {
      const zone = await createZone({
        name:
          name.trim().length > 0
            ? name.trim()
            : `Zone du ${new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium' }).format(new Date())}`,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        minZoom,
        maxZoom,
        tileCount: estimate.count,
        sizeBytesEstimate: estimate.bytes,
      });
      // Tourne en arrière-plan, indépendamment de ce panneau — la
      // progression reste consultable via tileDownloadStore même si on
      // ferme ce dialogue entre-temps.
      void downloadZone(zone);
    } finally {
      setIsStarting(false);
    }
  }

  function handleCloseAfterCompletion() {
    reset();
    onClose();
  }

  const isDownloading = status === 'downloading';
  const isCompleted = status === 'done' || status === 'error';

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label="Télécharger une zone hors ligne"
      >
        <div className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
          {isDownloading && (
            <>
              <h2 className="mb-3 text-base font-semibold">Téléchargement en cours…</h2>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-600 transition-all"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                {completed} / {total} tuiles
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Continuer en arrière-plan
                </button>
              </div>
            </>
          )}

          {isCompleted && (
            <>
              <h2 className="mb-1 text-base font-semibold">
                {status === 'done' ? 'Zone téléchargée ✅' : 'Téléchargement terminé avec des erreurs'}
              </h2>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                {status === 'done'
                  ? `${completed} tuiles enregistrées pour un usage hors ligne.`
                  : `${completed - failed} tuiles enregistrées, ${failed} ont échoué (réseau instable ?). Cette zone reste utilisable, avec quelques trous de couverture.`}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseAfterCompletion}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
                >
                  Fermer
                </button>
              </div>
            </>
          )}

          {!isDownloading && !isCompleted && (
            <>
              <h2 className="mb-1 text-base font-semibold">Télécharger cette zone</h2>
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                La zone actuellement affichée à l’écran sera téléchargée pour un usage hors ligne,
                toujours avec le fond « Plein air » (seul fond disponible hors ligne, peu importe
                celui affiché en ce moment). Ferme ce panneau pour ajuster le cadrage si besoin,
                puis rouvre-le.
              </p>

              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Lac Beauport"
                className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700"
              />

              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Zoom min : {minZoom}
                  <input
                    type="range"
                    min={MIN_ZOOM_OPTION}
                    max={maxZoom}
                    value={minZoom}
                    onChange={(e) => setMinZoom(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Zoom max : {maxZoom}
                  <input
                    type="range"
                    min={minZoom}
                    max={MAX_ZOOM_OPTION}
                    value={maxZoom}
                    onChange={(e) => setMaxZoom(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
              </div>

              <details className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                <summary className="cursor-pointer select-none font-medium text-slate-600 dark:text-slate-300">
                  À quoi correspondent les niveaux de zoom ?
                </summary>
                <ul className="mt-2 space-y-1 pl-1">
                  <li><strong>8</strong> — vue régionale (plusieurs municipalités)</li>
                  <li><strong>10</strong> — une ville ou un grand lac au complet</li>
                  <li><strong>12</strong> — un lac avec son pourtour</li>
                  <li><strong>14</strong> — rues et sentiers principaux</li>
                  <li><strong>16</strong> — quais, sentiers, petits bâtiments</li>
                  <li><strong>17</strong> — détail maximal (bâtiments individuels)</li>
                </ul>
              </details>

              <p className="mt-3 text-sm">
                ≈ {estimate.count.toLocaleString('fr-CA')} tuiles · {formatBytes(estimate.bytes)}
              </p>
              {estimate.count > LARGE_ZONE_WARNING_THRESHOLD && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Zone assez grande — réduis le zoom max ou la zone visible pour un téléchargement
                  plus rapide.
                </p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isStarting || estimate.count === 0}
                  onClick={handleStart}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
                >
                  Télécharger
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
