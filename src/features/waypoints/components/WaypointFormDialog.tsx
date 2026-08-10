import { useEffect, useState } from 'react';

interface WaypointFormDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  busy?: boolean;
  defaultName?: string;
  defaultNote?: string;
  onConfirm: (name: string, note: string) => void;
  onCancel: () => void;
}

/**
 * Formulaire de nom + note pour un waypoint. Le nom est libre — un waypoint
 * n'est pas forcément une mise à l'eau : stationnement, point de vue, hutte
 * de castor... d'où l'absence de nom par défaut suggéré, contrairement au
 * nom de trajet.
 */
export function WaypointFormDialog({
  open,
  title,
  confirmLabel,
  busy,
  defaultName = '',
  defaultNote = '',
  onConfirm,
  onCancel,
}: WaypointFormDialogProps) {
  const [name, setName] = useState(defaultName);
  const [note, setNote] = useState(defaultNote);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setNote(defaultNote);
    }
  }, [open, defaultName, defaultNote]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
        <h2 className="mb-3 text-base font-semibold">{title}</h2>

        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Nom
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Mise à l’eau, stationnement, point de vue…"
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700"
        />

        <label className="mt-3 mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Note (optionnel)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Détails utiles…"
          className="w-full resize-none rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700"
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
            onClick={() => onConfirm(name.trim(), note.trim())}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
