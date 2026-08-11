import { useState } from 'react';
import { MapFabButton } from '@/features/map/components/MapFabButton';
import { BaseLayerPanel } from '@/features/map/components/BaseLayerPanel';
import { useMapInteractionLock } from '@/features/map/hooks/useMapInteractionLock';

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 13 9 5 9-5" />
    </svg>
  );
}

/** Ouvre le sélecteur de fond de carte (plein air, standard, satellite). */
export function BaseLayerButton() {
  const [open, setOpen] = useState(false);

  useMapInteractionLock(open);

  return (
    <>
      <MapFabButton icon={<LayersIcon />} ariaLabel="Choisir un fond de carte" onClick={() => setOpen(true)} />
      <BaseLayerPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
