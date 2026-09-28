interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
          style={{ background: 'hsl(var(--muted))', boxShadow: 'inset 0 1px 0 hsl(var(--card))' }}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-lg text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
