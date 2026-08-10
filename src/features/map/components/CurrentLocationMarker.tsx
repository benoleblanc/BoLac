import { useEffect, useState } from 'react';
import { Circle, CircleMarker } from 'react-leaflet';

interface LivePosition {
  lat: number;
  lon: number;
  accuracyM: number;
}

/**
 * Point "où je suis" toujours affiché sur la carte, indépendamment d'un
 * enregistrement en cours — comme dans toute app de navigation. Watch GPS
 * séparé de celui du tracking (voir trackingStore) : les deux peuvent
 * tourner en même temps sans conflit, navigator.geolocation supporte
 * plusieurs abonnés. Démarre à l'affichage de l'écran Carte, s'arrête en
 * le quittant (l'écran est démonté, pas juste masqué).
 */
export function CurrentLocationMarker() {
  const [position, setPosition] = useState<LivePosition | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        });
      },
      () => {
        // Permission refusée ou signal indisponible : pas de point affiché, silencieusement.
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!position) return null;

  return (
    <>
      <Circle
        center={[position.lat, position.lon]}
        radius={position.accuracyM}
        pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0.08 }}
      />
      <CircleMarker
        center={[position.lat, position.lon]}
        radius={7}
        pathOptions={{ color: 'white', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }}
      />
    </>
  );
}
