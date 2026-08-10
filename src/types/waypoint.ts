/** Un point d'intérêt sauvegardé (ex: lieu de mise à l'eau). */
export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Trajet auquel ce waypoint est rattaché, le cas échéant. */
  tripId: string | null;
  createdAt: number;
  note: string | null;
}
