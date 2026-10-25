import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import type { SpringOptions } from 'framer-motion'

/* Emil Kowalski's exact AnimatedNumber — useSpring + useTransform.
   The spring value counts from its current position to `value`,
   producing a smooth easing rather than a digit-roll. */

interface Props {
  value: number
  className?: string
  springOptions?: SpringOptions
  style?: React.CSSProperties
}

export function AnimatedNumber({ value, className, springOptions, style }: Props) {
  const spring = useSpring(0, springOptions ?? { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) => String(Math.round(current)))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  )
}
