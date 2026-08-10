import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { OfflineTileLayer } from '@/features/map/lib/OfflineTileLayer';

const ATTRIBUTION =
  'Fonds de carte : &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA), données &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/**
 * Remplace le `<TileLayer>` standard de react-leaflet par notre couche
 * offline-first (voir OfflineTileLayer.ts). Montée impérativement, comme
 * les autres calques custom de cette carte : react-leaflet n'a pas de
 * wrapper déclaratif pour une classe Leaflet personnalisée.
 */
export function OfflineAwareTileLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = new OfflineTileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: ATTRIBUTION,
      maxZoom: 17,
      subdomains: 'abc',
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}
