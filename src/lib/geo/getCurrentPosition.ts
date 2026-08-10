export interface SimpleCoords {
  lat: number;
  lon: number;
}

/**
 * Version "sans exception" de getCurrentPosition : résout `null` en cas de
 * refus, timeout ou absence de géolocalisation, plutôt que de rejeter.
 * Utile pour des actions (ex: capturer une photo) qui doivent réussir
 * même si le géotag échoue.
 */
export function getCurrentPositionSafe(timeoutMs = 8000): Promise<SimpleCoords | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs },
    );
  });
}
