'use client'

// The Lion — King Within's mascot/character. A stylized SVG so it scales crisply
// everywhere (web + Android WebView) with no image asset to load. Pass `thinking`
// to gently pulse the mane while the agent is working.
export default function LionAvatar({ size = 88, thinking = false, className = '' }) {
  const mane = []
  const points = 16
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const x = 50 + Math.cos(a) * 42
    const y = 50 + Math.sin(a) * 42
    mane.push(<circle key={i} cx={x} cy={y} r="11" fill="currentColor" />)
  }

  return (
    <span
      className={`inline-block text-amber-500 ${thinking ? 'lion-thinking' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* mane */}
        <g opacity="0.95">{mane}</g>
        {/* face */}
        <circle cx="50" cy="50" r="32" fill="#1c1917" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        {/* ears */}
        <circle cx="30" cy="28" r="7" fill="currentColor" />
        <circle cx="70" cy="28" r="7" fill="currentColor" />
        {/* eyes */}
        <circle cx="40" cy="46" r="4" fill="currentColor" />
        <circle cx="60" cy="46" r="4" fill="currentColor" />
        {/* muzzle */}
        <path d="M50 54 l6 8 a8 8 0 0 1 -12 0 z" fill="currentColor" />
        <path d="M50 62 v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* whisker dots */}
        <circle cx="36" cy="64" r="1.6" fill="currentColor" />
        <circle cx="64" cy="64" r="1.6" fill="currentColor" />
      </svg>
    </span>
  )
}
