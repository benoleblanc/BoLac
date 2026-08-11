export interface PlaceResult {
  id: string;
  name: string;
  /** Ville/région pour désambiguïser (ex. plusieurs lacs portant le même nom). */
  label: string;
  lat: number;
  lon: number;
  bounds: { south: number; west: number; north: number; east: number };
}

const PHOTON_URL = 'https://photon.komoot.io/api/';

/** Centre approximatif du Québec, pour biaiser les résultats sans exclure le reste du Canada. */
const BIAS_LAT = 48;
const BIAS_LON = -71;

interface PhotonFeature {
  properties: {
    osm_type: string;
    osm_id: number;
    name?: string;
    city?: string;
    state?: string;
    extent?: [number, number, number, number]; // [west, north, east, south]
  };
  geometry: { coordinates: [number, number] }; // [lon, lat]
}

interface PhotonResponse {
  features: PhotonFeature[];
}

/**
 * Recherche de lieux (lacs, villages, montagnes...) via Photon (Komoot),
 * un géocodeur basé sur OpenStreetMap qui répond de façon fiable aux
 * requêtes depuis le navigateur (contrairement à l'API Nominatim
 * classique, dont les en-têtes CORS sont intermittents en usage
 * client-side selon le cache de leur CDN).
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(PHOTON_URL);
  url.searchParams.set('q', trimmed);
  url.searchParams.set('limit', '8');
  url.searchParams.set('lang', 'fr');
  url.searchParams.set('lat', String(BIAS_LAT));
  url.searchParams.set('lon', String(BIAS_LON));

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) throw new Error(`Photon HTTP ${response.status}`);

  const data = (await response.json()) as PhotonResponse;

  return data.features.map((feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const [west, north, east, south] = feature.properties.extent ?? [
      lon - 0.01,
      lat + 0.01,
      lon + 0.01,
      lat - 0.01,
    ];
    const label = [feature.properties.city, feature.properties.state].filter(Boolean).join(', ');

    return {
      id: `${feature.properties.osm_type}-${feature.properties.osm_id}`,
      name: feature.properties.name ?? trimmed,
      label,
      lat,
      lon,
      bounds: { south, west, north, east },
    };
  });
}
