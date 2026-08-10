import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { MapFabButton } from '@/features/map/components/MapFabButton';
import { DownloadZonePanel } from '@/features/map/components/DownloadZonePanel';
import { useMapInteractionLock } from '@/features/map/hooks/useMapInteractionLock';
import { useTileDownloadStore } from '@/stores/tileDownloadStore';

function CloudDownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 18a4.5 4.5 0 0 1-1.5-8.74 5.5 5.5 0 0 1 10.7-2.24A4.5 4.5 0 0 1 17 18H7Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6m0 0-2.5-2.5M12 17l2.5-2.5" />
    </svg>
  );
}

/** Ouvre le panneau de téléchargement d'une zone de carte pour un usage hors ligne. */
export function DownloadZoneButton() {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const status = useTileDownloadStore((s) => s.status);
  const reset = useTileDownloadStore((s) => s.reset);

  useMapInteractionLock(open);

  function handleOpen() {
    // Une complétion précédente jamais "fermée" (panneau fermé pendant que
    // le téléchargement finissait en arrière-plan) ne doit pas ressurgir :
    // on repart sur un panneau de configuration frais.
    if (status === 'done' || status === 'error') {
      reset();
    }
    setOpen(true);
  }

  return (
    <>
      <MapFabButton
        icon={<CloudDownloadIcon />}
        ariaLabel="Télécharger cette zone pour un usage hors ligne"
        onClick={handleOpen}
      />
      <DownloadZonePanel open={open} map={map} onClose={() => setOpen(false)} />
    </>
  );
}
