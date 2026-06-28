// The King Within crown mark (matches public/icon.svg). Inherits the current
// text color, so wrap it in a text-amber-400 (or any) container.
export default function CrownLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="94 150 324 290"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M104 196 L160 300 L256 168 L352 300 L408 196 L408 348 Q408 366 390 366 L122 366 Q104 366 104 348 Z" />
      <circle cx="104" cy="196" r="20" />
      <circle cx="256" cy="168" r="22" />
      <circle cx="408" cy="196" r="20" />
      <rect x="104" y="384" width="304" height="44" rx="14" />
    </svg>
  )
}
