import { MapView } from '@/features/map/components/MapView';
import { TrackingHud } from '@/features/tracking/components/TrackingHud';
import { TrackingControls } from '@/features/tracking/components/TrackingControls';
import { ViewedTripBanner } from '@/features/map/components/ViewedTripBanner';
import { SearchResultBanner } from '@/features/map/components/SearchResultBanner';

export function MapScreen() {
  return (
    <div className="relative h-full w-full">
      <MapView />

      {/* Empilement des bandeaux du haut (stats d'enregistrement, trajet
          consulté, résultat de recherche) — pointer-events-none sur le
          conteneur pour ne pas bloquer les interactions avec la carte
          entre les cartes. */}
      <div className="pointer-events-none absolute inset-x-2 top-2 z-[1000] flex flex-col gap-2">
        <div className="pointer-events-auto">
          <TrackingHud />
        </div>
        <div className="pointer-events-auto">
          <ViewedTripBanner />
        </div>
        <div className="pointer-events-auto">
          <SearchResultBanner />
        </div>
      </div>

      <TrackingControls />
    </div>
  );
}
