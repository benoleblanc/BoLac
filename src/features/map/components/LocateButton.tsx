import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { MapFabButton, Spinner } from '@/features/map/components/MapFabButton';

function LocateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

/** Recentre la carte sur la position actuelle, à la demande. */
export function LocateButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!('geolocation' in navigator)) {
      setError('Géolocalisation indisponible sur cet appareil.');
      return;
    }

    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], Math.max(map.getZoom(), 14));
        setIsLocating(false);
      },
      () => {
        setError('Impossible d’obtenir ta position — vérifie les autorisations.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <MapFabButton
      icon={isLocating ? <Spinner /> : <LocateIcon />}
      ariaLabel="Centrer la carte sur ma position"
      onClick={handleClick}
      disabled={isLocating}
      error={error}
    />
  );
}
