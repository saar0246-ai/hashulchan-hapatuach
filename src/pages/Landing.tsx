import { Link } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 360, damping: 28 }

// ── Design tokens — candlelit espresso ──────────────────────
const BG      = '#16100A'   // deep espresso
const AMBER   = '#F0B044'   // warm candlelight
const TERRA   = '#C85030'   // terracotta ember
const CREAM   = '#FFF8EC'   // near-white heading
const BODY    = 'rgba(255,240,210,0.58)'  // warm off-white body
const SUBTLE  = 'rgba(255,220,160,0.14)' // surface tint

// ── Regions (no fake counts) ─────────────────────────────────
const REGIONS = [
  { name: 'ירושלים',     color: TERRA  },
  { name: 'תל אביב',     color: '#3A8C5A' },
  { name: 'חיפה',        color: '#2E70B0' },
  { name: 'הנגב',        color: AMBER  },
  { name: 'הגליל',       color: '#4A8C3A' },
  { name: 'גוש דן',      color: '#8050B0' },
  { name: 'ראשון לציון', color: TERRA  },
  { name: 'באר שבע',     color: AMBER  },
  { name: 'נתניה',       color: '#2E70B0' },
]

// ── Animation helpers ────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: EASE, delay },
})

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

/* ═══════════════════════════════════════════════════
   LANDING — candlelit espresso
═══════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div dir="rtl" className="relative min-h-dvh overflow-x-hidden" style={{ background: BG }}>

      {/* ── Ambient candle glow ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
        {/* amber pool — center-top */}
        <motion.div className="absolute rounded-full"
          style={{
            width: 1100, height: 1100,
            top: -420, left: '50%', transform: 'translateX(-50%)',
            background: `radial-gradient(circle at 50% 42%, ${AMBER}28 0%, ${AMBER}0C 45%, transparent 68%)`,
            filter: 'blur(100px)',
          }}
          animate={{ scale: [1, 1.10, 0.96, 1], opacity: [0.9, 1, 0.85, 0.9] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        />
        {/* terracotta ember — bottom-left */}
        <motion.div className="absolute rounded-full"
          style={{
            width: 800, height: 800,
            bottom: -300, left: -300,
            background: `radial-gradient(circle at 54% 50%, ${TERRA}22 0%, ${TERRA}09 48%, transparent 70%)`,
            filter: 'blur(90px)',
          }}
          animate={{ x: [0, -50, 40, 0], y: [0, 60, -30, 0], scale: [1, 0.92, 1.10, 1] }}
          transition={{ repeat: Infinity, duration: 26, ease: 'easeInOut', delay: 5 }}
        />
        {/* soft gold — mid-right */}
        <motion.div className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            top: '35%', right: -200,
            background: `radial-gradient(circle at 46% 50%, rgba(240,200,100,0.16) 0%, transparent 68%)`,
            filter: 'blur(80px)',
          }}
          animate={{ x: [0, 40, -30, 0], y: [0, -50, 35, 0] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut', delay: 9 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Header ── */}
        <header className="sticky top-0 flex items-center justify-between px-5 sm:px-10 py-4"
          style={{
            background: `rgba(22,16,10,0.80)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid rgba(255,200,120,0.10)`,
            zIndex: 40,
          }}>
          <Link to="/about" className="transition-opacity hover:opacity-70">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=login"
              className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: BODY }}>
              כניסה
            </Link>
            <Link to="/auth?mode=register">
              <motion.button
                className="text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${TERRA}, #9A2E14)`,
                  color: CREAM,
                  boxShadow: `0 4px 18px ${TERRA}40`,
                }}
                whileHover={{ scale: 1.04, boxShadow: `0 8px 28px ${TERRA}55` }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING}>
                הצטרף
              </motion.button>
            </Link>
          </div>
        </header>

        {/* ── HERO ── full viewport, just the word ── */}
        <section className="flex flex-col items-center justify-center text-center px-6 py-20 sm:py-32 min-h-[88dvh]">
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden" animate="show"
            className="flex flex-col items-center max-w-3xl w-full">

            {/* Eyebrow */}
            <motion.p variants={item}
              className="text-xs font-bold uppercase tracking-[0.22em] mb-8"
              style={{ color: `${AMBER}CC` }}>
              חינמי לחלוטין &nbsp;·&nbsp; ללא עמלות
            </motion.p>

            {/* Headline */}
            <motion.h1 variants={item}
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(3.2rem, 12vw, 7.5rem)',
                color: CREAM,
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                fontWeight: 900,
                marginBottom: '1.5rem',
              }}>
              שולחן חם<br />
              <span style={{
                background: `linear-gradient(135deg, ${AMBER} 20%, #F07830 80%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                לכל שבת וחג
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={item}
              className="text-base sm:text-lg leading-relaxed max-w-sm mb-12"
              style={{ color: BODY }}>
              מארחים פותחים את ביתם.<br />אורחים מוצאים שולחן ביתי אמיתי.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex gap-3 w-full max-w-xs">
              <Link to="/auth?mode=register" className="flex-1">
                <motion.button
                  className="w-full py-4 text-sm font-bold rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${AMBER} 0%, #D07020 100%)`,
                    color: '#1A0E04',
                    boxShadow: `0 6px 28px ${AMBER}44`,
                  }}
                  whileHover={{ scale: 1.04, boxShadow: `0 12px 40px ${AMBER}55` }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}>
                  הצטרף עכשיו
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/auth?mode=login" className="flex-1">
                <motion.button
                  className="w-full py-4 text-sm font-medium rounded-2xl"
                  style={{
                    background: SUBTLE,
                    border: `1px solid rgba(255,200,120,0.20)`,
                    color: CREAM,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                  whileHover={{ scale: 1.03, background: 'rgba(255,220,160,0.20)' }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}>
                  כניסה
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust line — no fake numbers */}
            <motion.p variants={item}
              className="mt-8 text-xs"
              style={{ color: 'rgba(255,220,160,0.35)' }}>
              ללא כרטיס אשראי · ללא התחייבות
            </motion.p>
          </motion.div>
        </section>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${AMBER}28, transparent)` }} />

        {/* ── HOW IT WORKS ── */}
        <section className="px-6 sm:px-10 py-20 max-w-5xl mx-auto">
          <motion.p {...fadeUp()} className="text-xs font-bold uppercase tracking-[0.18em] mb-14 text-center"
            style={{ color: `${AMBER}80` }}>
            איך זה עובד
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
            {[
              { n: '01', title: 'נרשמים', desc: 'פרופיל חינמי עם העדפות כשרות ודת — תהליך של 5 דקות.' },
              { n: '02', title: 'מוצאים ארוחה', desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
              { n: '03', title: 'מגיעים ונהנים', desc: 'המארח בוחר ושולח כתובת ישירות.' },
            ].map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)} className="flex items-start gap-5">
                <span className="flex-shrink-0 font-black text-5xl leading-none select-none"
                  style={{ color: `${AMBER}28`, fontVariantNumeric: 'tabular-nums' }}>
                  {s.n}
                </span>
                <div>
                  <p className="font-bold text-base mb-2" style={{ color: CREAM }}>{s.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: BODY }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${AMBER}20, transparent)` }} />

        {/* ── FEATURES ── */}
        <section className="px-6 sm:px-10 py-20 max-w-5xl mx-auto">
          <motion.p {...fadeUp()} className="text-xs font-bold uppercase tracking-[0.18em] mb-10 text-center"
            style={{ color: `${AMBER}80` }}>
            מה תמצא כאן
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🕯️', title: 'ארוחות שבת וחגים',  desc: 'שישי, ראש השנה, פסח — על שולחן ביתי' },
              { icon: '🏡', title: 'מארחים מכל הארץ',   desc: 'משפחות שפותחות את ביתן לאורחים' },
              { icon: '⭐', title: 'פרופילים מאומתים',  desc: 'מערכת דירוגים שקופה אחרי כל ארוחה' },
              { icon: '🤝', title: 'חינמי לחלוטין',      desc: 'אין עמלות, אין דמי שירות — מיזם קהילתי' },
            ].map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="flex flex-col gap-3 p-5 rounded-2xl"
                style={{
                  background: SUBTLE,
                  border: `1px solid rgba(255,200,120,0.12)`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}>
                <span className="text-2xl">{f.icon}</span>
                <p className="font-bold text-sm leading-snug" style={{ color: CREAM }}>{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: BODY }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${AMBER}20, transparent)` }} />

        {/* ── REGIONS ── */}
        <section className="px-6 sm:px-10 py-20 max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: `${AMBER}80` }}>
              פעיל בכל הארץ
            </p>
            <h2 style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
              color: CREAM,
              fontWeight: 900,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}>
              מארחים בכל ישראל
            </h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {REGIONS.map(r => (
              <motion.div key={r.name} variants={item}>
                <Link to="/auth?mode=register">
                  <motion.div
                    className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl text-center"
                    style={{
                      background: SUBTLE,
                      border: `1px solid rgba(255,200,120,0.10)`,
                    }}
                    whileHover={{
                      background: `${r.color}18`,
                      border: `1px solid ${r.color}40`,
                      scale: 1.03,
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={SPRING}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                        style={{ background: r.color }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: r.color }} />
                    </span>
                    <p className="text-xs font-bold leading-tight" style={{ color: CREAM }}>{r.name}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}

            {/* Become a host tile */}
            <motion.div variants={item}>
              <Link to="/auth?mode=register">
                <motion.div
                  className="flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-2xl text-center"
                  style={{ border: `1.5px dashed rgba(255,200,120,0.22)` }}
                  whileHover={{ background: `${AMBER}0F`, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}>
                  <Star className="w-3.5 h-3.5" style={{ color: AMBER }} strokeWidth={1.5} />
                  <p className="text-[11px] font-bold" style={{ color: AMBER }}>פרסם ארוחה</p>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ── FOOTER CTA ── */}
        <section style={{ borderTop: `1px solid rgba(255,200,120,0.10)` }}>
          <div className="px-6 sm:px-10 py-20 max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
            <motion.h3 {...fadeUp()}
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(1.8rem, 6vw, 3.4rem)',
                color: CREAM,
                fontWeight: 900,
                letterSpacing: '-0.028em',
                lineHeight: 1.08,
              }}>
              מוכן לפגוש שולחן חדש?
            </motion.h3>
            <motion.div {...fadeUp(0.08)}>
              <Link to="/auth?mode=register">
                <motion.button
                  className="px-10 py-4 text-base font-bold rounded-2xl flex items-center gap-2.5"
                  style={{
                    background: `linear-gradient(135deg, ${AMBER} 0%, #D07020 100%)`,
                    color: '#1A0E04',
                    boxShadow: `0 8px 36px ${AMBER}40`,
                  }}
                  whileHover={{ scale: 1.05, boxShadow: `0 16px 52px ${AMBER}55` }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}>
                  הצטרף עכשיו — חינם
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `1px solid rgba(255,200,120,0.08)` }}>
          <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <BrandLogo size="sm" />
            <nav className="flex items-center gap-5 flex-wrap">
              {[
                { to: '/about',   label: 'אודות',        bold: true  },
                { to: '/terms',   label: 'תנאי שימוש',   bold: false },
                { to: '/privacy', label: 'פרטיות',        bold: false },
              ].map(({ to, label, bold }) => (
                <Link key={to} to={to}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: bold ? AMBER : BODY, fontWeight: bold ? 600 : 400 }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="text-center text-[10px] pb-5" style={{ color: 'rgba(255,200,120,0.22)' }}>
            שולחן פתוח © 2026 — מיזם קהילתי
          </p>
        </footer>

      </div>
    </div>
  )
}
