import { useMapStore } from '@/stores/mapStore';

/** Bandeau affiché quand un résultat de recherche est épinglé sur la carte, avec un bouton pour le retirer. */
export function SearchResultBanner() {
  const searchResult = useMapStore((s) => s.searchResult);
  const setSearchResult = useMapStore((s) => s.setSearchResult);

  if (!searchResult) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur dark:bg-slate-900/95">
      <p className="truncate text-sm font-medium">Résultat : {searchResult.name}</p>
      <button
        type="button"
        onClick={() => setSearchResult(null)}
        aria-label="Retirer le résultat de recherche"
        className="ml-2 shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        ✕
      </button>
    </div>
  );
}
