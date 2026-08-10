import L from 'leaflet';

// Icône en SVG inline via L.divIcon plutôt qu'une image — évite le classique
// problème d'icônes Leaflet par défaut cassées avec les bundlers (chemins
// vers marker-icon.png non résolus), et reste stylable/cohérent avec le
// reste de la palette de l'app (violet, distinct du cyan de la trace en
// direct et de l'orange de la trace historique).
const PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
    <path fill="#7c3aed" stroke="white" stroke-width="1.5"
      d="M12 2C7.6 2 4 5.6 4 10c0 5.6 6.6 11.2 7.3 11.8a1 1 0 0 0 1.4 0C13.4 21.2 20 15.6 20 10c0-4.4-3.6-8-8-8Z" />
    <circle cx="12" cy="10" r="3" fill="white" />
  </svg>
`;

export const waypointIcon = L.divIcon({
  html: PIN_SVG,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});
