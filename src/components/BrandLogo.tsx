interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  onDark?: boolean
}

const MARK_PX  = { sm: 22, md: 28, lg: 36 } as const
const TITLE_CLS = { sm: 'text-[15px]', md: 'text-xl', lg: 'text-2xl' } as const
const SUB_CLS   = { sm: 'hidden', md: 'text-[9px]', lg: 'text-[11px]' } as const
const GAP_CLS   = { sm: 'gap-1.5', md: 'gap-2', lg: 'gap-2.5' } as const

export default function BrandLogo({ size = 'md', onDark = false }: BrandLogoProps) {
  const accent  = onDark ? '#E8906A' : 'hsl(15 63% 43%)'
  const fg      = onDark ? '#FFFFFF' : 'hsl(var(--foreground))'
  const subClr  = onDark ? 'rgba(255,255,255,0.38)' : 'hsl(var(--muted-foreground))'

  return (
    <div className={`inline-flex items-center ${GAP_CLS[size]}`} aria-label="שולחן פתוח">

      {/*
        SVG mark: a minimal open arch.
        Two straight legs rise and meet in a rounded apex (Q-bezier).
        Short outward feet at the base suggest a welcoming stance.
        A single filled dot sits at the mid-interior — the warm gathering point.
        Read as: open doorway, or table silhouette from the front.
      */}
      <svg
        width={MARK_PX[size]}
        height={MARK_PX[size]}
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
        style={{ color: accent, flexShrink: 0 }}
      >
        {/* Main arch: legs rise from y=40 up to a rounded apex at y=6 */}
        <path
          d="M7 40 L7 20 Q7 6 22 6 Q37 6 37 20 L37 40"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left foot — spreads outward */}
        <line x1="2"  y1="40" x2="11" y2="40" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        {/* Right foot — spreads outward */}
        <line x1="33" y1="40" x2="42" y2="40" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        {/* Center dot — warmth of gathering */}
        <circle cx="22" cy="26" r="3.2" fill="currentColor" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none gap-[3px]">
        <div
          className={`font-display font-black leading-none tracking-tight ${TITLE_CLS[size]}`}
        >
          <span style={{ color: fg }}>שולחן </span>
          <span style={{ color: accent }}>פתוח</span>
        </div>
        {SUB_CLS[size] !== 'hidden' && (
          <div
            className={`${SUB_CLS[size]} uppercase tracking-[0.20em] font-medium`}
            style={{ color: subClr }}
          >
            open table
          </div>
        )}
      </div>
    </div>
  )
}
