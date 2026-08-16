import { useEffect, useState } from 'react';
import { Portal } from '@/components/Portal';
import { ACTIVITY_LABELS, ACTIVITY_ORDER, type ActivityType } from '@/types/activity';

interface TripNameDialogProps {
  open: boolean;
  title: string;
  defaultName: string;
  confirmLabel: string;
  busy?: boolean;
  /**
   * Fournis avec `onActivityTypeChange` pour afficher le sélecteur de sport
   * (utile au départ, pas à l'arrivée où le sport est déjà figé).
   */
  activityType?: ActivityType;
  onActivityTypeChange?: (activity: ActivityType) => void;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

/**
 * Boîte de dialogue de saisie du nom d'un trajet — réutilisée pour nommer
 * avant le départ (nom par défaut proposé + choix du sport) et pour
 * confirmer/renommer à l'arrivée (sans le sport, déjà choisi au départ).
 */
export function TripNameDialog({
  open,
  title,
  defaultName,
  confirmLabel,
  busy,
  activityType,
  onActivityTypeChange,
  onConfirm,
  onCancel,
}: TripNameDialogProps) {
  const [name, setName] = useState(defaultName);
  const showActivityPicker = activityType !== undefined && onActivityTypeChange !== undefined;

  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
          <h2 className="mb-3 text-base font-semibold">{title}</h2>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du trajet"
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700"
          />

          {showActivityPicker && (
            <fieldset className="mt-4">
              <legend className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                Sport
              </legend>
              <div className="grid grid-cols-2 gap-1">
                {ACTIVITY_ORDER.map((activity) => (
                  <label
                    key={activity}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <input
                      type="radio"
                      name="activityType"
                      value={activity}
                      checked={activityType === activity}
                      onChange={() => onActivityTypeChange?.(activity)}
                      className="accent-cyan-600"
                    />
                    {ACTIVITY_LABELS[activity]}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

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
