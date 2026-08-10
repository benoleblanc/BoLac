import { AddWaypointButton } from '@/features/map/components/AddWaypointButton';
import { LocateButton } from '@/features/map/components/LocateButton';

/** Pile de boutons flottants en bas à droite de la carte. */
export function MapFabStack() {
  return (
    <div className="absolute right-3 bottom-24 z-[999] flex flex-col items-end gap-3">
      <AddWaypointButton />
      <LocateButton />
    </div>
  );
}
