import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

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
 */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
