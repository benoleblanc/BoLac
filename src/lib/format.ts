/** Formate une durée (ms) en `mm:ss`, ou `h:mm:ss` au-delà d'une heure. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Formate une distance (m) en mètres si < 1 km, sinon en km à 2 décimales. */
export function formatDistanceKm(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

/** Formate une vitesse (m/s) en km/h à 1 décimale. */
export function formatSpeedKmh(speedMs: number | null): string {
  if (speedMs === null) return '—';
  return `${(speedMs * 3.6).toFixed(1)} km/h`;
}

/** Formate une vitesse déjà en km/h (ex. Trip.avgSpeedKmh) à 1 décimale. */
export function formatKmh(kmh: number): string {
  return `${kmh.toFixed(1)} km/h`;
}

/** Formate une taille en octets vers Ko ou Mo, selon l'ordre de grandeur. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Nom de trajet proposé par défaut, ex. "Sortie du 10 août 2026". */
export function defaultTripName(date: Date): string {
  const formatted = new Intl.DateTimeFormat('fr-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return `Sortie du ${formatted}`;
}
