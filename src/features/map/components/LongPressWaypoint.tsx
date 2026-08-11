import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L, { type LeafletMouseEvent } from 'leaflet';
import { WaypointFormDialog } from '@/features/waypoints/components/WaypointFormDialog';
import { useMapInteractionLock } from '@/features/map/hooks/useMapInteractionLock';
import { createWaypoint } from '@/lib/db/waypoints.repo';
import { useMapStore } from '@/stores/mapStore';

/**
 * Dépose un waypoint à un endroit précis de la carte via un appui long —
 * Leaflet traduit nativement un appui long tactile en événement
 * `contextmenu` (et un clic droit sur ordinateur), pas besoin de
 * réinventer la détection du geste. Complète AddWaypointButton (position
 * GPS actuelle) pour planifier un point sans y être physiquement, ex. un
 * stationnement repéré à l'avance via la recherche de lieux.
 */
export function LongPressWaypoint() {
  const setSelectedWaypoint = useMapStore((s) => s.setSelectedWaypoint);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useMapInteractionLock(pendingCoords !== null);

  useMapEvents({
    contextmenu: (e: LeafletMouseEvent) => {
      // Empêche le menu contextuel natif du navigateur (clic droit sur
      // ordinateur) de s'afficher par-dessus notre propre dialogue.
      L.DomEvent.preventDefault(e.originalEvent);
      setPendingCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });

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
      setSelectedWaypoint(waypoint.id);
      setPendingCoords(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <WaypointFormDialog
      open={pendingCoords !== null}
      title="Nommer ce waypoint"
      confirmLabel="Enregistrer"
      busy={isSaving}
      onConfirm={handleConfirm}
      onCancel={() => setPendingCoords(null)}
    />
  );
}
