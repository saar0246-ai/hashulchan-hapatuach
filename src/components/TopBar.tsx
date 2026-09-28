import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface TopBarProps {
  title?: string
  showBack?: boolean
  right?: React.ReactNode
  transparent?: boolean
}

export default function TopBar({ title, showBack = false, right, transparent = false }: TopBarProps) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  return (
    <header
      className={`sticky top-0 z-40 ${transparent ? 'bg-transparent border-transparent' : ''}`}
      style={transparent ? undefined : {
        background: 'hsl(var(--card) / 0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid hsl(var(--border) / 0.5)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
        {/* Right side (RTL) */}
        <div className="flex items-center gap-2 min-w-9">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted active:scale-90 transition-all"
              aria-label="חזור"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {right}
        </div>

        {/* Center title */}
        {title && (
          <h1 className="font-display font-bold text-base text-foreground absolute left-1/2 -translate-x-1/2 truncate max-w-[55%] text-center">
            {title}
          </h1>
        )}

        {/* Left side — theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted active:scale-90 transition-all"
          aria-label={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
        >
          {theme === 'dark'
            ? <Sun className="w-4.5 h-4.5 text-yellow-400" />
            : <Moon className="w-4.5 h-4.5 text-muted-foreground" />}
        </button>
      </div>
    </header>
  )
}
