export interface SimpleCoords {
  lat: number;
  lon: number;
}

function attemptPosition(
  enableHighAccuracy: boolean,
  timeoutMs: number,
): Promise<SimpleCoords | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy, timeout: timeoutMs },
    );
  });
}

/**
 * Version "sans exception" de getCurrentPosition : résout `null` en cas de
 * refus, timeout ou absence de géolocalisation, plutôt que de rejeter.
 *
 * Tente d'abord en haute précision (le mode voulu sur l'eau, où le GPS du
 * téléphone est fiable et rapide), puis retente une fois en précision
 * standard avant d'abandonner. Certains ordinateurs de bureau sans puce
 * GPS expirent silencieusement une demande en haute précision — même
 * permissions accordées — alors qu'une position approximative (Wi-Fi/IP)
 * reste disponible via le mode standard.
 */
export async function getCurrentPositionSafe(timeoutMs = 8000): Promise<SimpleCoords | null> {
  const half = Math.max(1000, Math.round(timeoutMs / 2));
  const highAccuracyResult = await attemptPosition(true, half);
  if (highAccuracyResult) return highAccuracyResult;
  return attemptPosition(false, half);
}
