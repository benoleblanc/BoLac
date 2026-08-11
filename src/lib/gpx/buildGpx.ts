import type { Trip, TrackPoint } from '@/types/trip';
import type { Waypoint } from '@/types/waypoint';

/** Échappe les caractères XML spéciaux dans un texte libre (nom, note...). */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Génère un document GPX 1.1 (trace + waypoints) pour un trajet.
 * Utilitaire autonome — pas de dépendance XML, juste des template strings,
 * cohérent avec la contrainte "pas de dépendance lourde" pour l'export.
 *
 * Le câblage UI (bouton d'export, téléchargement du fichier) sera fait au
 * lot "export", cette fonction est déjà utilisable telle quelle.
 */
export function buildGpx(
  trip: Trip,
  trackPoints: TrackPoint[],
  waypoints: Waypoint[] = [],
): string {
  const wptTags = waypoints
    .map(
      (wpt) =>
        `  <wpt lat="${wpt.lat}" lon="${wpt.lon}">\n` +
        `    <name>${escapeXml(wpt.name)}</name>\n` +
        `    <time>${new Date(wpt.createdAt).toISOString()}</time>\n` +
        `  </wpt>`,
    )
    .join('\n');

  const trkptTags = trackPoints
    .map(
      (pt) =>
        `      <trkpt lat="${pt.lat}" lon="${pt.lon}">\n` +
        (pt.elevation !== null ? `        <ele>${pt.elevation}</ele>\n` : '') +
        `        <time>${new Date(pt.timestamp).toISOString()}</time>\n` +
        `      </trkpt>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BoLac" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(trip.name)}</name>
    <time>${new Date(trip.createdAt).toISOString()}</time>
  </metadata>
${wptTags}
  <trk>
    <name>${escapeXml(trip.name)}</name>
    <trkseg>
${trkptTags}
    </trkseg>
  </trk>
</gpx>
`;
}
