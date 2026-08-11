import { useEffect, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { Portal } from '@/components/Portal';
import { searchPlaces, type PlaceResult } from '@/lib/geocoding/searchPlaces';
import { useMapStore } from '@/stores/mapStore';

const DEBOUNCE_MS = 500;

interface PlaceSearchPanelProps {
  open: boolean;
  map: LeafletMap;
  onClose: () => void;
}

type Status = 'idle' | 'loading' | 'error';

export function PlaceSearchPanel({ open, map, onClose }: PlaceSearchPanelProps) {
  const setSearchResult = useMapStore((s) => s.setSearchResult);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [status, setStatus] = useState<Status>('idle');

  // Réinitialise à chaque ouverture pour repartir sur une recherche propre.
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setStatus('idle');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setStatus('loading');
      searchPlaces(trimmed, controller.signal)
        .then((rows) => {
          setResults(rows);
          setStatus('idle');
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setStatus('error');
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  if (!open) return null;

  function handleSelect(result: PlaceResult) {
    map.fitBounds(
      [
        [result.bounds.south, result.bounds.west],
        [result.bounds.north, result.bounds.east],
      ],
      { padding: [32, 32], maxZoom: 15 },
    );
    // Épingle l'emplacement exact — un fitBounds seul peut cadrer toute une
    // région (ex. une montagne dans son massif) sans indiquer où regarder.
    setSearchResult({ lat: result.lat, lon: result.lon, name: result.name });
    onClose();
  }

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-start justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher un lieu"
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900"
          style={{ marginTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lac, village, montagne…"
              className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la recherche"
              className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="mt-2 max-h-[60vh] overflow-y-auto">
            {status === 'loading' && (
              <p className="px-1 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
                Recherche…
              </p>
            )}
            {status === 'error' && (
              <p className="px-1 py-3 text-center text-sm text-red-600 dark:text-red-400">
                Recherche indisponible — vérifie ta connexion.
              </p>
            )}
            {status === 'idle' && query.trim().length >= 2 && results.length === 0 && (
              <p className="px-1 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
                Aucun résultat.
              </p>
            )}
            {results.length > 0 && (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(result)}
                      className="w-full px-1 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <p className="truncate text-sm font-medium">{result.name}</p>
                      {result.label && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {result.label}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {results.length > 0 && (
            <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
              Résultats via OpenStreetMap / Photon
            </p>
          )}
        </div>
      </div>
    </Portal>
  );
}
