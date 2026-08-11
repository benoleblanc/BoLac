import { Marker } from 'react-leaflet';
import { useMapStore } from '@/stores/mapStore';
import { searchResultIcon } from '@/features/map/lib/searchResultIcon';

/** Épingle rouge à l'emplacement exact du dernier résultat de recherche sélectionné. */
export function SearchResultMarker() {
  const searchResult = useMapStore((s) => s.searchResult);

  if (!searchResult) return null;

  return <Marker position={[searchResult.lat, searchResult.lon]} icon={searchResultIcon} />;
}
