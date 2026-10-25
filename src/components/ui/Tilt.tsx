import React, { useRef } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { MotionStyle, SpringOptions } from 'framer-motion'

/* Emil Kowalski's exact Tilt component from motion-primitives.
   Uses useMotionTemplate for perspective + rotateX/Y composition.
   transformStyle: preserve-3d enables true 3D child layering.          */

interface Props {
  children: React.ReactNode
  className?: string
  style?: MotionStyle
  rotationFactor?: number
  isReverse?: boolean
  springOptions?: SpringOptions
}

export function Tilt({
  children,
  className,
  style,
  rotationFactor = 8,
  isReverse = false,
  springOptions,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, springOptions ?? { stiffness: 300, damping: 28 })
  const ySpring = useSpring(y, springOptions ?? { stiffness: 300, damping: 28 })

  const rotateX = useTransform(
    ySpring,
    [-0.5, 0.5],
    isReverse ? [rotationFactor, -rotationFactor] : [-rotationFactor, rotationFactor]
  )
  const rotateY = useTransform(
    xSpring,
    [-0.5, 0.5],
    isReverse ? [-rotationFactor, rotationFactor] : [rotationFactor, -rotationFactor]
  )

  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    x.set((e.clientX - left) / width - 0.5)
    y.set((e.clientY - top) / height - 0.5)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', ...style, transform }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
