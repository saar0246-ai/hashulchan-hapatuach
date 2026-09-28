import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

const FEATURES = [
  { emoji: '🍽️', title: 'שישי, שבת וחגים', desc: 'ארוחות שישי, ראש השנה, פסח ועוד — כל אירוע על שולחן ביתי' },
  { emoji: '🏠', title: 'מארחים מכל הארץ', desc: 'משפחות שפותחות את ביתן לאורחים חדשים ומעניינים' },
  { emoji: '✅', title: 'אימות ודירוגים', desc: 'פרופילים מאומתים ומערכת דירוגים אחרי כל ארוחה' },
  { emoji: '♾️', title: 'חינם לחלוטין', desc: 'אין עמלות, אין דמי שירות — לעולם' },
]

const STEPS = [
  { n: '1', title: 'נרשמים', desc: 'יוצרים פרופיל חינמי עם העדפות כשרות' },
  { n: '2', title: 'מוצאים ארוחה', desc: 'מחפשים לפי עיר, תאריך וסוג האירוע' },
  { n: '3', title: 'מגיעים ונהנים', desc: 'המארח מאשר ושולחים כתובת — פשוט!' },
]

export default function Landing() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-dvh bg-background flex flex-col">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
            style={{ background: 'linear-gradient(135deg, #6B1224 0%, #2C0712 100%)' }}
          >
            🕯️
          </div>
          <div>
            <p className="font-display font-bold text-base text-foreground leading-tight">השולחן הפתוח</p>
            <p className="text-[10px] tracking-widest text-muted-foreground leading-tight font-medium">OPEN TABLE</p>
          </div>
        </div>
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/70 transition-all"
          aria-label={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-yellow-400" />
            : <Moon className="w-4 h-4 text-muted-foreground" />}
        </button>
      </header>

      {/* ── Hero Card ── */}
      <div
        className="mx-4 rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(170deg, #6B1224 0%, #350A14 40%, #120308 100%)',
          minHeight: 370,
        }}
      >
        {/* Glow blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(212,152,12,0.22) 0%, transparent 68%)',
        }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(107,18,36,0.4) 0%, transparent 70%)',
        }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }} />

        <div className="relative px-7 pt-9 pb-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-7 text-xs font-semibold"
            style={{
              background: 'rgba(212,152,12,0.18)',
              border: '1px solid rgba(212,152,12,0.40)',
              color: '#F5C240',
            }}
          >
            ✨ חינם לחלוטין — ללא עמלות לעולם
          </div>

          {/* Headline */}
          <h1 className="font-display font-black leading-none mb-4">
            <span
              className="block text-[2.6rem]"
              style={{
                background: 'linear-gradient(135deg, #FFD166 0%, #C67C00 55%, #F0A800 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              השולחן הפתוח
            </span>
            <span className="block text-white/90 text-2xl font-bold mt-2">
              ארוחות שישי, שבת וחגים
            </span>
          </h1>

          <p className="text-sm leading-relaxed mb-9" style={{ color: 'rgba(255,255,255,0.58)' }}>
            מצא שולחן חם לשישי הקרוב, לפסח, לראש השנה ועוד —
            <br />
            או פתח את ביתך לאורחים חדשים
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            <Link to="/auth?mode=register" className="block">
              <button
                className="w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #D4980C 0%, #F5C240 50%, #D4980C 100%)',
                  color: '#1A0800',
                  boxShadow: '0 4px 18px rgba(212,152,12,0.45)',
                }}
              >
                הצטרף עכשיו — בחינם
              </button>
            </Link>
            <Link to="/auth?mode=login" className="block">
              <button
                className="w-full py-3.5 rounded-2xl font-medium text-sm transition-all active:scale-[0.97]"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'rgba(255,255,255,0.78)',
                }}
              >
                כניסה לחשבון
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Features Grid ── */}
      <div className="px-4 mt-8">
        <h2 className="font-display font-bold text-lg text-foreground mb-4">מה תמצא כאן?</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="shulchan-card p-4 space-y-2">
              <span className="text-2xl">{f.emoji}</span>
              <p className="font-bold text-sm text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="px-4 mt-7">
        <h2 className="font-display font-bold text-lg text-foreground mb-5">איך זה עובד?</h2>
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                style={{
                  background: 'hsl(var(--primary) / 0.1)',
                  border: '1.5px solid hsl(var(--primary) / 0.25)',
                  color: 'hsl(var(--primary))',
                }}
              >
                {s.n}
              </div>
              <div className="pt-1">
                <p className="font-bold text-sm text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto px-4 pb-10 pt-8 text-center space-y-2.5 border-t border-border mt-8">
        <p className="text-xs text-muted-foreground">
          בהמשך אתה מאשר את{' '}
          <Link to="/terms" className="text-primary underline underline-offset-2 hover:opacity-80">תנאי השימוש</Link>
          {' '}ו
          <Link to="/privacy" className="text-primary underline underline-offset-2 hover:opacity-80">מדיניות הפרטיות</Link>
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/accessibility" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ♿ הצהרת נגישות
          </Link>
        </div>
        <p className="text-[10px] text-muted-foreground/50 pt-1">
          השולחן הפתוח • Open Table © 2026
        </p>
      </div>

    </div>
  )
}
