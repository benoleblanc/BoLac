import { useState, type ReactNode } from 'react';
import { useTrackingStore } from '@/stores/trackingStore';
import { TripNameDialog } from '@/features/tracking/components/TripNameDialog';
import { PhotoCaptureButton } from '@/features/photos/components/PhotoCaptureButton';
import { defaultTripName } from '@/lib/format';
import { DEFAULT_ACTIVITY, type ActivityType } from '@/types/activity';

type DialogKind = 'start' | 'stop' | null;

const BUTTON_STYLES = {
  primary: 'bg-cyan-600 text-white hover:bg-cyan-700',
  secondary:
    'bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const;

function ControlButton({
  children,
  onClick,
  variant,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  variant: keyof typeof BUTTON_STYLES;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-3 text-sm font-medium shadow-lg transition-colors disabled:opacity-50 ${BUTTON_STYLES[variant]}`}
    >
      {children}
    </button>
  );
}

/** Boutons flottants au bas de la carte pour démarrer/mettre en pause/arrêter l'enregistrement. */
export function TrackingControls() {
  const status = useTrackingStore((s) => s.status);
  const tripName = useTrackingStore((s) => s.tripName);
  const activeTripId = useTrackingStore((s) => s.activeTripId);
  const startRecording = useTrackingStore((s) => s.startRecording);
  const pauseRecording = useTrackingStore((s) => s.pauseRecording);
  const resumeRecording = useTrackingStore((s) => s.resumeRecording);
  const stopRecording = useTrackingStore((s) => s.stopRecording);

  const [dialog, setDialog] = useState<DialogKind>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>(DEFAULT_ACTIVITY);

  async function handleStartConfirm(name: string) {
    setIsBusy(true);
    try {
      await startRecording(name, activityType);
      setDialog(null);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleStopConfirm(name: string) {
    setIsBusy(true);
    try {
      await stopRecording(name);
      setDialog(null);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <div className="absolute inset-x-0 bottom-4 z-[1000] flex justify-center gap-3">
        {status === 'idle' && (
          <ControlButton
            variant="primary"
            onClick={() => {
              // Repart toujours du sport le plus pratiqué, plutôt que de
              // garder le dernier choix d'une session précédente.
              setActivityType(DEFAULT_ACTIVITY);
              setDialog('start');
            }}
          >
            Démarrer l’enregistrement
          </ControlButton>
        )}
        {status === 'recording' && (
          <>
            <ControlButton variant="secondary" onClick={pauseRecording}>
              Pause
            </ControlButton>
            <PhotoCaptureButton
              tripId={activeTripId}
              className="rounded-full bg-white p-3.5 text-slate-900 shadow-lg transition-colors hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            />
            <ControlButton variant="danger" onClick={() => setDialog('stop')}>
              Arrêter
            </ControlButton>
          </>
        )}
        {status === 'paused' && (
          <>
            <ControlButton variant="primary" onClick={resumeRecording}>
              Reprendre
            </ControlButton>
            <PhotoCaptureButton
              tripId={activeTripId}
              className="rounded-full bg-white p-3.5 text-slate-900 shadow-lg transition-colors hover:bg-slate-100 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            />
            <ControlButton variant="danger" onClick={() => setDialog('stop')}>
              Arrêter
            </ControlButton>
          </>
        )}
      </div>

      <TripNameDialog
        open={dialog === 'start'}
        title="Nommer ce trajet"
        defaultName={defaultTripName(new Date())}
        confirmLabel="Démarrer"
        busy={isBusy}
        activityType={activityType}
        onActivityTypeChange={setActivityType}
        onConfirm={handleStartConfirm}
        onCancel={() => setDialog(null)}
      />
      <TripNameDialog
        open={dialog === 'stop'}
        title="Terminer le trajet"
        defaultName={tripName}
        confirmLabel="Terminer"
        busy={isBusy}
        onConfirm={handleStopConfirm}
        onCancel={() => setDialog(null)}
      />
    </>
  );
}
