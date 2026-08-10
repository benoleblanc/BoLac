export interface TileCoord {
  z: number;
  x: number;
  y: number;
}

export interface LatLonBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Index de tuile XYZ (slippy map) pour une longitude à un niveau de zoom donné. */
function lonToTileX(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}

/** Index de tuile XYZ (projection Web Mercator) pour une latitude à un niveau de zoom donné. */
function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom,
  );
}

/** Liste toutes les tuiles XYZ couvrant une zone géographique, pour chaque zoom de la plage. */
export function tilesForBounds(
  bounds: LatLonBounds,
  minZoom: number,
  maxZoom: number,
): TileCoord[] {
  const tiles: TileCoord[] = [];

  for (let z = minZoom; z <= maxZoom; z++) {
    const xMin = lonToTileX(bounds.west, z);
    const xMax = lonToTileX(bounds.east, z);
    const yMin = latToTileY(bounds.north, z);
    const yMax = latToTileY(bounds.south, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push({ z, x, y });
      }
    }
  }

  return tiles;
}
