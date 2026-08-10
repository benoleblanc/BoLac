const MAX_THUMBNAIL_SIZE = 400;

/** Génère une miniature JPEG redimensionnée, pour un affichage rapide en galerie sans charger le plein format. */
export async function createThumbnail(
  blob: Blob,
  maxSize = MAX_THUMBNAIL_SIZE,
): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Contexte canvas indisponible');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (thumbnailBlob) => {
        if (thumbnailBlob) resolve(thumbnailBlob);
        else reject(new Error('Échec de génération de la miniature'));
      },
      'image/jpeg',
      0.8,
    );
  });
}
