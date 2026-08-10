import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/db';
import { formatBytes } from '@/lib/format';
import { ZoneListItem } from '@/features/settings/components/ZoneListItem';

interface StorageInfo {
  usageBytes: number;
  quotaBytes: number;
}

/** Estimation de l'espace de stockage utilisé par l'app — pas disponible sur tous les navigateurs. */
function useStorageEstimate(): StorageInfo | null {
  const [storage, setStorage] = useState<StorageInfo | null>(null);

  useEffect(() => {
    if (!navigator.storage?.estimate) return;
    navigator.storage.estimate().then((estimate) => {
      setStorage({ usageBytes: estimate.usage ?? 0, quotaBytes: estimate.quota ?? 0 });
    });
  }, []);

  return storage;
}

export function SettingsScreen() {
  const zones = useLiveQuery(() => db.zones.orderBy('createdAt').reverse().toArray(), []);
  const storage = useStorageEstimate();

  return (
    <div className="h-full overflow-y-auto p-3">
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Stockage
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          {storage ? (
            <p>
              {formatBytes(storage.usageBytes)} utilisés
              {storage.quotaBytes > 0 && ` sur ${formatBytes(storage.quotaBytes)} disponibles`}
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Estimation non disponible sur ce navigateur.</p>
          )}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Zones téléchargées hors ligne
        </h2>
        {zones === undefined ? (
          <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
        ) : zones.length === 0 ? (
          <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
            Aucune zone téléchargée. Utilise le bouton de téléchargement sur l’écran Carte pour
            rendre une zone disponible hors ligne.
          </p>
        ) : (
          <ul className="space-y-2">
            {zones.map((zone) => (
              <ZoneListItem key={zone.id} zone={zone} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
