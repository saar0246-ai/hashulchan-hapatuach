import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import LogoMark from '../components/LogoMark'

const FEATURES = [
  { emoji: '🍽️', title: 'ארוחות שבת וחגים', desc: 'שישי בערב, ראש השנה, פסח — כל אירוע על שולחן ביתי' },
  { emoji: '🏠', title: 'מארחים מכל הארץ', desc: 'משפחות שפותחות את ביתן לאורחים חדשים' },
  { emoji: '✅', title: 'פרופילים מאומתים', desc: 'מערכת דירוגים שקופה אחרי כל ארוחה' },
  { emoji: '🎁', title: 'חינמי לחלוטין', desc: 'אין עמלות, אין דמי שירות' },
]

const STEPS = [
  { n: '1', title: 'נרשמים', desc: 'פרופיל חינמי עם העדפות כשרות' },
  { n: '2', title: 'מוצאים ארוחה', desc: 'לפי עיר, תאריך וסוג האירוע' },
  { n: '3', title: 'מגיעים ונהנים', desc: 'המארח מאשר ושולח כתובת' },
]

export default function Landing() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-dvh bg-background flex flex-col">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 max-w-3xl mx-auto w-full">
        <Link to="/about" className="flex items-center gap-3 active:opacity-75 transition-opacity">
          <LogoMark size={40} />
          <div>
            <p className="font-bold text-base text-foreground leading-tight tracking-tight">שולחן פתוח</p>
            <p className="text-[10px] text-muted-foreground leading-tight tracking-wide">Open Table</p>
          </div>
        </Link>
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
      <div className="mx-4 md:mx-auto md:w-full md:max-w-3xl">
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(170deg, #1E2E7A 0%, #0E1845 40%, #050A1C 100%)',
            minHeight: 370,
          }}
        >
          {/* Glow blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(96,128,240,0.25) 0%, transparent 68%)',
          }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(30,46,122,0.5) 0%, transparent 70%)',
          }} />
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }} />

          <div className="relative px-7 pt-9 pb-10 md:px-12 md:py-12 md:flex md:items-center md:gap-10">
            {/* Left: text + CTA */}
            <div className="md:flex-1">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-7 text-xs font-semibold"
                style={{
                  background: 'rgba(224,112,48,0.18)',
                  border: '1px solid rgba(224,112,48,0.38)',
                  color: '#F09050',
                }}
              >
                🎁 חינמי לחלוטין
              </div>

              {/* Headline */}
              <h1 className="font-bold leading-none mb-4">
                <span
                  className="block text-[2.6rem] md:text-5xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #A0BAFF 0%, #6080E0 55%, #8099E8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  שולחן פתוח
                </span>
                <span className="block text-white/90 text-2xl md:text-3xl font-bold mt-2">
                  ארוחות שבת וחגים
                </span>
              </h1>

              <p className="text-sm md:text-base leading-relaxed mb-9" style={{ color: 'rgba(255,255,255,0.55)' }}>
                מצא שולחן חם לשישי הקרוב או לחג —
                <br />
                או פתח את ביתך לאורחים חדשים
              </p>

              {/* CTAs */}
              <div className="space-y-3 md:flex md:gap-3 md:space-y-0">
                <Link to="/auth?mode=register" className="block md:flex-1">
                  <button
                    className="w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-[0.97] text-white"
                    style={{
                      background: 'linear-gradient(135deg, #C85010 0%, #E87030 50%, #C85010 100%)',
                      boxShadow: '0 4px 18px rgba(200,80,16,0.40)',
                    }}
                  >
                    הצטרף עכשיו — חינמי
                  </button>
                </Link>
                <Link to="/auth?mode=login" className="block md:flex-1">
                  <button
                    className="w-full py-3.5 rounded-2xl font-medium text-sm transition-all active:scale-[0.97]"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: 'rgba(255,255,255,0.78)',
                    }}
                  >
                    כניסה לחשבון
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: stats pill (desktop only) */}
            <div className="hidden md:flex md:flex-col md:gap-4 md:flex-shrink-0">
              {[
                { emoji: '🏠', label: 'מארחים פעילים', val: '200+' },
                { emoji: '🍽️', label: 'ארוחות בחודש', val: '400+' },
                { emoji: '⭐', label: 'דירוג ממוצע', val: '4.8' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">{s.val}</p>
                    <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Features Grid ── */}
      <div className="px-4 mt-8 max-w-3xl mx-auto w-full">
        <h2 className="font-bold text-lg text-foreground mb-4">מה תמצא כאן?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
      <div className="px-4 mt-7 max-w-3xl mx-auto w-full">
        <h2 className="font-bold text-lg text-foreground mb-5">איך זה עובד?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4 md:flex-col md:gap-3">
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
              <div className="pt-1 md:pt-0">
                <p className="font-bold text-sm text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto px-4 pb-10 pt-8 text-center space-y-3 border-t border-border mt-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-center gap-5 flex-wrap">
          <Link to="/about" className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
            אודות
          </Link>
          <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">תנאי שימוש</Link>
          <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">פרטיות</Link>
          <Link to="/accessibility" className="text-xs text-muted-foreground hover:text-foreground transition-colors">נגישות</Link>
        </div>
        <p className="text-xs text-muted-foreground/70">
          בהצטרפות אתה מאשר את{' '}
          <Link to="/terms" className="text-primary hover:opacity-80">תנאי השימוש</Link>
        </p>
        <p className="text-[10px] text-muted-foreground/40 pt-1">שולחן פתוח © 2026</p>
      </div>

    </div>
  )
}
