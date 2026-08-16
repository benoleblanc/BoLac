import { useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { useTrackingStore } from '@/stores/trackingStore';
import { exportTripGpx, exportAllWaypointsGpx, exportFullBackup } from '@/lib/export/exportActions';
import { importZipBackup } from '@/lib/import/importZipBackup';
import { importGpxFile } from '@/lib/import/importGpxFile';
import { formatDistanceKm } from '@/lib/format';

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V9m0 0-4 4m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

/** Bouton de téléchargement/import avec état "en cours" — l'icône reste blanche même dans l'état spinner sur fond coloré. */
function ExportButton({
  label,
  busy,
  disabled,
  onClick,
  variant = 'primary',
  icon = <DownloadIcon />,
}: {
  label: string;
  busy: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-cyan-600 text-white hover:bg-cyan-700'
      : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${styles}`}
    >
      {busy ? <Spinner /> : icon}
      {label}
    </button>
  );
}

export function ExportScreen() {
  const activeTripId = useTrackingStore((s) => s.activeTripId);
  const trips = useLiveQuery(() => db.trips.orderBy('createdAt').reverse().toArray(), []);
  const waypointCount = useLiveQuery(() => db.waypoints.count(), []);

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleTrips = (trips ?? []).filter((trip) => trip.id !== activeTripId);
  const hasAnyData = visibleTrips.length > 0 || (waypointCount ?? 0) > 0;

  async function runExport(key: string, action: () => Promise<void>) {
    setBusyKey(key);
    try {
      await action();
    } finally {
      setBusyKey(null);
    }
  }

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de resélectionner le même fichier une deuxième fois
    if (!file) return;

    setIsImporting(true);
    setImportMessage(null);
    setImportError(null);
    try {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.zip')) {
        const result = await importZipBackup(file);
        setImportMessage(
          `Sauvegarde importée : ${result.trips} trajet(s), ${result.waypoints} waypoint(s), ${result.photos} photo(s).`,
        );
      } else if (lowerName.endsWith('.gpx')) {
        const fallbackName = file.name.replace(/\.gpx$/i, '');
        const result = await importGpxFile(file, fallbackName);
        setImportMessage(
          result.trips > 0
            ? `Trajet importé (${result.waypoints} waypoint(s) inclus).`
            : `${result.waypoints} waypoint(s) importé(s).`,
        );
      } else {
        setImportError('Format non reconnu — choisis un fichier .zip ou .gpx.');
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Échec de l’import.');
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Importer
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Reprends une sauvegarde .zip ou un fichier .gpx exporté depuis BoLac — utile par
            exemple après un changement de téléphone.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.gpx"
            className="hidden"
            onChange={(e) => void handleFileSelected(e)}
          />
          <div className="mt-3">
            <ExportButton
              label="Choisir un fichier à importer"
              variant="secondary"
              icon={<UploadIcon />}
              busy={isImporting}
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
          {importMessage && (
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{importMessage}</p>
          )}
          {importError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{importError}</p>
          )}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Sauvegarde complète
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Une archive .zip avec tous tes trajets (GPX), tes waypoints et tes photos — à déposer
            manuellement sur OneDrive ou ailleurs.
          </p>
          <div className="mt-3">
            <ExportButton
              label="Télécharger la sauvegarde (.zip)"
              busy={busyKey === 'backup'}
              disabled={!hasAnyData}
              onClick={() => runExport('backup', exportFullBackup)}
            />
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Waypoints
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <ExportButton
            label="Exporter tous les waypoints (.gpx)"
            variant="secondary"
            busy={busyKey === 'waypoints'}
            disabled={!(waypointCount ?? 0)}
            onClick={() => runExport('waypoints', exportAllWaypointsGpx)}
          />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Trajets (GPX)
        </h2>
        {visibleTrips.length === 0 ? (
          <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
            Aucun trajet à exporter pour l’instant.
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleTrips.map((trip) => {
              const key = `trip-${trip.id}`;
              return (
                <li
                  key={trip.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{trip.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceKm(trip.distanceMeters)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => runExport(key, () => exportTripGpx(trip.id))}
                    disabled={busyKey === key}
                    aria-label={`Exporter ${trip.name} en GPX`}
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {busyKey === key ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-600 dark:border-slate-600 dark:border-t-cyan-400" />
                    ) : (
                      <DownloadIcon />
                    )}
                    GPX
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
