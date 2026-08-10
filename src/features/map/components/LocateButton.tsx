import { useState } from 'react';
import { useMap } from 'react-leaflet';

function LocateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600 dark:border-slate-600 dark:border-t-cyan-400" />
  );
}

/** Bouton flottant pour recentrer la carte sur la position actuelle, à la demande. */
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
    <div className="absolute right-3 bottom-24 z-[999] flex flex-col items-end gap-2">
      {error && (
        <p className="max-w-[220px] rounded-lg bg-white/95 px-3 py-1.5 text-right text-xs text-red-600 shadow-lg dark:bg-slate-900/95 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={isLocating}
        aria-label="Centrer la carte sur ma position"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition-colors hover:bg-slate-100 disabled:opacity-60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {isLocating ? <Spinner /> : <LocateIcon />}
      </button>
    </div>
  );
}
