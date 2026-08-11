import { useState } from 'react';
import type { Trip } from '@/types/trip';
import { ACTIVITY_LABELS } from '@/types/activity';
import { formatDistanceKm, formatDuration, formatElevation, formatKmh } from '@/lib/format';
import { useMapStore } from '@/stores/mapStore';
import { useUiStore } from '@/stores/uiStore';
import { deleteTrip } from '@/lib/db/trips.repo';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PhotoGallery } from '@/features/photos/components/PhotoGallery';

const dateFormatter = new Intl.DateTimeFormat('fr-CA', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1A2 2 0 0 1 15.3 21H8.7a2 2 0 0 1-2-1.9L6 7h12Z" />
    </svg>
  );
}

export function TripListItem({ trip }: { trip: Trip }) {
  const setViewedTrip = useMapStore((s) => s.setViewedTrip);
  const setActiveScreen = useUiStore((s) => s.setActiveScreen);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startedLabel = dateFormatter.format(new Date(trip.startedAt ?? trip.createdAt));

  function handleViewOnMap() {
    setViewedTrip(trip.id);
    setActiveScreen('map');
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deleteTrip(trip.id);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{trip.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {startedLabel} · {ACTIVITY_LABELS[trip.activityType]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {trip.status !== 'completed' && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              Interrompu
            </span>
          )}
          <button
            type="button"
            onClick={handleViewOnMap}
            aria-label="Voir ce trajet sur la carte"
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <MapPinIcon />
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Supprimer ce trajet"
            className="rounded-full p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-4 gap-2 text-center text-sm">
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
        <div>
          <dt className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Dénivelé +</dt>
          <dd className="font-semibold tabular-nums">{formatElevation(trip.elevationGainM)}</dd>
        </div>
      </dl>

      <PhotoGallery tripId={trip.id} />

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer ce trajet ?"
        message={`« ${trip.name} » et sa trace GPS seront supprimés définitivement.`}
        confirmLabel="Supprimer"
        busy={isDeleting}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  );
}
