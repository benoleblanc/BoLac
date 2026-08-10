import { Circle, CircleMarker, Polyline } from 'react-leaflet';
import { useTrackingStore } from '@/stores/trackingStore';

/**
 * Trace en direct de la session d'enregistrement en cours : polyligne du
 * parcours, position actuelle et cercle de précision GPS.
 *
 * Le cercle de précision utilise `<Circle>` (rayon en mètres réels), pas
 * `<CircleMarker>` (rayon en pixels) — sinon il ne serait pas à l'échelle
 * en zoomant/dézoomant.
 */
export function LiveTrackOverlay() {
  const status = useTrackingStore((s) => s.status);
  const points = useTrackingStore((s) => s.points);
  const currentAccuracyM = useTrackingStore((s) => s.currentAccuracyM);

  if (status === 'idle' || points.length === 0) return null;

  const positions = points.map((p): [number, number] => [p.lat, p.lon]);
  const last = points[points.length - 1];

  return (
    <>
      <Polyline positions={positions} pathOptions={{ color: '#0e7490', weight: 4 }} />
      {last && (
        <>
          {currentAccuracyM !== null && (
            <Circle
              center={[last.lat, last.lon]}
              radius={currentAccuracyM}
              pathOptions={{ color: '#22d3ee', weight: 1, fillOpacity: 0.1 }}
            />
          )}
          <CircleMarker
            center={[last.lat, last.lon]}
            radius={7}
            pathOptions={{
              color: '#0e7490',
              fillColor: '#22d3ee',
              fillOpacity: 1,
              weight: 2,
            }}
          />
        </>
      )}
    </>
  );
}
