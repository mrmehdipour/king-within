'use client'

// The Lion — King Within's mascot. A hand-built SVG with gradient shading and a
// layered mane so it reads as charismatic and dimensional (no image asset to
// load; stays crisp on web + Android WebView). Pass `thinking` to pulse it while
// the agent works.
export default function LionAvatar({ size = 88, thinking = false, className = '' }) {
  // Build a ring of rounded mane tufts (petals) for depth.
  const ring = (count, rTip, rBase, fill, rot = 0, key = '') =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + rot
      const a1 = a - Math.PI / count
      const a2 = a + Math.PI / count
      const tx = (50 + Math.cos(a) * rTip).toFixed(1)
      const ty = (50 + Math.sin(a) * rTip).toFixed(1)
      const x1 = (50 + Math.cos(a1) * rBase).toFixed(1)
      const y1 = (50 + Math.sin(a1) * rBase).toFixed(1)
      const x2 = (50 + Math.cos(a2) * rBase).toFixed(1)
      const y2 = (50 + Math.sin(a2) * rBase).toFixed(1)
      return <path key={key + i} d={`M${x1} ${y1} Q${tx} ${ty} ${x2} ${y2} Z`} fill={fill} />
    })

  return (
    <span
      className={`inline-block ${thinking ? 'lion-thinking' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id="kwMane" cx="40%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="55%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#7c3a0c" />
          </radialGradient>
          <radialGradient id="kwManeDark" cx="40%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#c2700f" />
            <stop offset="100%" stopColor="#5a2d0a" />
          </radialGradient>
          <radialGradient id="kwFace" cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#ffeccb" />
            <stop offset="58%" stopColor="#f4c25e" />
            <stop offset="100%" stopColor="#bd7a26" />
          </radialGradient>
          <radialGradient id="kwMuzzle" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff6e6" />
            <stop offset="100%" stopColor="#eccb8c" />
          </radialGradient>
        </defs>

        {/* Mane — back ring (dark) then front ring + base disc (lighter) */}
        <g>{ring(12, 49, 33, 'url(#kwManeDark)', 0, 'b')}</g>
        <g>{ring(12, 43, 28, 'url(#kwMane)', Math.PI / 12, 'f')}</g>
        <circle cx="50" cy="50" r="30" fill="url(#kwMane)" />

        {/* Ears */}
        <circle cx="31" cy="30" r="8" fill="url(#kwMane)" />
        <circle cx="69" cy="30" r="8" fill="url(#kwMane)" />
        <circle cx="31" cy="30" r="4" fill="#8a4a16" />
        <circle cx="69" cy="30" r="4" fill="#8a4a16" />

        {/* Face */}
        <ellipse cx="50" cy="51" rx="25" ry="24" fill="url(#kwFace)" />
        {/* soft top highlight for 3D */}
        <ellipse cx="43" cy="40" rx="11" ry="8" fill="#fff3da" opacity="0.45" />

        {/* Brows — confident, slightly fierce */}
        <path d="M34 43 Q41 39 47 43" stroke="#7c3a0c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M66 43 Q59 39 53 43" stroke="#7c3a0c" strokeWidth="2.4" fill="none" strokeLinecap="round" />

        {/* Eyes with catchlight */}
        <ellipse cx="41" cy="48" rx="3.6" ry="4.4" fill="#2a1c0c" />
        <ellipse cx="59" cy="48" rx="3.6" ry="4.4" fill="#2a1c0c" />
        <circle cx="42.2" cy="46.4" r="1.2" fill="#fff" opacity="0.9" />
        <circle cx="60.2" cy="46.4" r="1.2" fill="#fff" opacity="0.9" />

        {/* Muzzle */}
        <ellipse cx="50" cy="60" rx="13" ry="10" fill="url(#kwMuzzle)" />
        {/* Nose */}
        <path d="M50 60 l5 4 a6.5 6.5 0 0 1 -10 0 z" fill="#3a2410" />
        <path d="M50 64 v4" stroke="#3a2410" strokeWidth="2.2" strokeLinecap="round" />
        {/* Mouth */}
        <path d="M50 68 Q44 72 39 67" stroke="#7c3a0c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M50 68 Q56 72 61 67" stroke="#7c3a0c" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* Whisker dots */}
        <circle cx="38" cy="59" r="1" fill="#9a6a2e" />
        <circle cx="62" cy="59" r="1" fill="#9a6a2e" />
      </svg>
    </span>
  )
}
