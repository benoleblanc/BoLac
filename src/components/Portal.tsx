import { createPortal } from 'react-dom';
import { useEffect, type ReactNode } from 'react';
import { useUiStore } from '@/stores/uiStore';

/**
 * Rend ses enfants directement dans `document.body`, hors de la
 * hiérarchie de mise en page du composant appelant.
 *
 * Indispensable pour les dialogues plein écran : un ancêtre positionné
 * avec un z-index (ex. MapFabStack, `absolute` + `z-[999]`) crée son
 * propre contexte d'empilement CSS, qui plafonne tous ses descendants à
 * son propre niveau — même un enfant en `position: fixed` avec un
 * z-index plus élevé reste piégé en dessous d'éléments extérieurs à cet
 * ancêtre. Le portail contourne le problème en sortant complètement le
 * dialogue de cette arborescence.
 *
 * Comme tous les dialogues de l'app passent par ce composant et ne le
 * montent que lorsqu'ils sont ouverts (`if (!open) return null` avant le
 * `<Portal>`), son cycle de montage/démontage sert aussi de compteur
 * global "un dialogue est ouvert" (voir uiStore.openPortalCount),
 * utilisé pour mettre en pause l'assombrissement automatique de l'écran
 * pendant un enregistrement.
 */
export function Portal({ children }: { children: ReactNode }) {
  const incrementPortalCount = useUiStore((s) => s.incrementPortalCount);
  const decrementPortalCount = useUiStore((s) => s.decrementPortalCount);

  useEffect(() => {
    incrementPortalCount();
    return () => decrementPortalCount();
  }, [incrementPortalCount, decrementPortalCount]);

  return createPortal(children, document.body);
}
