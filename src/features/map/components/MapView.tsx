import { useEffect } from 'react';
import { MapContainer, useMap, useMapEvents } from 'react-leaflet';
import { useMapStore } from '@/stores/mapStore';
import { getCurrentPositionSafe } from '@/lib/geo/getCurrentPosition';
import { BaseTileLayer } from '@/features/map/components/BaseTileLayer';
import { LiveTrackOverlay } from '@/features/map/components/LiveTrackOverlay';
import { ViewedTripOverlay } from '@/features/map/components/ViewedTripOverlay';
import { WaypointMarkers } from '@/features/map/components/WaypointMarkers';
import { SearchResultMarker } from '@/features/map/components/SearchResultMarker';
import { LongPressWaypoint } from '@/features/map/components/LongPressWaypoint';
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
 * Garde `mapStore.center`/`zoom` synchronisés avec la position réelle de la
 * carte en tout temps (déplacement manuel, recherche, "voir sur la carte",
 * bouton localiser...). Sans ça, revenir sur l'écran Carte après avoir
 * visité un autre onglet retombe sur la position par défaut : le
 * MapContainer est entièrement démonté/remonté à chaque changement d'écran
 * (voir App.tsx), et seul le centrage automatique initial était sauvegardé
 * — un déplacement manuel ou une action sur la carte modifiait la vue en
 * direct sans jamais l'écrire dans le store.
 */
function PersistMapView() {
  const setView = useMapStore((state) => state.setView);

  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      setView([center.lat, center.lng], map.getZoom());
    },
    zoomend: () => {
      const center = map.getCenter();
      setView([center.lat, center.lng], map.getZoom());
    },
  });

  return null;
}

/**
 * Carte plein cadre. `BaseTileLayer` choisit le fond selon
 * `mapStore.baseLayer` (Plein air/OpenTopoMap par défaut, adapté au plein
 * air — relief, sentiers, plans d'eau) ; pour le fond "Plein air",
 * `OfflineTileLayer` lit d'abord les tuiles téléchargées hors ligne
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
      <BaseTileLayer />
      <RecenterOnUser />
      <PersistMapView />
      <CurrentLocationMarker />
      <LiveTrackOverlay />
      <ViewedTripOverlay />
      <WaypointMarkers />
      <SearchResultMarker />
      <LongPressWaypoint />
      <MapFabStack />
    </MapContainer>
  );
}
