import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import BrandLogo from './BrandLogo'

interface TopBarProps {
  title?: string
  showBack?: boolean
  right?: React.ReactNode
  transparent?: boolean
  logo?: boolean
}

export default function TopBar({ title, showBack = false, right, transparent = false, logo = false }: TopBarProps) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  return (
    <header
      className={`sticky top-0 z-40 ${transparent ? 'bg-transparent border-transparent' : ''}`}
      style={transparent ? undefined : {
        background: 'hsl(var(--card) / 0.92)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid hsl(var(--border) / 0.8)',
      }}
    >
      <div className="max-w-lg mx-auto md:max-w-3xl flex items-center justify-between h-14 px-4">
        {/* Right side (RTL) */}
        <div className="flex items-center gap-2 min-w-9">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted active:scale-90 transition-all"
              aria-label="חזור"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {right}
        </div>

        {/* Center: title or brand logo */}
        {title ? (
          <h1 className="font-display font-bold text-base text-foreground absolute left-1/2 -translate-x-1/2 truncate max-w-[55%] text-center">
            {title}
          </h1>
        ) : logo ? (
          <Link to="/about" className="absolute left-1/2 -translate-x-1/2 active:opacity-75 transition-opacity">
            <BrandLogo size="md" />
          </Link>
        ) : null}

        {/* Left side — theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted active:scale-90 transition-all"
          aria-label={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-primary" />
            : <Moon className="w-4 h-4 text-muted-foreground" />}
        </button>
      </div>
    </header>
  )
}
