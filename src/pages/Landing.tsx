import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

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
      <header className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
        <Link to="/about" className="active:opacity-75 transition-opacity">
          <BrandLogo size="md" />
        </Link>
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/70 transition-all"
          aria-label={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-primary" />
            : <Moon className="w-4 h-4 text-muted-foreground" />}
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-6 pb-20 max-w-2xl mx-auto w-full">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-10 border"
          style={{
            borderColor: 'hsl(var(--primary) / 0.28)',
            color: 'hsl(var(--primary))',
            background: 'hsl(var(--primary) / 0.05)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: 'hsl(var(--primary))' }}
          />
          חינמי לחלוטין · ללא עמלות
        </div>

        {/* Headline */}
        <h1
          className="font-display font-black leading-[1.04] tracking-tight text-foreground mb-5"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}
        >
          שולחן חם
          <br />
          <span style={{ color: 'hsl(var(--primary))' }}>לכל שבת וחג</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm mb-10">
          מארחים פותחים את ביתם · אורחים מוצאים שולחן ביתי אמיתי
        </p>

        {/* CTAs */}
        <div className="flex gap-3 mb-12 w-full max-w-[300px]">
          <Link to="/auth?mode=register" className="flex-1">
            <button className="w-full btn-gold py-3.5 text-sm">
              הצטרף עכשיו
            </button>
          </Link>
          <Link to="/auth?mode=login" className="flex-1">
            <button
              className="w-full py-3.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted/50 active:scale-[0.97] transition-all"
            >
              כניסה
            </button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-5 text-sm flex-wrap justify-center">
          <span className="text-muted-foreground">
            <strong className="text-foreground font-bold">200+</strong> מארחים פעילים
          </span>
          <span className="text-border select-none">·</span>
          <span className="text-muted-foreground">
            <strong className="text-foreground font-bold">400+</strong> ארוחות בחודש
          </span>
          <span className="text-border select-none">·</span>
          <span className="text-muted-foreground">
            <strong className="text-foreground font-bold">4.8</strong> ⭐ דירוג ממוצע
          </span>
        </div>
      </section>

      {/* ── Features ── */}
      <div className="border-t border-border" />
      <div className="px-4 py-12 max-w-4xl mx-auto w-full">
        <h2 className="font-bold text-base text-muted-foreground mb-6 uppercase tracking-wide text-xs">מה תמצא כאן</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="shulchan-card p-4 space-y-2.5">
              <span className="text-xl block">{f.emoji}</span>
              <p className="font-bold text-sm text-foreground leading-snug">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="border-t border-border" />
      <div className="px-4 py-12 max-w-4xl mx-auto w-full">
        <h2 className="font-bold text-base text-muted-foreground mb-8 uppercase tracking-wide text-xs">איך זה עובד</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                style={{
                  background: 'hsl(var(--primary) / 0.08)',
                  border: '1px solid hsl(var(--primary) / 0.20)',
                  color: 'hsl(var(--primary))',
                }}
              >
                {s.n}
              </div>
              <div className="pt-0.5">
                <p className="font-bold text-sm text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto border-t border-border px-4 pb-10 pt-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-5 flex-wrap">
            <Link to="/about" className="text-xs font-semibold text-primary hover:opacity-75 transition-opacity">אודות</Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">תנאי שימוש</Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">פרטיות</Link>
            <Link to="/accessibility" className="text-xs text-muted-foreground hover:text-foreground transition-colors">נגישות</Link>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-6">שולחן פתוח © 2026 — מיזם קהילתי</p>
      </div>

    </div>
  )
}
