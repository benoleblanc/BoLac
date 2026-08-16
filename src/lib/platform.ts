import { Capacitor } from '@capacitor/core';

/**
 * true si l'app tourne dans le wrapper natif Capacitor (Android, plus tard
 * iOS), false sur le web/PWA classique. Point de décision unique — évite de
 * disperser des vérifications de plateforme un peu partout dans le code.
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
