import type { ReactNode } from 'react';

export function Spinner() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600 dark:border-slate-600 dark:border-t-cyan-400" />
  );
}

interface MapFabButtonProps {
  icon: ReactNode;
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  error?: string | null;
}

/** Bouton flottant rond générique pour les actions sur la carte (localiser, ajouter un waypoint...). */
export function MapFabButton({ icon, ariaLabel, onClick, disabled, error }: MapFabButtonProps) {
  return (
    <>
      {error && (
        <p className="max-w-[220px] rounded-lg bg-white/95 px-3 py-1.5 text-right text-xs text-red-600 shadow-lg dark:bg-slate-900/95 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition-colors hover:bg-slate-100 disabled:opacity-60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {icon}
      </button>
    </>
  );
}
