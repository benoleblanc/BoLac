import { useTrackingStore } from '@/stores/trackingStore';
import { formatDistanceKm, formatDuration, formatElevation, formatSpeedKmh } from '@/lib/format';
import { isNativePlatform } from '@/lib/platform';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-base font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

/** Panneau de stats en direct : vitesse instantanée/moyenne, distance, temps, précision GPS. */
export function TrackingHud() {
  const status = useTrackingStore((s) => s.status);
  const distanceMeters = useTrackingStore((s) => s.distanceMeters);
  const currentSpeedMs = useTrackingStore((s) => s.currentSpeedMs);
  const avgSpeedMs = useTrackingStore((s) => s.avgSpeedMs);
  const elapsedMs = useTrackingStore((s) => s.elapsedMs);
  const currentAccuracyM = useTrackingStore((s) => s.currentAccuracyM);
  const currentElevationM = useTrackingStore((s) => s.currentElevationM);
  const elevationGainM = useTrackingStore((s) => s.elevationGainM);
  const elevationLossM = useTrackingStore((s) => s.elevationLossM);
  const gpsError = useTrackingStore((s) => s.gpsError);
  const wakeLockActive = useTrackingStore((s) => s.wakeLockActive);

  if (status === 'idle') return null;

  const accuracyColor =
    currentAccuracyM === null
      ? 'text-slate-400'
      : currentAccuracyM <= 10
        ? 'text-emerald-500'
        : currentAccuracyM <= 30
          ? 'text-amber-500'
          : 'text-red-500';

  return (
    <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur dark:bg-slate-900/95">
      {status === 'paused' && (
        <p className="mb-2 text-center text-xs font-medium text-amber-600 dark:text-amber-400">
          En pause
        </p>
      )}
      {gpsError && (
        <p className="mb-2 text-center text-xs font-medium text-red-600 dark:text-red-400">
          {gpsError}
        </p>
      )}
      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Distance" value={formatDistanceKm(distanceMeters)} />
        <Stat label="Vitesse" value={formatSpeedKmh(currentSpeedMs)} />
        <Stat label="Moyenne" value={formatSpeedKmh(avgSpeedMs)} />
        <Stat label="Temps" value={formatDuration(elapsedMs)} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-center dark:border-slate-800">
        <Stat label="Élévation actuelle" value={formatElevation(currentElevationM)} />
        <Stat label="Dénivelé +" value={formatElevation(elevationGainM)} />
        <Stat label="Dénivelé -" value={formatElevation(elevationLossM)} />
      </div>
      <p className={`mt-2 text-center text-xs ${accuracyColor}`}>
        Précision GPS :{' '}
        {currentAccuracyM !== null ? `±${Math.round(currentAccuracyM)} m` : '—'}
      </p>
      {status === 'recording' && (
        <p className="mt-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
          {isNativePlatform()
            ? '📡 Suivi GPS actif en arrière-plan — le téléphone peut être verrouillé'
            : wakeLockActive
              ? '🔒 Écran maintenu allumé pour un suivi continu'
              : '⚠️ Garde le téléphone déverrouillé — le suivi peut s’interrompre en veille'}
        </p>
      )}
    </div>
  );
}
