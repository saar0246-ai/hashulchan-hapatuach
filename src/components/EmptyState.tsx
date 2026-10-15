import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-14 px-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
    >
      {icon && (
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'hsl(var(--muted))', boxShadow: 'inset 0 1px 0 hsl(var(--card))' }}
          whileHover={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.4 }}
        >
          {icon}
        </motion.div>
      )}
      <h3 className="font-display font-bold text-lg text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">{description}</p>
      )}
      {action}
    </motion.div>
  )
}
