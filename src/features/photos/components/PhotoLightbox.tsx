import { useEffect, useState } from 'react';
import { Portal } from '@/components/Portal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { deletePhoto } from '@/lib/db/photos.repo';
import type { Photo } from '@/types/photo';

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1A2 2 0 0 1 15.3 21H8.7a2 2 0 0 1-2-1.9L6 7h12Z" />
    </svg>
  );
}

/** Visionneuse plein écran d'une photo, avec suppression. `photo` à `null` = fermée. */
export function PhotoLightbox({ photo, onClose }: { photo: Photo | null; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!photo) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photo.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  if (!photo) return null;

  async function handleConfirmDelete() {
    if (!photo) return;
    setIsDeleting(true);
    try {
      await deletePhoto(photo.id);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
      onClose();
    }
  }

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        role="dialog"
        aria-modal="true"
        aria-label="Photo"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          ✕
        </button>

        {url && <img src={url} alt="" className="max-h-full max-w-full rounded-lg object-contain" />}

        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Supprimer cette photo"
          className="absolute bottom-[calc(env(safe-area-inset-bottom)+1rem)] flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <TrashIcon />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer cette photo ?"
        message="Cette photo sera supprimée définitivement."
        confirmLabel="Supprimer"
        busy={isDeleting}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Portal>
  );
}
