import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <>
      <style>{`@keyframes es-fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        className="flex flex-col items-center justify-center text-center py-14 px-6"
        style={{ animation: 'es-fade-up 0.42s cubic-bezier(0.22,1,0.36,1) forwards' }}
      >
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: 'rgba(255,255,255,0.58)',
            border: '1px solid rgba(255,255,255,0.80)',
            boxShadow: '0 8px 32px rgba(44,24,8,0.07), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-lg mb-2"
        style={{ color: '#1A1714', letterSpacing: '-0.015em' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm leading-relaxed max-w-xs mb-5" style={{ color: '#8C7060' }}>
          {description}
        </p>
      )}
      {action}
    </div>
    </>
  )
}
