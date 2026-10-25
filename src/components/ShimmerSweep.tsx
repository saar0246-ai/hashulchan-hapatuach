import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function ShimmerSweep({ children, style, className }: Props) {
  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', display: 'block', ...style }}
      className={className}
    >
      {children}
      <motion.div
        style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: '55%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)',
          pointerEvents: 'none',
        }}
        initial={{ x: '-130%' }}
        animate={{ x: '350%' }}
        transition={{ duration: 1.8, delay: 0.9, ease: 'easeInOut' }}
      />
    </div>
  )
}
