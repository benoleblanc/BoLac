import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { PhotoThumbnail } from '@/features/photos/components/PhotoThumbnail';
import { PhotoLightbox } from '@/features/photos/components/PhotoLightbox';
import type { Photo } from '@/types/photo';

interface PhotoGalleryProps {
  tripId?: string;
  waypointId?: string;
}

/** Bande de miniatures des photos rattachées à un trajet ou un waypoint — masquée s'il n'y en a aucune. */
export function PhotoGallery({ tripId, waypointId }: PhotoGalleryProps) {
  const photos = useLiveQuery<Photo[]>(async () => {
    const rows = tripId
      ? await db.photos.where('tripId').equals(tripId).toArray()
      : waypointId
        ? await db.photos.where('waypointId').equals(waypointId).toArray()
        : [];
    return rows.sort((a, b) => b.takenAt - a.takenAt);
  }, [tripId, waypointId]);

  const [openPhoto, setOpenPhoto] = useState<Photo | null>(null);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {photos.map((photo) => (
          <PhotoThumbnail key={photo.id} photo={photo} onClick={() => setOpenPhoto(photo)} />
        ))}
      </div>
      <PhotoLightbox photo={openPhoto} onClose={() => setOpenPhoto(null)} />
    </>
  );
}
