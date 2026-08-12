import { Portal } from '@/components/Portal';
import { useUiStore, DIM_DELAY_OPTIONS_MS } from '@/stores/uiStore';
import { ThemeToggle } from '@/features/settings/components/ThemeToggle';

function formatDelayLabel(ms: number): string {
  return `${ms / 1000} s`;
}

interface PreferencesPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Panneau de préférences : thème clair/sombre et délai avant l'écran noir en enregistrement. */
export function PreferencesPanel({ open, onClose }: PreferencesPanelProps) {
  const dimDelayMs = useUiStore((s) => s.dimDelayMs);
  const setDimDelayMs = useUiStore((s) => s.setDimDelayMs);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label="Préférences"
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
          <h2 className="mb-3 text-base font-semibold">Préférences</h2>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm">Thème</span>
            <ThemeToggle />
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="text-sm">Écran noir après</p>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              Pendant un enregistrement inactif, pour économiser la batterie — le suivi GPS
              continue normalement.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DIM_DELAY_OPTIONS_MS.map((ms) => (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setDimDelayMs(ms)}
                  aria-pressed={dimDelayMs === ms}
                  className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                    dimDelayMs === ms
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {formatDelayLabel(ms)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
