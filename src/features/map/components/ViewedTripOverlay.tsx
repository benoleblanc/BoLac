import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { useMapStore } from '@/stores/mapStore';
import type { TrackPoint } from '@/types/trip';

/**
 * Trace d'un trajet historique consulté depuis l'écran Trajets — distincte
 * visuellement (orange pointillé) de la trace en direct (`LiveTrackOverlay`,
 * cyan plein) pour qu'on ne les confonde pas si les deux sont visibles.
 */
export function ViewedTripOverlay() {
  const viewedTripId = useMapStore((s) => s.viewedTripId);
  const map = useMap();

  const points = useLiveQuery<TrackPoint[]>(
    () =>
      viewedTripId
        ? db.trackPoints.where('tripId').equals(viewedTripId).sortBy('timestamp')
        : Promise.resolve([]),
    [viewedTripId],
  );

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = points.map((p): [number, number] => [p.lat, p.lon]);
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }, [points, map]);

  if (!viewedTripId || !points || points.length === 0) return null;

  const positions = points.map((p): [number, number] => [p.lat, p.lon]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color: '#d97706', weight: 4, dashArray: '2 8' }}
    />
  );
}
