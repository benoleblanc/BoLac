import { Portal } from '@/components/Portal';
import { useMapStore } from '@/stores/mapStore';
import { BASE_LAYERS, BASE_LAYER_ORDER } from '@/features/map/lib/baseLayers';

interface BaseLayerPanelProps {
  open: boolean;
  onClose: () => void;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-cyan-600 dark:text-cyan-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

/** Choix du fond de carte : plein air (hors ligne), standard (parcs/routes), satellite. */
export function BaseLayerPanel({ open, onClose }: BaseLayerPanelProps) {
  const baseLayer = useMapStore((s) => s.baseLayer);
  const setBaseLayer = useMapStore((s) => s.setBaseLayer);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label="Choisir un fond de carte"
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
          <h2 className="mb-3 text-base font-semibold">Fond de carte</h2>
          <ul className="space-y-1">
            {BASE_LAYER_ORDER.map((id) => {
              const config = BASE_LAYERS[id];
              const isActive = baseLayer === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      setBaseLayer(id);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>
                      <span className="block font-medium">{config.label}</span>
                      {!config.offlineCapable && (
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          Nécessite une connexion
                        </span>
                      )}
                    </span>
                    {isActive && <CheckIcon />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex justify-end">
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
