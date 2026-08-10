const SUBDOMAINS = ['a', 'b', 'c'];

/** URL OpenTopoMap pour une tuile XYZ donnée, répartie sur les sous-domaines a/b/c. */
export function tileUrl(z: number, x: number, y: number): string {
  const subdomain = SUBDOMAINS[(x + y) % SUBDOMAINS.length] ?? 'a';
  return `https://${subdomain}.tile.opentopomap.org/${z}/${x}/${y}.png`;
}
