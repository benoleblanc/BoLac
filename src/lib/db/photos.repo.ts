import { db } from '@/lib/db/db';
import { createThumbnail } from '@/lib/media/createThumbnail';
import type { Photo } from '@/types/photo';

interface CreatePhotoInput {
  blob: Blob;
  lat: number | null;
  lon: number | null;
  tripId?: string | null;
  waypointId?: string | null;
}

export async function createPhoto(input: CreatePhotoInput): Promise<Photo> {
  // Une miniature ratée ne doit pas empêcher d'enregistrer la photo — la
  // galerie retombera sur le blob plein format pour cette photo-là.
  const thumbnailBlob = await createThumbnail(input.blob).catch(() => null);

  const photo: Photo = {
    id: crypto.randomUUID(),
    blob: input.blob,
    thumbnailBlob,
    lat: input.lat,
    lon: input.lon,
    takenAt: Date.now(),
    tripId: input.tripId ?? null,
    waypointId: input.waypointId ?? null,
  };
  await db.photos.add(photo);
  return photo;
}

export async function deletePhoto(photoId: string): Promise<void> {
  await db.photos.delete(photoId);
}
