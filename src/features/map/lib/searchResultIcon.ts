import L from 'leaflet';

// Même technique que waypointIcon.ts (SVG inline via L.divIcon), coloré en
// rouge et légèrement plus grand pour se distinguer clairement des pins
// violets de waypoints — celui-ci marque un résultat de recherche
// temporaire, pas un point enregistré par l'utilisateur.
const PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
    <path fill="#dc2626" stroke="white" stroke-width="1.5"
      d="M12 2C7.6 2 4 5.6 4 10c0 5.6 6.6 11.2 7.3 11.8a1 1 0 0 0 1.4 0C13.4 21.2 20 15.6 20 10c0-4.4-3.6-8-8-8Z" />
    <circle cx="12" cy="10" r="3" fill="white" />
  </svg>
`;

export const searchResultIcon = L.divIcon({
  html: PIN_SVG,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});
