// Writes public/app-version.json from APP_VERSION in app/lib/version.js so the
// deployed manifest can never drift from the version baked into the build.
// Runs automatically before `npm run build` and `npm run build:cap`.

import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('app/lib/version.js', 'utf8')
const m = src.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)
const version = m ? m[1] : '0.0.0'

const apkUrl =
  process.env.NEXT_PUBLIC_APK_URL ||
  'https://github.com/mrmehdipour/king-within/releases/latest/download/king-within.apk'

const manifest = { version, apkUrl, notes: '' }
writeFileSync('public/app-version.json', JSON.stringify(manifest, null, 2) + '\n')
console.log('app-version.json →', version)
