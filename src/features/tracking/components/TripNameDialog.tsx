import { useEffect, useState } from 'react';
import { Portal } from '@/components/Portal';

interface TripNameDialogProps {
  open: boolean;
  title: string;
  defaultName: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

/**
 * Boîte de dialogue de saisie du nom d'un trajet — réutilisée pour nommer
 * avant le départ (nom par défaut proposé) et pour confirmer/renommer à
 * l'arrivée.
 */
export function TripNameDialog({
  open,
  title,
  defaultName,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: TripNameDialogProps) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
          <h2 className="mb-3 text-base font-semibold">{title}</h2>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du trajet"
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={busy || name.trim().length === 0}
              onClick={() => onConfirm(name.trim())}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
