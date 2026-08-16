import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin, Location } from '@capacitor-community/background-geolocation';
import type { RawFix } from '@/lib/geo/rawFix';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

function fromNativeLocation(location: Location): RawFix {
  return {
    lat: location.latitude,
    lon: location.longitude,
    elevation: location.altitude,
    accuracyM: location.accuracy,
    speedMs: location.speed,
    // Le plugin type `time` comme nullable même si ça n'arrive quasiment
    // jamais en pratique — on retombe sur l'heure actuelle plutôt que de
    // perdre le point.
    timestamp: location.time ?? Date.now(),
  };
}

/**
 * Démarre le suivi GPS natif en arrière-plan (service de premier plan
 * Android, notification persistante requise par l'OS — c'est justement ce
 * qui garde l'app active écran éteint, contrairement au Wake Lock web).
 * Retourne l'id du watcher, à repasser à `stopNativeBackgroundWatch`.
 */
export async function startNativeBackgroundWatch(
  onFix: (fix: RawFix) => void,
  onError: (message: string) => void,
): Promise<string> {
  return BackgroundGeolocation.addWatcher(
    {
      backgroundTitle: 'Suivi GPS actif',
      backgroundMessage: 'BoLac enregistre votre trajet en arrière-plan.',
      requestPermissions: true,
      stale: false,
      // Pas de distanceFilter : le filtrage de qualité (précision, sauts
      // GPS improbables) se fait déjà uniformément dans handleFix, pas
      // besoin de filtrer une deuxième fois côté plugin.
    },
    (location, error) => {
      if (error) {
        onError(`Erreur de géolocalisation native : ${error.message}`);
        return;
      }
      if (location) onFix(fromNativeLocation(location));
    },
  );
}

export async function stopNativeBackgroundWatch(id: string): Promise<void> {
  await BackgroundGeolocation.removeWatcher({ id });
}
