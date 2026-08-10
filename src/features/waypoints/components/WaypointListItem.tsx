import { useState } from 'react';
import type { Waypoint } from '@/types/waypoint';
import { useMapStore } from '@/stores/mapStore';
import { useUiStore } from '@/stores/uiStore';
import { deleteWaypoint } from '@/lib/db/waypoints.repo';
import { googleMapsDirectionsUrl } from '@/lib/geo/geoLinks';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PhotoCaptureButton } from '@/features/photos/components/PhotoCaptureButton';
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

function DirectionsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 11 18-8-8 18-2-8-8-2Z" />
    </svg>
  );
}

export function WaypointListItem({ waypoint }: { waypoint: Waypoint }) {
  const setView = useMapStore((s) => s.setView);
  const setSelectedWaypoint = useMapStore((s) => s.setSelectedWaypoint);
  const setActiveScreen = useUiStore((s) => s.setActiveScreen);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleViewOnMap() {
    setView([waypoint.lat, waypoint.lon], 16);
    setSelectedWaypoint(waypoint.id);
    setActiveScreen('map');
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deleteWaypoint(waypoint.id);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{waypoint.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {dateFormatter.format(new Date(waypoint.createdAt))}
          </p>
          {waypoint.note && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{waypoint.note}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <PhotoCaptureButton
            waypointId={waypoint.id}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          />
          <button
            type="button"
            onClick={handleViewOnMap}
            aria-label="Voir ce waypoint sur la carte"
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <MapPinIcon />
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Supprimer ce waypoint"
            className="rounded-full p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <PhotoGallery waypointId={waypoint.id} />

      <a
        href={googleMapsDirectionsUrl(waypoint.lat, waypoint.lon)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 py-2 text-sm font-medium text-white hover:bg-cyan-700"
      >
        <DirectionsIcon />
        S’y rendre
      </a>

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer ce waypoint ?"
        message={`« ${waypoint.name} » sera supprimé définitivement.`}
        confirmLabel="Supprimer"
        busy={isDeleting}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  );
}
