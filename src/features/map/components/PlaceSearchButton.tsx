import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { MapFabButton } from '@/features/map/components/MapFabButton';
import { PlaceSearchPanel } from '@/features/map/components/PlaceSearchPanel';
import { useMapInteractionLock } from '@/features/map/hooks/useMapInteractionLock';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** Ouvre un panneau de recherche de lieux (lacs, villages, montagnes...) pour recentrer la carte. */
export function PlaceSearchButton() {
  const map = useMap();
  const [open, setOpen] = useState(false);

  useMapInteractionLock(open);

  return (
    <>
      <MapFabButton icon={<SearchIcon />} ariaLabel="Rechercher un lieu" onClick={() => setOpen(true)} />
      <PlaceSearchPanel open={open} map={map} onClose={() => setOpen(false)} />
    </>
  );
}
