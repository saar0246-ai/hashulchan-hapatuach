import { Link } from 'react-router-dom'
import { Calendar, Users, Shield, Heart, MapPin } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

/* ─── Tokens ─── */
const C = {
  bg:       '#FDFBF7',
  card:     '#FFFFFF',
  border:   '#E8E2D8',
  text:     '#1C1A17',
  muted:    '#786C63',
  accent:   '#C0522A',
  accentBg: 'rgba(192,82,42,0.08)',
  shadow:   '0 1px 3px rgba(44,24,8,0.06), 0 8px 24px rgba(44,24,8,0.04)',
  shadowMd: '0 4px 20px rgba(44,24,8,0.09), 0 1px 4px rgba(44,24,8,0.05)',
}

const FEATURES = [
  { Icon: Calendar, color: '#C0522A', bg: 'rgba(192,82,42,0.08)', title: 'ארוחות שבת וחגים',   desc: 'שישי בערב, ראש השנה, פסח — כל אירוע על שולחן ביתי אמיתי' },
  { Icon: Users,    color: '#1a7a4a', bg: 'rgba(26,122,74,0.08)', title: 'מארחים מכל הארץ',    desc: 'משפחות שפותחות את ביתן לאורחים חדשים — מירושלים עד תל אביב' },
  { Icon: Shield,   color: '#1e5fa5', bg: 'rgba(30,95,165,0.08)', title: 'פרופילים מאומתים',   desc: 'מערכת דירוגים שקופה אחרי כל ארוחה — מארחים ואורחים' },
  { Icon: Heart,    color: '#9b2c2c', bg: 'rgba(155,44,44,0.08)', title: 'חינמי לחלוטין',       desc: 'אין עמלות, אין דמי שירות — מיזם קהילתי שנולד מאהבה' },
]

const STEPS = [
  { n: '01', title: 'נרשמים',        desc: 'פרופיל חינמי עם העדפות כשרות ודת — תהליך קצר של 5 שלבים.' },
  { n: '02', title: 'מוצאים ארוחה', desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
  { n: '03', title: 'מגיעים ונהנים', desc: 'המארח בוחר מי מגיע ושולח כתובת ישירות.' },
]

const STATS = [
  { value: '200+', label: 'מארחים פעילים' },
  { value: '400+', label: 'ארוחות בחודש' },
  { value: '4.8',  label: 'דירוג ממוצע'  },
]

/* ─── Decorative event card ─── */
function EventPreviewCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden select-none"
      style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, width: 272, flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Card header — warm terracotta, not dark */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-2"
        style={{ background: 'linear-gradient(135deg, #C0522A 0%, #8C3318 100%)' }}
      >
        <div>
          <p className="text-[11px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ארוחת שישי בערב</p>
          <h3 className="font-bold text-white text-[15px] leading-snug">שולחן שבת<br />בבית הלוי</h3>
        </div>
        <span
          className="text-[10px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.9)' }}
        >
          3 מקומות
        </span>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} strokeWidth={1.75} />
          <span>שישי, 18 באוקטובר · 19:30</span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.accent }} strokeWidth={1.75} />
          <span>ירושלים, רחביה</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: '#FDF3E8', color: '#A0600A' }}>מהדרין</span>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: '#EAF2FF', color: '#2962B0' }}>דתי</span>
        </div>
        <div className="flex items-center gap-2.5 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0" style={{ background: C.accent }}>מ</div>
          <div>
            <p className="text-xs font-semibold" style={{ color: C.text }}>משפחת לוי</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1,2,3,4,5].map(s => <span key={s} className="text-[11px]" style={{ color: '#D4906A' }}>★</span>)}
              <span className="text-[10px] mr-1" style={{ color: C.muted }}>(12)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 text-center text-[11px] font-medium" style={{ background: '#FAF7F3', borderTop: `1px solid ${C.border}`, color: C.muted }}>
        לחץ לבקשת מקום
      </div>
    </div>
  )
}

/* ─── Page ─── */
export default function Landing() {
  return (
    <div className="relative min-h-dvh flex flex-col overflow-hidden" style={{ background: C.bg }}>

      {/* ── Ambient floating blobs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="ambient-blob absolute rounded-full"
          style={{
            width: 700, height: 700, top: -280, right: -200,
            background: 'radial-gradient(circle, rgba(192,82,42,0.10) 0%, transparent 65%)',
            animation: 'blob-drift-1 18s ease-in-out infinite',
          }}
        />
        <div
          className="ambient-blob absolute rounded-full"
          style={{
            width: 500, height: 500, bottom: 80, left: -180,
            background: 'radial-gradient(circle, rgba(220,140,60,0.09) 0%, transparent 68%)',
            animation: 'blob-drift-2 24s ease-in-out infinite',
          }}
        />
        <div
          className="ambient-blob absolute rounded-full"
          style={{
            width: 400, height: 400, top: '40%', left: '35%',
            background: 'radial-gradient(circle, rgba(245,200,140,0.07) 0%, transparent 70%)',
            animation: 'blob-drift-3 30s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background: 'rgba(253,251,247,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-3.5 max-w-7xl mx-auto">
          <Link to="/about" className="active:opacity-70 transition-opacity">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth?mode=login"
              className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: C.muted }}
            >
              כניסה
            </Link>
            <Link to="/auth?mode=register">
              <button
                className="text-sm font-semibold rounded-lg px-4 py-2 text-white
                           transition-all active:scale-[0.97] hover:opacity-90
                           shadow-sm"
                style={{ background: C.accent }}
              >
                הצטרף
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex items-center
                          px-5 sm:px-8 py-14 sm:py-20 md:py-28
                          max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full">

          {/* Text column */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-start">

            {/* Badge */}
            <div
              className="stagger-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                         text-xs font-semibold mb-7 border"
              style={{ background: C.accentBg, borderColor: 'rgba(192,82,42,0.22)', color: C.accent }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.accent }} />
              חינמי לחלוטין · ללא עמלות
            </div>

            {/* Headline */}
            <h1
              className="stagger-2 font-black leading-[1.04] tracking-tight mb-5"
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(2.4rem, 7vw, 5.2rem)',
                color: C.text,
              }}
            >
              שולחן חם
              <br />
              <span style={{ color: C.accent }}>לכל שבת וחג</span>
            </h1>

            {/* Subtitle */}
            <p className="stagger-3 text-base md:text-lg leading-relaxed max-w-sm mb-9"
               style={{ color: C.muted }}>
              מארחים פותחים את ביתם · אורחים מוצאים שולחן ביתי אמיתי
            </p>

            {/* CTA */}
            <div className="stagger-4 flex gap-3 w-full max-w-[290px]">
              <Link to="/auth?mode=register" className="flex-1">
                <button
                  className="w-full py-3.5 text-sm font-semibold rounded-xl text-white
                             transition-all active:scale-[0.97] hover:opacity-90 shadow-sm"
                  style={{ background: C.accent }}
                >
                  הצטרף עכשיו
                </button>
              </Link>
              <Link to="/auth?mode=login" className="flex-1">
                <button
                  className="w-full py-3.5 text-sm font-medium rounded-xl
                             transition-all active:scale-[0.97] hover:bg-stone-100"
                  style={{ border: `1px solid ${C.border}`, color: C.text, background: C.card }}
                >
                  כניסה
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div
              className="stagger-5 grid grid-cols-3 mt-9 w-full max-w-[290px] rounded-xl overflow-hidden"
              style={{ border: `1px solid ${C.border}` }}
            >
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center py-3.5 px-2"
                  style={{ background: C.bg, borderInlineStart: i > 0 ? `1px solid ${C.border}` : 'none' }}
                >
                  <span className="font-black text-xl leading-none" style={{ color: C.text }}>{s.value}</span>
                  <span className="text-[10px] mt-1 text-center leading-tight" style={{ color: C.muted }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card column — desktop only */}
          <div className="hidden md:flex flex-col items-center gap-2 flex-shrink-0 stagger-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
               style={{ color: 'rgba(192,82,42,0.55)' }}>
              ארוחה קרובה
            </p>
            <EventPreviewCard />
          </div>

        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10" style={{ borderTop: `1px solid ${C.border}` }} />

      {/* ── Features ── */}
      <section className="relative z-10 px-5 sm:px-8 py-14 max-w-7xl mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-widest mb-7" style={{ color: C.muted }}>
          מה תמצא כאן
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-5 rounded-xl
                         transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadow }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-bold text-sm mb-1 leading-snug" style={{ color: C.text }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10" style={{ borderTop: `1px solid ${C.border}` }} />

      {/* ── How it works ── */}
      <section className="relative z-10 px-5 sm:px-8 py-14 max-w-7xl mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-widest mb-10" style={{ color: C.muted }}>
          איך זה עובד
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <span
                className="flex-shrink-0 font-black text-3xl leading-none pt-0.5 select-none tabular-nums"
                style={{ color: 'rgba(192,82,42,0.2)', fontVariantNumeric: 'tabular-nums' }}
              >
                {s.n}
              </span>
              <div>
                <p className="font-bold text-sm mb-1.5" style={{ color: C.text }}>{s.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="relative z-10" style={{ borderTop: `1px solid ${C.border}` }} />
      <footer className="relative z-10 px-5 sm:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <BrandLogo size="sm" />
          <nav className="flex items-center gap-5 flex-wrap">
            {[
              { to: '/about',         label: 'אודות',      bold: true  },
              { to: '/terms',         label: 'תנאי שימוש', bold: false },
              { to: '/privacy',       label: 'פרטיות',     bold: false },
              { to: '/accessibility', label: 'נגישות',     bold: false },
            ].map(({ to, label, bold }) => (
              <Link key={to} to={to}
                    className="text-xs transition-opacity hover:opacity-70"
                    style={{ color: bold ? C.accent : C.muted, fontWeight: bold ? 600 : 400 }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-[10px]" style={{ color: 'rgba(120,108,99,0.5)' }}>
          שולחן פתוח © 2026 — מיזם קהילתי
        </p>
      </footer>

    </div>
  )
}
