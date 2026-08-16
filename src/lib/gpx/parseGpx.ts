/** Un point de trace GPX lu depuis un fichier — forme neutre, avant conversion en TrackPoint. */
export interface ParsedGpxPoint {
  lat: number;
  lon: number;
  elevation: number | null;
  timestamp: number;
}

/** Un waypoint GPX lu depuis un fichier. */
export interface ParsedGpxWaypoint {
  name: string;
  lat: number;
  lon: number;
  note: string | null;
  createdAt: number;
}

export interface ParsedGpx {
  /** Nom du trajet (`<trk><name>`, ou `<metadata><name>` à défaut), s'il y en a un. */
  name: string | null;
  /** Libellé de sport tel qu'écrit dans `<trk><type>` (ex. "Kayak") — à faire correspondre à un ActivityType. */
  activityTypeLabel: string | null;
  trackPoints: ParsedGpxPoint[];
  waypoints: ParsedGpxWaypoint[];
}

/**
 * Parse un document GPX 1.1 (le nôtre, ou un fichier externe standard).
 *
 * Utilise `getElementsByTagName` (nom local, sans préfixe) plutôt que des
 * sélecteurs CSS ou des lookups par namespace : c'est la technique fiable
 * pour du XML avec un `xmlns` par défaut (celui déclaré par notre propre
 * `buildGpx`, ou par un export Strava/Garmin/etc.), sans dépendance externe.
 */
export function parseGpx(xmlText: string): ParsedGpx {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Fichier GPX invalide ou corrompu.');
  }

  const trkEl = doc.getElementsByTagName('trk')[0] ?? null;
  const metadataEl = doc.getElementsByTagName('metadata')[0] ?? null;
  const trkName = trkEl?.getElementsByTagName('name')[0]?.textContent?.trim() || '';
  const metaName = metadataEl?.getElementsByTagName('name')[0]?.textContent?.trim() || '';
  const name = trkName || metaName || null;
  const activityTypeLabel = trkEl?.getElementsByTagName('type')[0]?.textContent?.trim() || null;

  const trackPoints: ParsedGpxPoint[] = [];
  for (const trkpt of Array.from(doc.getElementsByTagName('trkpt'))) {
    const lat = Number(trkpt.getAttribute('lat'));
    const lon = Number(trkpt.getAttribute('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const eleText = trkpt.getElementsByTagName('ele')[0]?.textContent;
    const timeText = trkpt.getElementsByTagName('time')[0]?.textContent;
    trackPoints.push({
      lat,
      lon,
      elevation: eleText ? Number(eleText) : null,
      timestamp: timeText ? new Date(timeText).getTime() : Date.now(),
    });
  }

  const waypoints: ParsedGpxWaypoint[] = [];
  for (const wpt of Array.from(doc.getElementsByTagName('wpt'))) {
    const lat = Number(wpt.getAttribute('lat'));
    const lon = Number(wpt.getAttribute('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const wptName = wpt.getElementsByTagName('name')[0]?.textContent?.trim() || 'Waypoint importé';
    const desc = wpt.getElementsByTagName('desc')[0]?.textContent?.trim() || null;
    const timeText = wpt.getElementsByTagName('time')[0]?.textContent;
    waypoints.push({
      name: wptName,
      lat,
      lon,
      note: desc,
      createdAt: timeText ? new Date(timeText).getTime() : Date.now(),
    });
  }

  return { name, activityTypeLabel, trackPoints, waypoints };
}
