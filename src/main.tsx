import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App.tsx';
import { isNativePlatform } from '@/lib/platform';

// Le service worker (cache offline des assets applicatifs) n'a de sens
// qu'en contexte web — dans la coquille native Capacitor, les assets sont
// déjà embarqués localement, l'enregistrer serait redondant et risquerait
// de servir une version obsolète après une mise à jour de l'app.
if (!isNativePlatform()) {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
