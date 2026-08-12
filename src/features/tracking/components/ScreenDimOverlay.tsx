import { useEffect, useState } from 'react';
import { Portal } from '@/components/Portal';
import { useTrackingStore } from '@/stores/trackingStore';
import { useUiStore } from '@/stores/uiStore';

/**
 * Assombrit tout l'écran (fond noir) après un délai d'inactivité pendant
 * un enregistrement, pour économiser la batterie — le Wake Lock reste actif
 * pendant ce temps, donc le suivi GPS continue de fonctionner normalement,
 * seul l'affichage change. L'écran redevient noir/OLED sur la plupart des
 * téléphones récents, ce qui réduit sensiblement la consommation par
 * rapport à garder la carte affichée en continu, surtout à la luminosité
 * élevée nécessaire en plein soleil sur l'eau.
 *
 * Toucher n'importe où l'écran noir (pas juste un petit bouton) ramène à
 * la carte et relance le délai (réglable dans Préférences, voir
 * uiStore.dimDelayMs). Le compte à rebours est mis en pause tant qu'un
 * dialogue de l'app est ouvert (voir uiStore.openPortalCount), pour ne pas
 * assombrir l'écran en pleine saisie.
 */
export function ScreenDimOverlay() {
  const status = useTrackingStore((s) => s.status);
  const openPortalCount = useUiStore((s) => s.openPortalCount);
  const dimDelayMs = useUiStore((s) => s.dimDelayMs);
  const [dimmed, setDimmed] = useState(false);

  // Ne reste jamais assombri en dehors d'un enregistrement actif (ex. après
  // avoir mis en pause ou arrêté pendant que l'écran était noir).
  useEffect(() => {
    if (status !== 'recording') setDimmed(false);
  }, [status]);

  useEffect(() => {
    if (status !== 'recording' || openPortalCount > 0 || dimmed) return;

    const timer = setTimeout(() => setDimmed(true), dimDelayMs);
    return () => clearTimeout(timer);
  }, [status, openPortalCount, dimmed, dimDelayMs]);

  if (!dimmed) return null;

  return (
    <Portal>
      <button
        type="button"
        onClick={() => setDimmed(false)}
        aria-label="Réafficher la carte"
        className="fixed inset-0 z-[1200] flex items-center justify-center bg-black"
      >
        <span className="rounded-full bg-slate-800 px-5 py-2.5 text-sm text-slate-400">
          Revoir la carte
        </span>
      </button>
    </Portal>
  );
}
