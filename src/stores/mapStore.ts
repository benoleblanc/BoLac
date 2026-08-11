import { create } from 'zustand';
import type { BaseLayerId } from '@/features/map/lib/baseLayers';

/** Centre par défaut : un point au Québec, en attendant la géolocalisation. */
const DEFAULT_CENTER: [number, number] = [46.8139, -71.208];
const DEFAULT_ZOOM = 12;

const BASE_LAYER_STORAGE_KEY = 'bolac-base-layer';

function getInitialBaseLayer(): BaseLayerId {
  const stored = localStorage.getItem(BASE_LAYER_STORAGE_KEY);
  if (stored === 'topo' || stored === 'voyager' || stored === 'satellite') return stored;
  return 'topo';
}

export interface SearchResultPin {
  lat: number;
  lon: number;
  name: string;
}

interface MapState {
  center: [number, number];
  zoom: number;
  /** true une fois qu'on a pu centrer sur la position réelle de l'utilisateur. */
  hasCenteredOnUser: boolean;
  /** Trajet historique (terminé) actuellement affiché sur la carte, depuis l'écran Trajets. */
  viewedTripId: string | null;
  /** Waypoint dont le popup doit s'ouvrir automatiquement (arrivée depuis l'écran Waypoints). */
  selectedWaypointId: string | null;
  /** Dernier résultat de recherche de lieu sélectionné — épingle + bandeau sur la carte. */
  searchResult: SearchResultPin | null;
  /** Fond de carte actif — persisté, seul "topo" (OpenTopoMap) est téléchargeable hors ligne. */
  baseLayer: BaseLayerId;

  setView: (center: [number, number], zoom: number) => void;
  markCenteredOnUser: () => void;
  setViewedTrip: (tripId: string | null) => void;
  setSelectedWaypoint: (waypointId: string | null) => void;
  setSearchResult: (result: SearchResultPin | null) => void;
  setBaseLayer: (id: BaseLayerId) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  hasCenteredOnUser: false,
  viewedTripId: null,
  selectedWaypointId: null,
  searchResult: null,
  baseLayer: getInitialBaseLayer(),

  setView: (center, zoom) => set({ center, zoom }),
  markCenteredOnUser: () => set({ hasCenteredOnUser: true }),
  setViewedTrip: (tripId) => set({ viewedTripId: tripId }),
  setSelectedWaypoint: (waypointId) => set({ selectedWaypointId: waypointId }),
  setSearchResult: (result) => set({ searchResult: result }),
  setBaseLayer: (id) => {
    localStorage.setItem(BASE_LAYER_STORAGE_KEY, id);
    set({ baseLayer: id });
  },
}));
