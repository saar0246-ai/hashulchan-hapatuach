interface LogoMarkProps {
  size?: number
  className?: string
}

export default function LogoMark({ size = 40, className = '' }: LogoMarkProps) {
  const id = `lm-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="45" y1="0" x2="19" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6B1224" />
          <stop offset="0.6" stopColor="#380A12" />
          <stop offset="1" stopColor="#140308" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="32" cy="30" r="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5AC0A" stopOpacity="0.45" />
          <stop offset="1" stopColor="#F5AC0A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-flame`} x1="32" y1="19" x2="32" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF480" />
          <stop offset="0.45" stopColor="#F8B813" />
          <stop offset="1" stopColor="#D95A0D" />
        </linearGradient>
        <linearGradient id={`${id}-candle`} x1="32" y1="37" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5C240" />
          <stop offset="1" stopColor="#C8860A" />
        </linearGradient>
      </defs>

      {/* Badge background */}
      <rect width="64" height="64" rx="16" fill={`url(#${id}-bg)`} />

      {/* Warm glow behind flame */}
      <ellipse cx="32" cy="30" rx="22" ry="22" fill={`url(#${id}-glow)`} />

      {/* Candle body */}
      <rect x="28" y="37" width="8" height="13" rx="2" fill={`url(#${id}-candle)`} />

      {/* Candle wick */}
      <rect x="31.5" y="35" width="1" height="4" rx="0.5" fill="#C8860A" />

      {/* Flame */}
      <ellipse cx="32" cy="27.5" rx="5" ry="8.5" fill={`url(#${id}-flame)`} />

      {/* Flame highlight */}
      <ellipse cx="32" cy="22.5" rx="2.5" ry="3.5" fill="#FEFAD8" opacity="0.9" />
    </svg>
  )
}
