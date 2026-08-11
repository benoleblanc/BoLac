import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { OfflineTileLayer } from '@/features/map/lib/OfflineTileLayer';
import { BASE_LAYERS } from '@/features/map/lib/baseLayers';
import { useMapStore } from '@/stores/mapStore';

/**
 * Couche de fond de carte, qui change selon `mapStore.baseLayer`. Seul le
 * fond "Plein air" (OpenTopoMap) passe par notre couche offline-first
 * (voir OfflineTileLayer.ts) — c'est le seul téléchargeable pour un usage
 * hors ligne (voir DownloadZonePanel). Les autres fonds (Standard,
 * Satellite) sont des `L.TileLayer` classiques, en ligne uniquement.
 *
 * Montée impérativement, comme les autres calques custom de cette carte :
 * react-leaflet n'a pas de wrapper déclaratif pour une classe personnalisée,
 * et on doit de toute façon recréer la couche à chaque changement de fond.
 */
export function BaseTileLayer() {
  const map = useMap();
  const baseLayerId = useMapStore((state) => state.baseLayer);

  useEffect(() => {
    const config = BASE_LAYERS[baseLayerId];
    const LayerClass = config.offlineCapable ? OfflineTileLayer : L.TileLayer;
    const layer = new LayerClass(config.urlTemplate, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains ?? 'abc',
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, baseLayerId]);

  return null;
}
