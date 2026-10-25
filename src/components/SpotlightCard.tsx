import { useRef, useCallback } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

/* SpotlightCard = Emil's Tilt (useMotionTemplate + preserve-3d)
   + DOM radial-gradient spotlight (zero re-renders via ref)
   + BorderBeam top+bottom sweeping lines                         */

interface Props {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

function BorderBeam({ delay, fromRight }: { delay: number; fromRight?: boolean }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        [fromRight ? 'bottom' : 'top']: 0,
        left: 0, right: 0, height: '1.5px',
        background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.85), transparent)',
        zIndex: 10, pointerEvents: 'none',
      }}
      animate={{ x: fromRight ? ['100%', '-350%'] : ['-100%', '350%'] }}
      transition={{ duration: 2.4, delay, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
    />
  )
}

export default function SpotlightCard({ children, style, className }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  /* Emil's exact useMotionTemplate approach */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSpring = useSpring(x, { stiffness: 300, damping: 28 })
  const ySpring = useSpring(y, { stiffness: 300, damping: 28 })
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [12, -12])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-12, 12])
  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    x.set((e.clientX - left) / width - 0.5)
    y.set((e.clientY - top) / height - 0.5)
    if (glowRef.current) {
      glowRef.current.style.background =
        `radial-gradient(600px circle at ${e.clientX - left}px ${e.clientY - top}px, rgba(255,255,255,0.13), transparent 40%)`
      glowRef.current.style.opacity = '1'
    }
  }, [x, y])

  const onLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    if (glowRef.current) glowRef.current.style.opacity = '0'
  }, [x, y])

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: 'preserve-3d', ...style, transform }}
      className={className}
    >
      <div
        ref={glowRef}
        style={{
          position: 'absolute', inset: 0,
          opacity: 0, transition: 'opacity 0.35s',
          pointerEvents: 'none', zIndex: 5,
          borderRadius: 'inherit',
        }}
      />
      <BorderBeam delay={0} />
      <BorderBeam delay={1.3} fromRight />
      {children}
    </motion.div>
  )
}
