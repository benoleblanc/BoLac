import { Layout } from '@/app/Layout';
import { useTheme } from '@/hooks/useTheme';
import { useUiStore } from '@/stores/uiStore';
import { MapScreen } from '@/features/map/screens/MapScreen';
import { TripsScreen } from '@/features/trips/screens/TripsScreen';
import { WaypointsScreen } from '@/features/waypoints/screens/WaypointsScreen';
import { ExportScreen } from '@/features/export/screens/ExportScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';

function App() {
  useTheme();
  const activeScreen = useUiStore((state) => state.activeScreen);

  return (
    <Layout>
      {activeScreen === 'map' && <MapScreen />}
      {activeScreen === 'trips' && <TripsScreen />}
      {activeScreen === 'waypoints' && <WaypointsScreen />}
      {activeScreen === 'export' && <ExportScreen />}
      {activeScreen === 'settings' && <SettingsScreen />}
    </Layout>
  );
}

export default App;
