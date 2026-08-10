import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useMapStore } from '@/stores/mapStore';
import { LiveTrackOverlay } from '@/features/map/components/LiveTrackOverlay';
import { ViewedTripOverlay } from '@/features/map/components/ViewedTripOverlay';
import { WaypointMarkers } from '@/features/map/components/WaypointMarkers';
import { CurrentLocationMarker } from '@/features/map/components/CurrentLocationMarker';
import { MapFabStack } from '@/features/map/components/MapFabStack';

/** Recentre la carte sur la géolocalisation de l'utilisateur, une seule fois, si elle est disponible. */
function RecenterOnUser() {
  const map = useMap();
  const hasCenteredOnUser = useMapStore((state) => state.hasCenteredOnUser);
  const markCenteredOnUser = useMapStore((state) => state.markCenteredOnUser);

  useEffect(() => {
    if (hasCenteredOnUser || !('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setView([position.coords.latitude, position.coords.longitude], 14);
        markCenteredOnUser();
      },
      () => {
        // Permission refusée ou indisponible : on reste sur le centre par défaut.
        markCenteredOnUser();
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [hasCenteredOnUser, map, markCenteredOnUser]);

  return null;
}

/**
 * Carte plein cadre avec fond OpenTopoMap, adapté au plein air (relief,
 * sentiers, plans d'eau) plutôt qu'un fond de carte routier générique.
 *
 * Pour l'instant le TileLayer pointe directement sur OpenTopoMap : la
 * couche offline (lecture depuis les tuiles téléchargées en IndexedDB, voir
 * src/types/tile.ts) sera branchée au lot "cache tuiles".
 */
export function MapView() {
  const center = useMapStore((state) => state.center);
  const zoom = useMapStore((state) => state.zoom);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='Fonds de carte : &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA), données &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        maxZoom={17}
      />
      <RecenterOnUser />
      <CurrentLocationMarker />
      <LiveTrackOverlay />
      <ViewedTripOverlay />
      <WaypointMarkers />
      <MapFabStack />
    </MapContainer>
  );
}
