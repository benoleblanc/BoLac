import { useEffect, useState } from 'react';
import type { Photo } from '@/types/photo';

export function PhotoThumbnail({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.thumbnailBlob ?? photo.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Voir la photo en plein écran"
      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
    >
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </button>
  );
}
