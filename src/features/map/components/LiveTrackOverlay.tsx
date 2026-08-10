import { Polyline } from 'react-leaflet';
import { useTrackingStore } from '@/stores/trackingStore';

/**
 * Polyligne du parcours de la session d'enregistrement en cours. Le point
 * de position actuelle et son cercle de précision sont gérés par
 * `CurrentLocationMarker`, affiché en tout temps (pas seulement pendant un
 * enregistrement) — pas besoin de les dupliquer ici.
 */
export function LiveTrackOverlay() {
  const status = useTrackingStore((s) => s.status);
  const points = useTrackingStore((s) => s.points);

  if (status === 'idle' || points.length === 0) return null;

  const positions = points.map((p): [number, number] => [p.lat, p.lon]);

  return <Polyline positions={positions} pathOptions={{ color: '#0e7490', weight: 4 }} />;
}
