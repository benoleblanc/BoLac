import { create } from 'zustand';

/** Centre par défaut : un point au Québec, en attendant la géolocalisation. */
const DEFAULT_CENTER: [number, number] = [46.8139, -71.208];
const DEFAULT_ZOOM = 12;

interface MapState {
  center: [number, number];
  zoom: number;
  /** true une fois qu'on a pu centrer sur la position réelle de l'utilisateur. */
  hasCenteredOnUser: boolean;
  /** Trajet historique (terminé) actuellement affiché sur la carte, depuis l'écran Trajets. */
  viewedTripId: string | null;
  /** Waypoint dont le popup doit s'ouvrir automatiquement (arrivée depuis l'écran Waypoints). */
  selectedWaypointId: string | null;

  setView: (center: [number, number], zoom: number) => void;
  markCenteredOnUser: () => void;
  setViewedTrip: (tripId: string | null) => void;
  setSelectedWaypoint: (waypointId: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  hasCenteredOnUser: false,
  viewedTripId: null,
  selectedWaypointId: null,

  setView: (center, zoom) => set({ center, zoom }),
  markCenteredOnUser: () => set({ hasCenteredOnUser: true }),
  setViewedTrip: (tripId) => set({ viewedTripId: tripId }),
  setSelectedWaypoint: (waypointId) => set({ selectedWaypointId: waypointId }),
}));
