import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { MapFabButton, Spinner } from '@/features/map/components/MapFabButton';
import { getCurrentPositionSafe } from '@/lib/geo/getCurrentPosition';

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

  async function handleClick() {
    if (!('geolocation' in navigator)) {
      setError('Géolocalisation indisponible sur cet appareil.');
      return;
    }

    setIsLocating(true);
    setError(null);
    const coords = await getCurrentPositionSafe();
    if (coords) {
      map.setView([coords.lat, coords.lon], Math.max(map.getZoom(), 14));
    } else {
      setError('Impossible d’obtenir ta position — vérifie les autorisations.');
    }
    setIsLocating(false);
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
