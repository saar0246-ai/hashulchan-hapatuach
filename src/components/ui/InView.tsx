import { useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Variant, Transition, UseInViewOptions } from 'framer-motion'

/* Emil Kowalski's exact InView — scroll-triggered animation wrapper.
   once=true means the animation fires once and stays visible.          */

interface Props {
  children: ReactNode
  variants?: { hidden: Variant; visible: Variant }
  transition?: Transition
  viewOptions?: UseInViewOptions
  as?: 'div' | 'li' | 'article' | 'section'
  once?: boolean
  className?: string
  style?: React.CSSProperties
}

const defaultVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
}

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = 'div',
  once = true,
  className,
  style,
}: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewOptions)
  const [isViewed, setIsViewed] = useState(false)
  const MotionTag = (motion as unknown as Record<string, React.ElementType>)[as]

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={(isInView || isViewed) ? 'visible' : 'hidden'}
      onAnimationComplete={() => { if (once) setIsViewed(true) }}
      variants={variants}
      transition={transition}
    >
      {children}
    </MotionTag>
  )
}
