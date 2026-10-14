interface LogoMarkProps {
  size?: number
  className?: string
}

export default function LogoMark({ size = 40, className = '' }: LogoMarkProps) {
  const id = `lm${size}`

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
        <linearGradient id={`${id}-bg`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A1F6E" />
          <stop offset="1" stopColor="#08092E" />
        </linearGradient>
      </defs>

      {/* Badge background */}
      <rect width="64" height="64" rx="16" fill={`url(#${id}-bg)`} />

      {/* Subtle inner highlight */}
      <rect x="0" y="0" width="64" height="32" rx="16" fill="white" fillOpacity="0.04" />

      {/* Hebrew letter ש — Heebo Bold */}
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fontFamily="Heebo, sans-serif"
        fontWeight="700"
        fontSize="36"
        fill="white"
        fillOpacity="0.95"
      >
        ש
      </text>
    </svg>
  )
}
