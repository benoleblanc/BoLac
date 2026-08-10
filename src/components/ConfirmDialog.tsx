import { Portal } from '@/components/Portal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  /** Style le bouton de confirmation en rouge pour une action destructrice. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Boîte de dialogue de confirmation générique — pour toute action destructrice (suppression...). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuler',
  busy,
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
          <h2 className="mb-1 text-base font-semibold">{title}</h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
