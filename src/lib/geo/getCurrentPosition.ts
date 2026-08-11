export interface SimpleCoords {
  lat: number;
  lon: number;
}

function describeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'PERMISSION_DENIED';
    case error.POSITION_UNAVAILABLE:
      return 'POSITION_UNAVAILABLE';
    case error.TIMEOUT:
      return 'TIMEOUT';
    default:
      return `UNKNOWN(${error.code})`;
  }
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
      (error) => {
        // Aide au diagnostic en cas de géolocalisation capricieuse (visible
        // dans la console du navigateur) : le message générique affiché à
        // l'utilisateur ne dit pas si c'est un refus, une position
        // indisponible ou juste un délai dépassé.
        console.warn(
          `[geo] échec (highAccuracy=${enableHighAccuracy}, timeout=${timeoutMs}ms): ${describeError(error)} — ${error.message}`,
        );
        resolve(null);
      },
      { enableHighAccuracy, timeout: timeoutMs },
    );
  });
}

/**
 * Version "sans exception" de getCurrentPosition : résout `null` en cas de
 * refus, timeout ou absence de géolocalisation, plutôt que de rejeter.
 *
 * Tente d'abord en haute précision avec le budget de temps complet (le mode
 * qui marche déjà bien, GPS du téléphone sur l'eau ou position deskop qui
 * répond juste un peu lentement) ; seulement si CETTE tentative échoue
 * complètement, retente une fois en précision standard avec son propre
 * budget. Ne coupe pas le délai en deux dès le départ : un budget réduit
 * ferait échouer une position qui aurait fini par répondre à temps.
 */
export async function getCurrentPositionSafe(timeoutMs = 8000): Promise<SimpleCoords | null> {
  const highAccuracyResult = await attemptPosition(true, timeoutMs);
  if (highAccuracyResult) return highAccuracyResult;
  return attemptPosition(false, Math.round(timeoutMs * 0.6));
}
