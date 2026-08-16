import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.benoleblanc.bolac',
  appName: 'BoLac',
  webDir: 'dist',
  android: {
    // Sans ça, le plugin de géolocalisation en arrière-plan arrête de
    // recevoir des positions après ~5 minutes en arrière-plan (bug connu).
    useLegacyBridge: true,
  },
};

export default config;
