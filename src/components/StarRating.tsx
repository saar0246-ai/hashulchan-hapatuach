import { Star } from 'lucide-react'

interface StarRatingProps {
  score: number
  count?: number
  interactive?: boolean
  onChange?: (score: number) => void
  size?: 'sm' | 'md'
}

export default function StarRating({ score, count, interactive, onChange, size = 'sm' }: StarRatingProps) {
  const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={interactive ? 'active:scale-110 transition-transform' : ''}
          aria-label={interactive ? `דירוג ${i} מתוך 5` : undefined}
        >
          <Star
            className={`${iconClass} ${
              i <= score
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted-foreground/40'
            }`}
          />
        </button>
      ))}
      {count != null && (
        <span className="text-xs text-muted-foreground mr-1">({count})</span>
      )}
    </div>
  )
}
