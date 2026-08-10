import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { TripListItem } from '@/features/trips/components/TripListItem';

/**
 * Liste des trajets enregistrés, la plus récente en premier. `useLiveQuery`
 * re-render automatiquement dès qu'un trajet est ajouté/modifié dans
 * IndexedDB — pas besoin de rafraîchir manuellement en revenant sur cet
 * écran après un enregistrement.
 */
export function TripsScreen() {
  const trips = useLiveQuery(() => db.trips.orderBy('createdAt').reverse().toArray(), []);

  if (trips === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Chargement…
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
        <p>Aucun trajet enregistré pour l’instant. Lance un enregistrement depuis l’écran Carte.</p>
      </div>
    );
  }

  return (
    <ul className="h-full space-y-2 overflow-y-auto p-3">
      {trips.map((trip) => (
        <TripListItem key={trip.id} trip={trip} />
      ))}
    </ul>
  );
}
