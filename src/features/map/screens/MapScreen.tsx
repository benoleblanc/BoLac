import { MapView } from '@/features/map/components/MapView';
import { TrackingHud } from '@/features/tracking/components/TrackingHud';
import { TrackingControls } from '@/features/tracking/components/TrackingControls';

export function MapScreen() {
  return (
    <div className="relative h-full w-full">
      <MapView />
      <TrackingHud />
      <TrackingControls />
    </div>
  );
}
