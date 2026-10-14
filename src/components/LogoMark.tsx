interface LogoMarkProps {
  size?: number
  className?: string
}

export default function LogoMark({ size = 40, className = '' }: LogoMarkProps) {
  const id = `lm${size}`

  // 6 seat dots at orbit radius 19, starting from top (-90°), every 60°
  const dots = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180)
    return {
      cx: +(32 + 19 * Math.cos(angle)).toFixed(2),
      cy: +(32 + 19 * Math.sin(angle)).toFixed(2),
    }
  })

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
        {/* Badge background gradient — deep navy */}
        <linearGradient id={`${id}-bg`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F1A48" />
          <stop offset="1" stopColor="#1A2E78" />
        </linearGradient>
        {/* Golden dot gradient — warm amber sphere look */}
        <radialGradient id={`${id}-dot`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#F8C840" />
          <stop offset="100%" stopColor="#B87800" />
        </radialGradient>
        {/* Subtle glow behind badge */}
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Badge background */}
      <rect width="64" height="64" rx="15" fill={`url(#${id}-bg)`} />

      {/* Top highlight shimmer */}
      <rect x="0" y="0" width="64" height="30" rx="15" fill="white" fillOpacity="0.05" />

      {/* Outer orbit ring (subtle) */}
      <circle cx="32" cy="32" r="22" stroke="white" strokeOpacity="0.08" strokeWidth="1" fill="none" strokeDasharray="2 3" />

      {/* Table surface (inner circle) */}
      <circle cx="32" cy="32" r="13" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.20" strokeWidth="1.2" />

      {/* Center plate */}
      <circle cx="32" cy="32" r="4.5" fill="white" fillOpacity="0.14" />

      {/* 6 golden seat dots */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r="4.2" fill={`url(#${id}-dot)`} />
      ))}
    </svg>
  )
}
