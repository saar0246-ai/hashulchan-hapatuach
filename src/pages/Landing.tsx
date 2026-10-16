import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Shield, Heart } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 350, damping: 25 }

// ── Palette lock — warm Mediterranean cream ───────────────────
const BG     = '#FAF8F5'
const TERRA  = '#C0390A'
const OLIVE  = '#2D4A1E'
const TEXT   = '#1C1A17'
const MUTED  = '#786C63'
const BORDER = '#E8E2D8'

// ── Features ──────────────────────────────────────────────────
const FEATURES = [
  { Icon: Calendar, color: TERRA,  bg: `${TERRA}0F`, title: 'ארוחות שבת וחגים',  desc: 'שישי בערב, ראש השנה, פסח — כל אירוע על שולחן ביתי' },
  { Icon: Users,    color: OLIVE,  bg: `${OLIVE}0E`, title: 'מארחים מכל הארץ',   desc: 'משפחות שפותחות את ביתן לאורחים חדשים — מכל מקום' },
  { Icon: Shield,   color: '#1e5fa5', bg: 'rgba(30,95,165,0.09)', title: 'פרופילים מאומתים',  desc: 'מערכת דירוגים שקופה אחרי כל ארוחה' },
  { Icon: Heart,    color: '#9b2c2c', bg: 'rgba(155,44,44,0.09)', title: 'חינמי לחלוטין',      desc: 'אין עמלות, אין דמי שירות — מיזם קהילתי' },
]

// ── Regions (no fake counts) ──────────────────────────────────
const REGIONS = [
  { name: 'ירושלים',     color: TERRA              },
  { name: 'תל אביב',     color: OLIVE              },
  { name: 'חיפה',        color: '#2E70B0'           },
  { name: 'הנגב',        color: '#8F5A0A'           },
  { name: 'הגליל',       color: '#4A8C3A'           },
  { name: 'גוש דן',      color: '#7B4A9E'           },
  { name: 'ראשון לציון', color: TERRA              },
  { name: 'באר שבע',     color: '#8F5A0A'           },
  { name: 'נתניה',       color: '#2E70B0'           },
]

// ── Animation helpers ─────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.55, ease: EASE, delay },
})
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.50, ease: EASE } },
}
const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.50, ease: EASE } },
}

/* ═══════════════════════════════════════════════════════
   LANDING — Warm Mediterranean Luxury
═══════════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div dir="rtl" className="relative min-h-dvh overflow-x-hidden" style={{ background: BG }}>

      {/* ── Ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
        <motion.div className="absolute rounded-full"
          style={{
            width: 900, height: 900, top: -350, right: -300,
            background: `radial-gradient(circle at center, ${TERRA}20 0%, ${TERRA}0A 40%, transparent 70%)`,
            filter: 'blur(120px)',
          }}
          animate={{ x: [0, 60, -30, 0], y: [0, -50, 30, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full"
          style={{
            width: 700, height: 700, bottom: -200, left: -250,
            background: `radial-gradient(circle at center, ${OLIVE}16 0%, ${OLIVE}07 45%, transparent 70%)`,
            filter: 'blur(100px)',
          }}
          animate={{ x: [0, -40, 50, 0], y: [0, 60, -40, 0], scale: [1, 0.9, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div className="absolute rounded-full"
          style={{
            width: 550, height: 550, top: '38%', left: '18%',
            background: 'radial-gradient(circle at center, rgba(220,155,60,0.13) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
          animate={{ x: [0, 35, -50, 20, 0], y: [0, -30, 45, -20, 0] }}
          transition={{ repeat: Infinity, duration: 36, ease: 'easeInOut', delay: 8 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Header ── */}
        <header className="sticky top-0 w-full"
          style={{
            background: 'rgba(250,248,245,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${BORDER}`,
            zIndex: 40,
          }}>
          <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 max-w-7xl mx-auto">
            <Link to="/about" className="transition-opacity hover:opacity-70">
              <BrandLogo size="sm" />
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/auth?mode=login"
                className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: MUTED }}>
                כניסה
              </Link>
              <Link to="/auth?mode=register">
                <motion.button
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${TERRA}, #8F4222)`,
                    boxShadow: `0 4px 16px ${TERRA}38`,
                  }}
                  whileHover={{ scale: 1.04, boxShadow: `0 8px 28px ${TERRA}48` }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}>
                  הצטרף
                </motion.button>
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative px-5 sm:px-8 py-16 sm:py-24 md:py-32 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.10 } } }}
              initial="hidden" animate="show"
              className="flex flex-col items-center w-full">

              <motion.div variants={heroItem}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
                style={{ background: `${TERRA}0D`, borderColor: `${TERRA}28`, color: TERRA }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: TERRA }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: TERRA }} />
                </span>
                חינמי לחלוטין · ללא עמלות
              </motion.div>

              <motion.h1 variants={heroItem}
                style={{
                  fontFamily: "'Frank Ruhl Libre', serif",
                  fontSize: 'clamp(2.8rem, 8vw, 5.8rem)',
                  color: TEXT,
                  lineHeight: 1.02,
                  letterSpacing: '-0.025em',
                  fontWeight: 900,
                  marginBottom: '1.25rem',
                }}>
                שולחן חם<br />
                <span style={{ color: TERRA }}>לכל שבת וחג</span>
              </motion.h1>

              <motion.p variants={heroItem}
                className="text-base md:text-lg leading-relaxed max-w-sm mb-10"
                style={{ color: MUTED }}>
                מארחים פותחים את ביתם.<br />אורחים מוצאים שולחן ביתי אמיתי.
              </motion.p>

              <motion.div variants={heroItem} className="flex gap-3 w-full max-w-xs">
                <Link to="/auth?mode=register" className="flex-1">
                  <motion.button
                    className="w-full py-3.5 text-sm font-bold rounded-2xl text-white flex items-center justify-center gap-1.5"
                    style={{
                      background: `linear-gradient(135deg, ${TERRA}, #8F4222)`,
                      boxShadow: `0 4px 20px ${TERRA}38`,
                    }}
                    whileHover={{ scale: 1.04, boxShadow: `0 8px 28px ${TERRA}48` }}
                    whileTap={{ scale: 0.96 }} transition={SPRING}>
                    הצטרף עכשיו
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>
                <Link to="/auth?mode=login" className="flex-1">
                  <motion.button
                    className="w-full py-3.5 text-sm font-medium rounded-2xl"
                    style={{ border: `1.5px solid ${BORDER}`, color: TEXT, background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                    whileHover={{ scale: 1.03, borderColor: TERRA }}
                    whileTap={{ scale: 0.96 }} transition={SPRING}>
                    כניסה
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Ticker ── */}
        <div className="overflow-hidden py-3 select-none"
          style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: `${TERRA}05` }}
          aria-hidden>
          <motion.div className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
            style={{ width: 'max-content' }}>
            {[...Array(2)].flatMap(() => [
              'ירושלים', '·', 'תל אביב', '·', 'חיפה', '·', 'הנגב', '·', 'הגליל', '·',
              'שבת · חג · חול', '·', 'כולם מוזמנים', '·', 'ללא עמלות', '·',
            ]).map((t, i) => (
              <span key={i} className="text-xs font-semibold"
                style={{ color: t === '·' ? `${TERRA}40` : MUTED }}>
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── FEATURES ── */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto">
            <motion.p {...fadeUp()} className="text-xs font-bold uppercase tracking-[0.18em] mb-10 text-center"
              style={{ color: MUTED }}>
              מה תמצא כאן
            </motion.p>
            <motion.div variants={stagger} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
                <motion.div key={i} variants={item}
                  whileHover={{ y: -6, scale: 1.015, boxShadow: '0 20px 48px rgba(44,24,8,0.09)' }}
                  transition={SPRING}
                  className="flex flex-col gap-4 p-5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.62)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${BORDER}`,
                    boxShadow: '0 1px 4px rgba(44,24,8,0.04)',
                  }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1.5 leading-snug" style={{ color: TEXT }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto">
            <motion.p {...fadeUp()} className="text-xs font-bold uppercase tracking-[0.18em] mb-12 text-center"
              style={{ color: MUTED }}>
              איך זה עובד
            </motion.p>
            <motion.div variants={stagger} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-14">
              {[
                { n: '01', title: 'נרשמים',        desc: 'פרופיל חינמי עם העדפות כשרות ודת — תהליך של 5 דקות.' },
                { n: '02', title: 'מוצאים ארוחה', desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
                { n: '03', title: 'מגיעים ונהנים',desc: 'המארח בוחר ושולח כתובת ישירות.' },
              ].map((s, i) => (
                <motion.div key={i} variants={item} className="flex items-start gap-5">
                  <span className="flex-shrink-0 font-black text-5xl leading-none select-none"
                    style={{ color: `${TERRA}1A`, fontVariantNumeric: 'tabular-nums' }}>
                    {s.n}
                  </span>
                  <div>
                    <p className="font-bold text-base mb-2" style={{ color: TEXT }}>{s.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── REGIONS ── */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto">
            <motion.div {...fadeUp()} className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: MUTED }}>
                פעיל בכל הארץ
              </p>
              <h2 style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
                color: TEXT, fontWeight: 900,
                letterSpacing: '-0.025em', lineHeight: 1.1,
              }}>
                מארחים בכל ישראל
              </h2>
            </motion.div>

            <motion.div variants={stagger} initial="hidden"
              whileInView="show" viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {REGIONS.map(r => (
                <motion.div key={r.name} variants={item}>
                  <Link to="/auth?mode=register">
                    <motion.div
                      className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl text-center"
                      style={{
                        background: 'rgba(255,255,255,0.55)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: `1px solid ${BORDER}`,
                      }}
                      whileHover={{ background: `${r.color}0D`, border: `1px solid ${r.color}36`, scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING}>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                          style={{ background: r.color }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: r.color }} />
                      </span>
                      <p className="text-xs font-bold" style={{ color: TEXT }}>{r.name}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={item}>
                <Link to="/auth?mode=register">
                  <motion.div
                    className="flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-2xl text-center min-h-[80px]"
                    style={{ border: `1.5px dashed ${TERRA}30`, background: `${TERRA}06` }}
                    whileHover={{ background: `${TERRA}10`, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }} transition={SPRING}>
                    <p className="text-xs font-bold" style={{ color: TERRA }}>פרסם ארוחה</p>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div {...fadeUp()}>
              <h3 style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
                color: TEXT, fontWeight: 900,
                letterSpacing: '-0.022em', lineHeight: 1.1,
              }}>
                מוכן לפגוש שולחן חדש?
              </h3>
              <p className="text-sm mt-2" style={{ color: MUTED }}>הצטרף לקהילה — חינמי לחלוטין</p>
            </motion.div>
            <motion.div {...fadeUp(0.08)} className="flex-shrink-0">
              <Link to="/auth?mode=register">
                <motion.button
                  className="px-8 py-4 text-base font-bold rounded-2xl text-white flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${TERRA}, #8F4222)`,
                    boxShadow: `0 8px 28px ${TERRA}38`,
                  }}
                  whileHover={{ scale: 1.04, boxShadow: `0 12px 36px ${TERRA}50` }}
                  whileTap={{ scale: 0.96 }} transition={SPRING}>
                  הצטרף עכשיו — חינם
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-8 max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <BrandLogo size="sm" />
            <nav className="flex items-center gap-5">
              {[
                { to: '/about', label: 'אודות', bold: true },
                { to: '/terms', label: 'תנאי שימוש', bold: false },
                { to: '/privacy', label: 'פרטיות', bold: false },
              ].map(({ to, label, bold }) => (
                <Link key={to} to={to}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: bold ? TERRA : MUTED, fontWeight: bold ? 600 : 400 }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="text-center text-[10px] pb-5" style={{ color: 'rgba(120,108,99,0.38)' }}>
            שולחן פתוח © 2026 — מיזם קהילתי
          </p>
        </footer>

      </div>
    </div>
  )
}
