export type BaseLayerId = 'topo' | 'voyager' | 'satellite';

export interface BaseLayerConfig {
  id: BaseLayerId;
  label: string;
  /** Seul un fond "offlineCapable" passe par OfflineTileLayer et peut être téléchargé pour un usage hors ligne. */
  offlineCapable: boolean;
  urlTemplate: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
}

/** Ordre d'affichage dans le sélecteur. */
export const BASE_LAYER_ORDER: BaseLayerId[] = ['topo', 'voyager', 'satellite'];

export const BASE_LAYERS: Record<BaseLayerId, BaseLayerConfig> = {
  topo: {
    id: 'topo',
    label: 'Plein air (relief)',
    offlineCapable: true,
    urlTemplate: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Fonds de carte : &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA), données &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 17,
    subdomains: 'abc',
  },
  voyager: {
    id: 'voyager',
    label: 'Standard (parcs, routes)',
    offlineCapable: false,
    // CARTO plutôt que le serveur de tuiles OSM officiel : ce dernier bloque
    // explicitement les usages tiers en dehors d'un trafic ponctuel (voir
    // operations.osmfoundation.org/policies/tiles), constaté directement en
    // testant — CARTO fournit un forfait gratuit prévu pour ce genre d'usage.
    urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://carto.com/attributions">CARTO</a>, données &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 20,
    subdomains: 'abcd',
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    offlineCapable: false,
    urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
    maxZoom: 19,
  },
};
