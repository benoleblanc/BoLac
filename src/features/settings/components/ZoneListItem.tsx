import { useState } from 'react';
import type { DownloadZone } from '@/types/tile';
import { formatBytes } from '@/lib/format';
import { deleteZone, renameZone } from '@/lib/db/tiles.repo';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const dateFormatter = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium' });

const STATUS_LABELS: Record<DownloadZone['status'], string> = {
  downloading: 'Téléchargement…',
  complete: 'Disponible hors ligne',
  error: 'Incomplète',
};

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1A2 2 0 0 1 15.3 21H8.7a2 2 0 0 1-2-1.9L6 7h12Z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function ZoneListItem({ zone }: { zone: DownloadZone }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(zone.name);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deleteZone(zone.id);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  function startRenaming() {
    setDraftName(zone.name);
    setIsRenaming(true);
  }

  async function handleConfirmRename() {
    const trimmed = draftName.trim();
    if (trimmed.length > 0 && trimmed !== zone.name) {
      await renameZone(zone.id, trimmed);
    }
    setIsRenaming(false);
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        {isRenaming ? (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <input
              autoFocus
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleConfirmRename();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              className="w-full min-w-0 rounded-lg border border-cyan-500 bg-transparent px-2 py-1 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => void handleConfirmRename()}
              aria-label="Enregistrer le nom"
              className="shrink-0 rounded-full p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <CheckIcon />
            </button>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="truncate font-medium">{zone.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dateFormatter.format(new Date(zone.createdAt))} · zoom {zone.minZoom}–{zone.maxZoom}
            </p>
          </div>
        )}
        {!isRenaming && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={startRenaming}
              aria-label="Renommer cette zone hors ligne"
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Supprimer cette zone hors ligne"
              className="rounded-full p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span
          className={
            zone.status === 'complete'
              ? 'text-emerald-600 dark:text-emerald-400'
              : zone.status === 'error'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-500 dark:text-slate-400'
          }
        >
          {STATUS_LABELS[zone.status]}
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          {zone.tileCount.toLocaleString('fr-CA')} tuiles · {formatBytes(zone.sizeBytesEstimate)}
        </span>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer cette zone hors ligne ?"
        message={`« ${zone.name} » et ses ${zone.tileCount.toLocaleString('fr-CA')} tuiles seront supprimées. La zone ne sera plus disponible hors ligne.`}
        confirmLabel="Supprimer"
        busy={isDeleting}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  );
}
