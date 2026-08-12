import { create } from 'zustand';
import type { BaseLayerId } from '@/features/map/lib/baseLayers';
import type { DownloadZone } from '@/types/tile';

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

export interface ViewedZone {
  name: string;
  bounds: DownloadZone['bounds'];
}

interface MapState {
  center: [number, number];
  zoom: number;
  /** true une fois qu'on a pu centrer sur la position réelle de l'utilisateur. */
  hasCenteredOnUser: boolean;
  /** Trajet historique (terminé) actuellement affiché sur la carte, depuis l'écran Trajets. */
  viewedTripId: string | null;
  /** Zone téléchargée hors ligne actuellement cadrée sur la carte, depuis l'écran "Cartes hors ligne". */
  viewedZone: ViewedZone | null;
  /** Waypoint dont le popup doit s'ouvrir automatiquement (arrivée depuis l'écran Waypoints). */
  selectedWaypointId: string | null;
  /** Dernier résultat de recherche de lieu sélectionné — épingle + bandeau sur la carte. */
  searchResult: SearchResultPin | null;
  /** Fond de carte actif — persisté, seul "topo" (OpenTopoMap) est téléchargeable hors ligne. */
  baseLayer: BaseLayerId;

  setView: (center: [number, number], zoom: number) => void;
  markCenteredOnUser: () => void;
  setViewedTrip: (tripId: string | null) => void;
  setViewedZone: (zone: ViewedZone | null) => void;
  setSelectedWaypoint: (waypointId: string | null) => void;
  setSearchResult: (result: SearchResultPin | null) => void;
  setBaseLayer: (id: BaseLayerId) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  hasCenteredOnUser: false,
  viewedTripId: null,
  viewedZone: null,
  selectedWaypointId: null,
  searchResult: null,
  baseLayer: getInitialBaseLayer(),

  setView: (center, zoom) => set({ center, zoom }),
  markCenteredOnUser: () => set({ hasCenteredOnUser: true }),

  // Les trois actions ci-dessous représentent chacune "regarder quelque
  // chose de précis sur la carte" — mutuellement exclusives (un seul
  // bandeau à la fois), et chacune marque la position comme déjà centrée :
  // sans ça, un fix GPS obtenu après coup (voir RecenterOnUser) pourrait
  // silencieusement annuler le cadrage volontaire qu'on vient de faire,
  // surtout probable ici puisqu'on vise justement des cas hors réseau où
  // le GPS peut mettre du temps à répondre.
  setViewedTrip: (tripId) =>
    set((s) => ({
      viewedTripId: tripId,
      searchResult: tripId ? null : s.searchResult,
      viewedZone: tripId ? null : s.viewedZone,
      hasCenteredOnUser: tripId ? true : s.hasCenteredOnUser,
    })),
  setViewedZone: (zone) =>
    set((s) => ({
      viewedZone: zone,
      viewedTripId: zone ? null : s.viewedTripId,
      searchResult: zone ? null : s.searchResult,
      hasCenteredOnUser: zone ? true : s.hasCenteredOnUser,
    })),
  setSelectedWaypoint: (waypointId) => set({ selectedWaypointId: waypointId }),
  setSearchResult: (result) =>
    set((s) => ({
      searchResult: result,
      viewedTripId: result ? null : s.viewedTripId,
      viewedZone: result ? null : s.viewedZone,
      hasCenteredOnUser: result ? true : s.hasCenteredOnUser,
    })),
  setBaseLayer: (id) => {
    localStorage.setItem(BASE_LAYER_STORAGE_KEY, id);
    set({ baseLayer: id });
  },
}));
