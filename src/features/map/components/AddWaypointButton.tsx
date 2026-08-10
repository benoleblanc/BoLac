import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { MapFabButton, Spinner } from '@/features/map/components/MapFabButton';
import { WaypointFormDialog } from '@/features/waypoints/components/WaypointFormDialog';
import { createWaypoint } from '@/lib/db/waypoints.repo';
import { useMapStore } from '@/stores/mapStore';

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
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
        icon={status === 'locating' ? <Spinner /> : <PlusIcon />}
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
