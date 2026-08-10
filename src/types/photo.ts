/** Une photo prise sur le terrain, géolocalisée et rattachée à un trajet ou un waypoint. */
export interface Photo {
  id: string;
  blob: Blob;
  thumbnailBlob: Blob | null;
  lat: number | null;
  lon: number | null;
  takenAt: number;
  tripId: string | null;
  waypointId: string | null;
}
