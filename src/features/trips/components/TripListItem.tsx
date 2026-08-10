import type { Trip } from '@/types/trip';
import { formatDistanceKm, formatDuration, formatKmh } from '@/lib/format';

const dateFormatter = new Intl.DateTimeFormat('fr-CA', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function TripListItem({ trip }: { trip: Trip }) {
  const startedLabel = dateFormatter.format(new Date(trip.startedAt ?? trip.createdAt));

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{trip.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{startedLabel}</p>
        </div>
        {trip.status !== 'completed' && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Interrompu
          </span>
        )}
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <dt className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Distance</dt>
          <dd className="font-semibold tabular-nums">{formatDistanceKm(trip.distanceMeters)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Durée</dt>
          <dd className="font-semibold tabular-nums">{formatDuration(trip.durationMs)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Moyenne</dt>
          <dd className="font-semibold tabular-nums">{formatKmh(trip.avgSpeedKmh)}</dd>
        </div>
      </dl>
    </li>
  );
}
