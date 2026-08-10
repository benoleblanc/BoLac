import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Désactive temporairement les gestes de la carte (déplacement, zoom
 * tactile/molette/double-clic) pendant qu'un panneau modal est ouvert.
 *
 * Nécessaire pour tout dialogue déclenché depuis un bouton flottant sur la
 * carte (donc techniquement monté à l'intérieur du MapContainer) : bien
 * qu'affiché en plein écran par-dessus, il reste un descendant du
 * conteneur Leaflet dans le DOM. Sans ce verrou, glisser sur un contrôle
 * interne (ex: un slider) est aussi capté par Leaflet comme un
 * déplacement de la carte en dessous.
 */
export function useMapInteractionLock(locked: boolean): void {
  const map = useMap();

  useEffect(() => {
    if (!locked) return;

    map.dragging.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    return () => {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    };
  }, [locked, map]);
}
