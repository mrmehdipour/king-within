import type { CapacitorConfig } from '@capacitor/cli';

// Content delivery:
//   • DEFAULT (release / Myket APK) = BUNDLED. The app ships its own UI inside
//     the APK, so it works even if the website is unreachable from Iran. Only
//     Supabase (data, login, Lion) needs to be reachable — and it is.
//   • DEV live-reload (optional): run with CAP_SERVER_URL=https://… npx cap sync
//     to point the app at a live site instead of the bundled assets.
const remoteUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.kingwithin.app',
  appName: 'پادشاه درون',
  webDir: 'out',
  backgroundColor: '#0c0a09',
  ...(remoteUrl ? { server: { url: remoteUrl, cleartext: false } } : {}),
};

export default config;
