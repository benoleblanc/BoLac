/** Une tuile de carte (x/y/z) téléchargée pour un usage hors ligne. */
export interface CachedTile {
  /** Clé primaire au format `${z}/${x}/${y}`. */
  key: string;
  z: number;
  x: number;
  y: number;
  blob: Blob;
  zoneId: string;
  downloadedAt: number;
}

/** Une zone géographique choisie par l'utilisateur pour un téléchargement hors ligne. */
export interface DownloadZone {
  id: string;
  name: string;
  bounds: { north: number; south: number; east: number; west: number };
  minZoom: number;
  maxZoom: number;
  tileCount: number;
  sizeBytesEstimate: number;
  createdAt: number;
  status: 'downloading' | 'complete' | 'error';
}
