/**
 * Position brute normalisée, indépendante de la source (API web
 * `navigator.geolocation` ou plugin natif de géolocalisation en
 * arrière-plan) — permet à `handleFix` (trackingStore) de traiter les deux
 * de façon identique (rejet précision/saut GPS, calcul du dénivelé, etc.).
 */
export interface RawFix {
  lat: number;
  lon: number;
  elevation: number | null;
  accuracyM: number;
  speedMs: number | null;
  timestamp: number;
}
