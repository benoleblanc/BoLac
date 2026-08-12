import { useMapStore } from '@/stores/mapStore';

/** Bandeau affiché quand une zone hors ligne est consultée sur la carte, avec un bouton pour fermer. */
export function ViewedZoneBanner() {
  const viewedZone = useMapStore((s) => s.viewedZone);
  const setViewedZone = useMapStore((s) => s.setViewedZone);

  if (!viewedZone) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur dark:bg-slate-900/95">
      <p className="truncate text-sm font-medium">Zone hors ligne : {viewedZone.name}</p>
      <button
        type="button"
        onClick={() => setViewedZone(null)}
        aria-label="Fermer l’affichage de la zone"
        className="ml-2 shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        ✕
      </button>
    </div>
  );
}
