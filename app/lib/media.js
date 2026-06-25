// Turn a pasted media URL into something renderable.
// Supports Aparat (Iran), YouTube, and direct file links; falls back to iframe.

export function videoEmbed(url) {
  if (!url) return null
  const u = String(url).trim()
  const ap = u.match(/aparat\.com\/v\/([A-Za-z0-9]+)/i)
  if (ap) return { kind: 'iframe', src: `https://www.aparat.com/video/video/embed/videohash/${ap[1]}/vt/frame` }
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/i)
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` }
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(u)) return { kind: 'video', src: u }
  return { kind: 'iframe', src: u }
}

export function audioEmbed(url) {
  if (!url) return null
  const u = String(url).trim()
  if (/\.(mp3|m4a|wav|aac|ogg)(\?|#|$)/i.test(u)) return { kind: 'audio', src: u }
  return { kind: 'iframe', src: u }
}
