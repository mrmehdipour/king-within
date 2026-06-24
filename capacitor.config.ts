import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kingwithin.app',
  appName: 'King Within',
  // Capacitor copies this folder (Next's static export output) into the app.
  webDir: 'out',
  backgroundColor: '#0c0a09',
};

export default config;
