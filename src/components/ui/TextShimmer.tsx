import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

/* Emil Kowalski's exact TextShimmer — adapted from motion-primitives.
   Two-layer background: traveling highlight gradient + solid base color.
   background-clip: text clips both to the glyph shapes.
   Sweeps right-to-left (natural for Hebrew).                           */

interface Props {
  children: string
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'div'
  className?: string
  style?: React.CSSProperties
  duration?: number
  spread?: number
  shimmerColor?: string
  baseColor?: string
}

export function TextShimmer({
  children,
  as: Tag = 'span',
  className,
  style,
  duration = 2.8,
  spread = 2,
  shimmerColor = '#ffffff',
  baseColor = '#a1a1aa',
}: Props) {
  const MotionTag = (motion as unknown as Record<string, React.ElementType>)[Tag]
  const dynamicSpread = useMemo(() => children.length * spread, [children, spread])

  return (
    <MotionTag
      className={className}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{ repeat: Infinity, duration, ease: 'linear' }}
      style={{
        backgroundImage: [
          `linear-gradient(90deg, transparent calc(50% - ${dynamicSpread}px), ${shimmerColor} 50%, transparent calc(50% + ${dynamicSpread}px))`,
          `linear-gradient(${baseColor}, ${baseColor})`,
        ].join(', '),
        backgroundSize: '250% 100%, auto',
        backgroundRepeat: 'no-repeat, padding-box',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        display: 'inline-block',
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </MotionTag>
  )
}
