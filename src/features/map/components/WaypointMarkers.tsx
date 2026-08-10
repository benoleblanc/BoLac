import { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { useMapStore } from '@/stores/mapStore';
import { waypointIcon } from '@/features/map/lib/waypointIcon';
import { googleMapsDirectionsUrl } from '@/lib/geo/geoLinks';
import type { Waypoint } from '@/types/waypoint';

function WaypointMarker({ waypoint }: { waypoint: Waypoint }) {
  const selectedWaypointId = useMapStore((s) => s.selectedWaypointId);
  const markerRef = useRef<LeafletMarker>(null);

  // Ouvre automatiquement le popup quand on arrive sur ce waypoint depuis
  // l'écran Waypoints (bouton "voir sur la carte").
  useEffect(() => {
    if (selectedWaypointId === waypoint.id) {
      markerRef.current?.openPopup();
    }
  }, [selectedWaypointId, waypoint.id]);

  return (
    <Marker ref={markerRef} position={[waypoint.lat, waypoint.lon]} icon={waypointIcon}>
      <Popup>
        <div className="min-w-[160px]">
          <p className="font-medium">{waypoint.name}</p>
          {waypoint.note && <p className="mt-1 text-xs text-slate-600">{waypoint.note}</p>}
          <a
            href={googleMapsDirectionsUrl(waypoint.lat, waypoint.lon)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-cyan-700 underline"
          >
            S’y rendre
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

/** Affiche tous les waypoints enregistrés en permanence sur la carte (comme des épingles de favoris). */
export function WaypointMarkers() {
  const waypoints = useLiveQuery(() => db.waypoints.toArray(), []);

  if (!waypoints) return null;

  return (
    <>
      {waypoints.map((wp) => (
        <WaypointMarker key={wp.id} waypoint={wp} />
      ))}
    </>
  );
}
