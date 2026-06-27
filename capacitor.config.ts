import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kingwithin.app',
  appName: 'King Within',
  // Capacitor still bundles this folder (Next's static export) as a fallback,
  // but the app actually loads the LIVE site below — so every web deploy shows
  // up in the installed app instantly, with no reinstall. (A new APK is only
  // needed for native/shell changes.) The native bridge + plugins keep working
  // because Capacitor injects window.Capacitor into the remote page too.
  webDir: 'out',
  backgroundColor: '#0c0a09',
  server: {
    url: 'https://mrmehdipour.ir',
    cleartext: false,
  },
};

export default config;
