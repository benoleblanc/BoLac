import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { useMapStore } from '@/stores/mapStore';
import type { Trip } from '@/types/trip';

/** Bandeau affiché quand un trajet historique est consulté sur la carte, avec un bouton pour fermer. */
export function ViewedTripBanner() {
  const viewedTripId = useMapStore((s) => s.viewedTripId);
  const setViewedTrip = useMapStore((s) => s.setViewedTrip);

  const trip = useLiveQuery<Trip | undefined>(
    () => (viewedTripId ? db.trips.get(viewedTripId) : Promise.resolve(undefined)),
    [viewedTripId],
  );

  if (!viewedTripId || !trip) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur dark:bg-slate-900/95">
      <p className="truncate text-sm font-medium">Trajet : {trip.name}</p>
      <button
        type="button"
        onClick={() => setViewedTrip(null)}
        aria-label="Fermer l’affichage du trajet"
        className="ml-2 shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        ✕
      </button>
    </div>
  );
}
