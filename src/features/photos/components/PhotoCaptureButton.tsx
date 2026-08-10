import { useRef, useState, type ChangeEvent } from 'react';
import { createPhoto } from '@/lib/db/photos.repo';
import { getCurrentPositionSafe } from '@/lib/geo/getCurrentPosition';

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-emerald-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600 dark:border-slate-600 dark:border-t-cyan-400" />
  );
}

type CaptureStatus = 'idle' | 'saving' | 'saved';

interface PhotoCaptureButtonProps {
  tripId?: string | null;
  waypointId?: string | null;
  className?: string;
}

/**
 * Bouton de capture photo — déclenche l'appareil photo natif via
 * `<input capture>`, géotague avec la position actuelle et sauvegarde,
 * rattachée à un trajet ou un waypoint (au moins l'un des deux est
 * généralement fourni par l'appelant).
 */
export function PhotoCaptureButton({ tripId, waypointId, className }: PhotoCaptureButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // permet de reprendre une photo tout de suite après
    if (!file) return;

    setStatus('saving');
    setError(null);
    try {
      const coords = await getCurrentPositionSafe();
      await createPhoto({
        blob: file,
        lat: coords?.lat ?? null,
        lon: coords?.lon ?? null,
        tripId,
        waypointId,
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setError('Impossible d’enregistrer la photo.');
      setStatus('idle');
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'saving'}
        aria-label="Ajouter une photo"
        className={className}
      >
        {status === 'saving' ? <Spinner /> : status === 'saved' ? <CheckIcon /> : <CameraIcon />}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
