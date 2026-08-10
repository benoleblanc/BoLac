import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { WaypointListItem } from '@/features/waypoints/components/WaypointListItem';

export function WaypointsScreen() {
  const waypoints = useLiveQuery(() => db.waypoints.orderBy('createdAt').reverse().toArray(), []);

  if (waypoints === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Chargement…
      </div>
    );
  }

  if (waypoints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
        <p>
          Aucun waypoint enregistré pour l’instant. Ajoute-en un depuis l’écran Carte (mise à
          l’eau, stationnement, point de vue…).
        </p>
      </div>
    );
  }

  return (
    <ul className="h-full space-y-2 overflow-y-auto p-3">
      {waypoints.map((wp) => (
        <WaypointListItem key={wp.id} waypoint={wp} />
      ))}
    </ul>
  );
}
