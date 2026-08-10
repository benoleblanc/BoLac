import { useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import { useMapStore } from '@/stores/mapStore';
import { getCurrentPositionSafe } from '@/lib/geo/getCurrentPosition';
import { OfflineAwareTileLayer } from '@/features/map/components/OfflineAwareTileLayer';
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

    let cancelled = false;
    getCurrentPositionSafe().then((coords) => {
      if (cancelled) return;
      // Position indisponible (permission refusée, ou absence de puce GPS
      // avec repli aussi infructueux) : on reste sur le centre par défaut.
      if (coords) map.setView([coords.lat, coords.lon], 14);
      markCenteredOnUser();
    });

    return () => {
      cancelled = true;
    };
  }, [hasCenteredOnUser, map, markCenteredOnUser]);

  return null;
}

/**
 * Carte plein cadre avec fond OpenTopoMap, adapté au plein air (relief,
 * sentiers, plans d'eau) plutôt qu'un fond de carte routier générique.
 *
 * `OfflineAwareTileLayer` lit d'abord les tuiles téléchargées hors ligne
 * (IndexedDB) avant de retomber sur le réseau — voir DownloadZonePanel pour
 * le téléchargement d'une zone.
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
      <OfflineAwareTileLayer />
      <RecenterOnUser />
      <CurrentLocationMarker />
      <LiveTrackOverlay />
      <ViewedTripOverlay />
      <WaypointMarkers />
      <MapFabStack />
    </MapContainer>
  );
}
