/** Lien "Itinéraire" Google Maps vers des coordonnées GPS cibles. */
export function googleMapsDirectionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
