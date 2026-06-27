'use client'

// App version + update-check logic for the installed Android app.
//
// HOW UPDATES WORK (sideloaded APK, not Play Store):
//   - APP_VERSION below is baked into every build (web + APK).
//   - The build writes it into public/app-version.json (see scripts/gen-version.mjs),
//     which we commit. Installed apps fetch that file from raw.githubusercontent
//     (sends permissive CORS, unlike the Vercel static host) and compare versions.
//   - If the live version is newer, UpdateBanner prompts the user to download the
//     new APK. Web users need no banner — a reload already serves the latest deploy.
//
// ⚠️ ON EVERY RELEASE: bump APP_VERSION here. The build regenerates the manifest;
// commit it so the raw URL reflects the new version.
export const APP_VERSION = '1.4.0'

// Installed apps read the latest version from the repo's committed manifest.
export const VERSION_MANIFEST_URL =
  'https://raw.githubusercontent.com/mrmehdipour/king-within/master/public/app-version.json'

export const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL ||
  'https://github.com/mrmehdipour/king-within/releases/latest/download/king-within.apk'

// True only inside the Capacitor native shell (Capacitor injects this global).
export function isNative() {
  return typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()
}

// Is version b strictly newer than a? (numeric dot-separated parts)
function isNewer(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0)
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0
    if (y > x) return true
    if (y < x) return false
  }
  return false
}

// Returns { version, apkUrl, notes } if an update is available, else null.
export async function checkForUpdate() {
  try {
    const res = await fetch(`${VERSION_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const m = await res.json()
    if (m?.version && isNewer(APP_VERSION, m.version)) {
      return { version: m.version, apkUrl: m.apkUrl || APK_URL, notes: m.notes || '' }
    }
    return null
  } catch {
    return null // offline / network error — never block the app
  }
}
