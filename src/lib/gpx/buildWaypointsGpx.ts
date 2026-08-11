import { escapeXml } from '@/lib/gpx/buildGpx';
import type { Waypoint } from '@/types/waypoint';

/**
 * Génère un document GPX 1.1 contenant uniquement des waypoints (pas de
 * trace) — pour exporter l'ensemble des points d'intérêt indépendamment de
 * tout trajet.
 */
export function buildWaypointsGpx(waypoints: Waypoint[], name: string): string {
  const wptTags = waypoints
    .map(
      (wpt) =>
        `  <wpt lat="${wpt.lat}" lon="${wpt.lon}">\n` +
        `    <name>${escapeXml(wpt.name)}</name>\n` +
        (wpt.note ? `    <desc>${escapeXml(wpt.note)}</desc>\n` : '') +
        `    <time>${new Date(wpt.createdAt).toISOString()}</time>\n` +
        `  </wpt>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BoLac" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(name)}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
${wptTags}
</gpx>
`;
}
