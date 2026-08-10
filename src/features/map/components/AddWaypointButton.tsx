import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { MapFabButton, Spinner } from '@/features/map/components/MapFabButton';
import { WaypointFormDialog } from '@/features/waypoints/components/WaypointFormDialog';
import { createWaypoint } from '@/lib/db/waypoints.repo';
import { useMapStore } from '@/stores/mapStore';

// Même silhouette de pin que les marqueurs sur la carte (voir
// features/map/lib/waypointIcon.ts), réduite et surmontée d'un point
// séparé — plus reconnaissable comme « déposer un point » qu'un simple
// "+", qui se confond avec un contrôle de zoom.
function AddWaypointIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <g transform="translate(12 9) scale(0.72) translate(-12 -9)">
        <path
          fill="currentColor"
          d="M12 2C7.6 2 4 5.6 4 10c0 5.6 6.6 11.2 7.3 11.8a1 1 0 0 0 1.4 0C13.4 21.2 20 15.6 20 10c0-4.4-3.6-8-8-8Z"
        />
        <circle cx="12" cy="10" r="3" className="fill-white dark:fill-slate-900" />
      </g>
      <circle cx="12" cy="21.8" r="1.4" fill="currentColor" />
    </svg>
  );
}

type Status = 'idle' | 'locating' | 'naming';

/** Capture la position actuelle et propose de la nommer pour créer un nouveau waypoint. */
export function AddWaypointButton() {
  const map = useMap();
  const setSelectedWaypoint = useMapStore((s) => s.setSelectedWaypoint);

  const [status, setStatus] = useState<Status>('idle');
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleClick() {
    if (!('geolocation' in navigator)) {
      setError('Géolocalisation indisponible sur cet appareil.');
      return;
    }

    setStatus('locating');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPendingCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setStatus('naming');
      },
      () => {
        setError('Impossible d’obtenir ta position — vérifie les autorisations.');
        setStatus('idle');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function handleConfirm(name: string, note: string) {
    if (!pendingCoords) return;

    setIsSaving(true);
    try {
      const waypoint = await createWaypoint({
        name,
        note: note.length > 0 ? note : null,
        lat: pendingCoords.lat,
        lon: pendingCoords.lon,
      });
      map.setView([pendingCoords.lat, pendingCoords.lon], Math.max(map.getZoom(), 15));
      setSelectedWaypoint(waypoint.id);
      setStatus('idle');
      setPendingCoords(null);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setStatus('idle');
    setPendingCoords(null);
  }

  return (
    <>
      <MapFabButton
        icon={status === 'locating' ? <Spinner /> : <AddWaypointIcon />}
        ariaLabel="Ajouter un waypoint ici"
        onClick={handleClick}
        disabled={status === 'locating'}
        error={error}
      />

      <WaypointFormDialog
        open={status === 'naming'}
        title="Nommer ce waypoint"
        confirmLabel="Enregistrer"
        busy={isSaving}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
