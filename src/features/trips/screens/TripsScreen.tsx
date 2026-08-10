import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { useTrackingStore } from '@/stores/trackingStore';
import { TripListItem } from '@/features/trips/components/TripListItem';

/**
 * Liste des trajets enregistrés, la plus récente en premier. `useLiveQuery`
 * re-render automatiquement dès qu'un trajet est ajouté/modifié/supprimé
 * dans IndexedDB — pas besoin de rafraîchir manuellement.
 *
 * La session en cours d'enregistrement (le cas échéant) est exclue de la
 * liste : elle n'est pas encore finalisée et ne devrait pas pouvoir être
 * supprimée par erreur pendant qu'elle tourne.
 */
export function TripsScreen() {
  const activeTripId = useTrackingStore((s) => s.activeTripId);
  const trips = useLiveQuery(() => db.trips.orderBy('createdAt').reverse().toArray(), []);

  if (trips === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Chargement…
      </div>
    );
  }

  const visibleTrips = trips.filter((trip) => trip.id !== activeTripId);

  if (visibleTrips.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
        <p>Aucun trajet enregistré pour l’instant. Lance un enregistrement depuis l’écran Carte.</p>
      </div>
    );
  }

  return (
    <ul className="h-full space-y-2 overflow-y-auto p-3">
      {visibleTrips.map((trip) => (
        <TripListItem key={trip.id} trip={trip} />
      ))}
    </ul>
  );
}
