import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon, ChevronLeft, Users, Shield, Star, UtensilsCrossed } from 'lucide-react'

export default function Landing() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-safe-top pt-4 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕯️</span>
          <span className="font-display font-bold text-xl text-foreground">השולחן הפתוח</span>
        </div>
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col">
        {/* Visual hero area */}
        <div className="relative mx-4 rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-amber-600 to-secondary p-8 text-white mb-8 min-h-[280px] flex flex-col justify-end">
          {/* Decorative circles */}
          <div className="absolute top-6 left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-6 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-4 right-4 text-6xl opacity-60 select-none">🍽️</div>
          <div className="absolute top-12 right-16 text-3xl opacity-40 select-none">✨</div>

          <div className="relative">
            <h1 className="font-display font-black text-3xl leading-tight mb-3">
              שולחן שבת<br />לכל אחד
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              מצא שולחן חם לשישי הקרוב, או פתח את ביתך לאורחים חדשים
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="px-4 mb-8 space-y-3">
          {[
            { icon: UtensilsCrossed, text: 'ארוחות שישי, שבת, חגים ואמצע שבוע', color: 'text-primary' },
            { icon: Users, text: 'קהילה של מארחים ואורחים מכל רחבי הארץ', color: 'text-secondary' },
            { icon: Shield, text: 'פרופילים מאומתים, דירוגים ומגבלות אישיות', color: 'text-accent' },
            { icon: Star, text: 'חינם לחלוטין — ללא דמי שירות לעולם', color: 'text-amber-500' },
          ].map(({ icon: Icon, text, color }, i) => (
            <div key={i} className="flex items-center gap-3 shulchan-card px-4 py-3">
              <div className={`w-8 h-8 rounded-xl bg-current/10 flex items-center justify-center ${color}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-sm text-foreground font-medium">{text}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="px-4 pb-8 space-y-3 mt-auto">
          <Link to="/auth?mode=register" className="block">
            <button className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2">
              הצטרף עכשיו — בחינם
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <Link to="/auth?mode=login" className="block">
            <button className="w-full btn-secondary py-4 text-base font-medium">
              כניסה לחשבון
            </button>
          </Link>
          <p className="text-center text-xs text-muted-foreground pt-2">
            בהמשך אתה מאשר את{' '}
            <Link to="/terms" className="text-primary underline">תנאי השימוש</Link>
            {' '}ו
            <Link to="/privacy" className="text-primary underline">מדיניות הפרטיות</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
