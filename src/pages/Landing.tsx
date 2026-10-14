import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Moon, Sun, Calendar, Users, Shield, Heart } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

const FEATURES = [
  {
    Icon: Calendar,
    title: 'ארוחות שבת וחגים',
    desc: 'שישי בערב, ראש השנה, פסח — כל אירוע על שולחן ביתי אמיתי',
    color: 'hsl(15 63% 43%)',
    bg: 'hsl(15 63% 43% / 0.08)',
  },
  {
    Icon: Users,
    title: 'מארחים מכל הארץ',
    desc: 'משפחות שפותחות את ביתן לאורחים חדשים — מירושלים עד תל אביב',
    color: '#1a7a4a',
    bg: 'rgba(26,122,74,0.08)',
  },
  {
    Icon: Shield,
    title: 'פרופילים מאומתים',
    desc: 'מערכת דירוגים שקופה אחרי כל ארוחה — מארחים ואורחים',
    color: '#1e5fa5',
    bg: 'rgba(30,95,165,0.08)',
  },
  {
    Icon: Heart,
    title: 'חינמי לחלוטין',
    desc: 'אין עמלות, אין דמי שירות — מיזם קהילתי שנולד מאהבה',
    color: '#9b2c2c',
    bg: 'rgba(155,44,44,0.08)',
  },
]

const STEPS = [
  { n: '01', title: 'נרשמים', desc: 'פרופיל חינמי עם העדפות כשרות ודת. תהליך קצר של 5 שלבים.' },
  { n: '02', title: 'מוצאים ארוחה', desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
  { n: '03', title: 'מגיעים ונהנים', desc: 'המארח בוחר מי מגיע ושולח כתובת ישירות.' },
]

export default function Landing() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-dvh bg-background flex flex-col">

      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background: 'hsl(var(--background) / 0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <div className="flex items-center justify-between px-6 py-3.5 max-w-5xl mx-auto">
          <Link to="/about" className="active:opacity-70 transition-opacity">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth?mode=login"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              כניסה
            </Link>
            <Link to="/auth?mode=register">
              <button className="btn-primary text-sm px-4 py-2 rounded-lg">הצטרף</button>
            </Link>
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              aria-label={theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-primary" />
                : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-24 max-w-2xl mx-auto w-full">

        {/* Overline badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-10 border"
          style={{
            borderColor: 'hsl(var(--primary) / 0.22)',
            color: 'hsl(var(--primary))',
            background: 'hsl(var(--primary) / 0.06)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: 'hsl(var(--primary))' }}
          />
          חינמי לחלוטין · ללא עמלות
        </div>

        {/* Display headline */}
        <h1
          className="font-display font-black leading-[1.04] tracking-tight text-foreground mb-5"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}
        >
          שולחן חם
          <br />
          <span style={{ color: 'hsl(var(--primary))' }}>לכל שבת וחג</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm mb-12">
          מארחים פותחים את ביתם · אורחים מוצאים שולחן ביתי אמיתי
        </p>

        {/* CTA row */}
        <div className="flex gap-3 mb-14 w-full max-w-[290px]">
          <Link to="/auth?mode=register" className="flex-1">
            <button className="w-full btn-gold py-3.5 text-sm">הצטרף עכשיו</button>
          </Link>
          <Link to="/auth?mode=login" className="flex-1">
            <button
              className="w-full py-3.5 text-sm font-medium rounded-lg border text-foreground hover:bg-muted/50 active:scale-[0.97] transition-all"
              style={{ borderColor: 'hsl(var(--border))' }}
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
          <span className="select-none" style={{ color: 'hsl(var(--border))' }}>·</span>
          <span className="text-muted-foreground">
            <strong className="text-foreground font-bold">400+</strong> ארוחות בחודש
          </span>
          <span className="select-none" style={{ color: 'hsl(var(--border))' }}>·</span>
          <span className="text-muted-foreground">
            <strong className="text-foreground font-bold">4.8</strong> דירוג ממוצע
          </span>
        </div>
      </section>

      {/* ── Section break ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }} />

      {/* ── Features ── */}
      <section className="px-4 py-14 max-w-5xl mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-7">
          מה תמצא כאן
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
            <div key={i} className="shulchan-card p-5 flex flex-col gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground mb-1 leading-snug">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section break ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }} />

      {/* ── How it works ── */}
      <section className="px-4 py-14 max-w-5xl mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">
          איך זה עובד
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <span
                className="flex-shrink-0 font-black text-2xl leading-none pt-0.5 select-none"
                style={{ color: 'hsl(var(--primary) / 0.22)', fontVariantNumeric: 'tabular-nums' }}
              >
                {s.n}
              </span>
              <div>
                <p className="font-bold text-sm text-foreground mb-1.5">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }} />
      <footer className="px-6 py-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <BrandLogo size="sm" />
          <nav className="flex items-center gap-5 flex-wrap">
            <Link to="/about"          className="text-xs font-semibold text-primary hover:opacity-75 transition-opacity">אודות</Link>
            <Link to="/terms"          className="text-xs text-muted-foreground hover:text-foreground transition-colors">תנאי שימוש</Link>
            <Link to="/privacy"        className="text-xs text-muted-foreground hover:text-foreground transition-colors">פרטיות</Link>
            <Link to="/accessibility"  className="text-xs text-muted-foreground hover:text-foreground transition-colors">נגישות</Link>
          </nav>
        </div>
        <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>
          שולחן פתוח © 2026 — מיזם קהילתי
        </p>
      </footer>

    </div>
  )
}
