interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  onDark?: boolean
}

export default function BrandLogo({ size = 'md', onDark = false }: BrandLogoProps) {
  const fgColor  = onDark ? 'text-white'               : 'text-foreground'
  const accColor = onDark ? 'text-[#D87050]'            : 'text-primary'
  const subColor = onDark ? 'text-white/38'             : 'text-muted-foreground'

  const titleCls = {
    sm: 'text-sm font-black tracking-[-0.02em]',
    md: 'text-[15px] font-black tracking-[-0.02em]',
    lg: 'text-2xl font-black tracking-[-0.03em]',
  }[size]

  const subCls = {
    sm: 'hidden',
    md: 'text-[8.5px] tracking-[0.20em] font-medium uppercase',
    lg: 'text-[10px] tracking-[0.22em] font-medium uppercase',
  }[size]

  return (
    <div className="inline-flex flex-col items-start leading-none gap-[3px]" aria-label="שולחן פתוח">
      {/* Wordmark */}
      <div className={`font-display leading-none ${titleCls} flex items-baseline gap-[3px]`}>
        <span className={fgColor}>שולחן</span>
        {/* Warm terracotta accent dot — the visual hook */}
        <span
          className="inline-block rounded-full flex-shrink-0"
          style={{
            width:  size === 'lg' ? '5px' : '4px',
            height: size === 'lg' ? '5px' : '4px',
            background: onDark ? '#D87050' : 'hsl(var(--primary))',
            marginBottom: size === 'lg' ? '3px' : '2px',
          }}
        />
        <span className={accColor}>פתוח</span>
      </div>
      {/* Subtitle row */}
      {subCls !== 'hidden' && (
        <div className={`${subCls} ${subColor} flex items-center gap-1.5`}>
          open table
        </div>
      )}
    </div>
  )
}
