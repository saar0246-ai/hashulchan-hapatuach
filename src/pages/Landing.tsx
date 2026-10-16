import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Shield, Heart } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 350, damping: 25 }

const BG     = '#FAF8F5'
const TERRA  = '#C0390A'
const OLIVE  = '#2D4A1E'
const TEXT   = '#1C1A17'
const MUTED  = '#786C63'
const BORDER = '#E8E2D8'

const GLASS = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 24px 60px rgba(184,93,57,0.08), inset 0 1px 0 rgba(255,255,255,0.92)',
} as const

const FEATURES = [
  {
    Icon: Calendar, color: TERRA,     bg: `${TERRA}0F`,
    title: 'ארוחות שבת וחגים',
    desc:  'שישי בערב, ראש השנה, פסח — כל אירוע על שולחן ביתי',
  },
  {
    Icon: Users,    color: OLIVE,     bg: `${OLIVE}0E`,
    title: 'מארחים מכל הארץ',
    desc:  'משפחות שפותחות את ביתן לאורחים חדשים — מכל מקום',
  },
  {
    Icon: Shield,   color: '#1e5fa5', bg: 'rgba(30,95,165,0.09)',
    title: 'פרופילים מאומתים',
    desc:  'מערכת דירוגים שקופה אחרי כל ארוחה',
  },
  {
    Icon: Heart,    color: '#9b2c2c', bg: 'rgba(155,44,44,0.09)',
    title: 'חינמי לחלוטין',
    desc:  'אין עמלות, אין דמי שירות — מיזם קהילתי',
  },
]

const REGIONS = [
  { name: 'ירושלים',     color: TERRA           },
  { name: 'תל אביב',     color: OLIVE           },
  { name: 'חיפה',        color: '#2E70B0'        },
  { name: 'הנגב',        color: '#8F5A0A'        },
  { name: 'הגליל',       color: '#4A8C3A'        },
  { name: 'גוש דן',      color: '#7B4A9E'        },
  { name: 'ראשון לציון', color: TERRA           },
  { name: 'באר שבע',     color: '#8F5A0A'        },
  { name: 'נתניה',       color: '#2E70B0'        },
]

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.52, ease: EASE } },
}

function CandlelightOrb() {
  const rings = [320, 256, 196, 144, 100, 62, 32]
  const opacities = [0.05, 0.09, 0.15, 0.22, 0.32, 0.46, 1]
  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* Outer ambient */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${TERRA}18 0%, transparent 68%)`,
          filter: 'blur(48px)',
        }} aria-hidden />

      {rings.map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size, height: size,
            border: `1px solid rgba(192,57,10,${opacities[i]})`,
            boxShadow: i === rings.length - 1
              ? `0 0 24px ${TERRA}60, 0 0 8px ${TERRA}80`
              : 'none',
          }}
          animate={{
            scale: [1, 1 + (rings.length - 1 - i) * 0.018, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8 + i * 0.35,
            ease: 'easeInOut',
            delay: i * 0.18,
          }}
        />
      ))}

      {/* Central flame core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 28, height: 28,
          background: `radial-gradient(circle, #F59E0B, ${TERRA})`,
          boxShadow: `0 0 14px ${TERRA}90, 0 0 32px ${TERRA}48, 0 0 64px ${TERRA}22`,
        }}
        animate={{ scale: [1, 1.18, 0.92, 1.12, 1], opacity: [1, 0.82, 1] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
      />
    </div>
  )
}

export default function Landing() {
  return (
    <div dir="rtl" className="relative min-h-dvh overflow-x-hidden" style={{ background: BG }}>

      {/* ── Ambient mesh — fixed behind everything ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
        <motion.div className="absolute rounded-full"
          style={{
            width: 960, height: 960, top: -380, right: -340,
            background: `radial-gradient(circle at center, ${TERRA}1E 0%, ${TERRA}0A 40%, transparent 70%)`,
            filter: 'blur(130px)',
          }}
          animate={{ x: [0, 64, -32, 0], y: [0, -56, 34, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ repeat: Infinity, duration: 26, ease: 'easeInOut' }} />

        <motion.div className="absolute rounded-full"
          style={{
            width: 760, height: 760, bottom: -220, left: -280,
            background: `radial-gradient(circle at center, ${OLIVE}16 0%, ${OLIVE}07 45%, transparent 70%)`,
            filter: 'blur(110px)',
          }}
          animate={{ x: [0, -42, 54, 0], y: [0, 66, -42, 0], scale: [1, 0.9, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 32, ease: 'easeInOut', delay: 5 }} />

        <motion.div className="absolute rounded-full"
          style={{
            width: 580, height: 580, top: '36%', left: '16%',
            background: 'radial-gradient(circle at center, rgba(245,158,11,0.14) 0%, transparent 70%)',
            filter: 'blur(96px)',
          }}
          animate={{ x: [0, 38, -52, 20, 0], y: [0, -34, 48, -18, 0] }}
          transition={{ repeat: Infinity, duration: 38, ease: 'easeInOut', delay: 9 }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── Sticky header ── */}
        <header className="sticky top-0 w-full" style={{ zIndex: 40 }}>
          <div className="relative">
            <div className="absolute inset-0"
              style={{
                background: 'rgba(250,248,245,0.84)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: `1px solid ${BORDER}`,
              }} />
            <div className="relative flex items-center justify-between px-5 sm:px-8 py-4 max-w-7xl mx-auto">
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
                    className="text-sm font-bold px-5 py-2.5 rounded-2xl text-white"
                    style={{
                      background: `linear-gradient(135deg, ${TERRA}, #8F3A18)`,
                      boxShadow: `0 4px 18px ${TERRA}38`,
                    }}
                    whileHover={{ scale: 1.04, boxShadow: `0 8px 28px ${TERRA}50` }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING}>
                    הצטרף
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════
            HERO — Full-viewport, split-column on desktop.
            Right column (RTL first): headline + CTAs.
            Left column (RTL second): animated candlelight.
        ══════════════════════════════════════════════ */}
        <section
          className="relative flex flex-col md:grid md:gap-12 px-5 sm:px-8 max-w-7xl mx-auto"
          style={{
            minHeight: 'calc(100dvh - 65px)',
            alignItems: 'center',
            paddingTop: '4rem',
            paddingBottom: '4rem',
            gridTemplateColumns: '1fr auto',
          }}>

          {/* Text column — right side in RTL */}
          <motion.div
            className="flex flex-col items-start"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.11 } } }}
            initial="hidden" animate="show">

            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8 border"
              style={{ background: `${TERRA}0D`, borderColor: `${TERRA}30`, color: TERRA }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                  style={{ background: TERRA }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: TERRA }} />
              </span>
              חינמי לחלוטין · ללא עמלות
            </motion.div>

            <motion.h1
              variants={item}
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(3rem, 8.5vw, 6rem)',
                color: TEXT,
                lineHeight: 1.01,
                letterSpacing: '-0.030em',
                fontWeight: 900,
                marginBottom: '1.5rem',
              }}>
              שולחן חם<br />
              <span style={{ color: TERRA }}>לכל שבת וחג</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-base md:text-lg leading-relaxed max-w-sm mb-10"
              style={{ color: MUTED }}>
              מארחים פותחים את ביתם.<br />
              אורחים מוצאים שולחן ביתי אמיתי.
            </motion.p>

            <motion.div variants={item} className="flex gap-3 w-full max-w-xs">
              <Link to="/auth?mode=register" className="flex-1">
                <motion.button
                  className="w-full py-4 text-sm font-bold rounded-2xl text-white flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${TERRA}, #8F3A18)`,
                    boxShadow: `0 6px 22px ${TERRA}40`,
                  }}
                  whileHover={{ scale: 1.04, boxShadow: `0 10px 30px ${TERRA}52` }}
                  whileTap={{ scale: 0.96 }} transition={SPRING}>
                  הצטרף עכשיו
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/auth?mode=login" className="flex-1">
                <motion.button
                  className="w-full py-4 text-sm font-medium rounded-2xl"
                  style={{
                    border: `1.5px solid ${BORDER}`,
                    color: TEXT,
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  }}
                  whileHover={{ scale: 1.03, borderColor: TERRA }}
                  whileTap={{ scale: 0.96 }} transition={SPRING}>
                  כניסה
                </motion.button>
              </Link>
            </motion.div>

            {/* Value props row */}
            <motion.div variants={item} className="flex items-center gap-5 mt-10 flex-wrap">
              {['אפס עמלות', 'כשרות גמישה', 'RTL מלא'].map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: TERRA }} />
                  <span className="text-xs font-semibold" style={{ color: MUTED }}>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Decoration column — left side in RTL, hidden on mobile */}
          <motion.div
            className="hidden md:flex items-center justify-center flex-shrink-0"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}>
            <CandlelightOrb />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}>
            <div className="w-px h-10 rounded-full"
              style={{ background: `linear-gradient(to bottom, transparent, ${TERRA}40)` }} />
          </motion.div>
        </section>

        {/* ── Ticker strip ── */}
        <div className="overflow-hidden py-3.5 select-none"
          style={{
            borderTop: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            background: `${TERRA}05`,
          }}
          aria-hidden>
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
            style={{ width: 'max-content' }}>
            {[...Array(2)].flatMap(() =>
              ['ירושלים', '·', 'תל אביב', '·', 'חיפה', '·', 'הנגב', '·', 'הגליל', '·',
               'שבת · חג · חול', '·', 'כולם מוזמנים', '·', 'ללא עמלות', '·']
            ).map((t, i) => (
              <span key={i} className="text-xs font-semibold"
                style={{ color: t === '·' ? `${TERRA}40` : MUTED }}>
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════
            FEATURES — Large glassmorphic cards
            Heavier glass, larger icon containers,
            more generous padding than before.
        ══════════════════════════════════════════════ */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-20 max-w-7xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, ease: EASE }}
              className="text-[10px] font-bold uppercase tracking-[0.20em] mb-12 text-center"
              style={{ color: MUTED }}>
              מה תמצא כאן
            </motion.p>

            <motion.div
              variants={stagger} initial="hidden"
              whileInView="show" viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
                <motion.div
                  key={i} variants={item}
                  whileHover={{ y: -8, scale: 1.018, boxShadow: '0 28px 56px rgba(44,24,8,0.11)' }}
                  transition={SPRING}
                  className="flex flex-col gap-5 rounded-3xl"
                  style={{
                    padding: '1.5rem',
                    ...GLASS,
                  }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: bg }}>
                    <Icon className="w-7 h-7" style={{ color }} strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className="font-bold text-base mb-2 leading-snug" style={{ color: TEXT }}>
                      {title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            HOW IT WORKS — Generous layout, no dividers
        ══════════════════════════════════════════════ */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-20 max-w-7xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, ease: EASE }}
              className="text-[10px] font-bold uppercase tracking-[0.20em] mb-14 text-center"
              style={{ color: MUTED }}>
              איך זה עובד
            </motion.p>

            <motion.div
              variants={stagger} initial="hidden"
              whileInView="show" viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
              {[
                { n: '01', title: 'נרשמים',         desc: 'פרופיל חינמי עם העדפות כשרות ודת — תהליך של 5 דקות.' },
                { n: '02', title: 'מוצאים ארוחה',  desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
                { n: '03', title: 'מגיעים ונהנים', desc: 'המארח בוחר ושולח כתובת ישירות.' },
              ].map((s, i) => (
                <motion.div key={i} variants={item} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-3xl flex items-center justify-center"
                    style={{ ...GLASS }}>
                    <span className="font-black text-base"
                      style={{ color: TERRA, letterSpacing: '-0.04em' }}>
                      {s.n}
                    </span>
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-base mb-2" style={{ color: TEXT }}>{s.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Regions ── */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-20 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.52, ease: EASE }}
              className="mb-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.20em] mb-4" style={{ color: MUTED }}>
                פעיל בכל הארץ
              </p>
              <h2 style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(1.8rem, 5vw, 3.4rem)',
                color: TEXT, fontWeight: 900,
                letterSpacing: '-0.026em', lineHeight: 1.08,
              }}>
                מארחים בכל ישראל
              </h2>
            </motion.div>

            <motion.div
              variants={stagger} initial="hidden"
              whileInView="show" viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {REGIONS.map(r => (
                <motion.div key={r.name} variants={item}>
                  <Link to="/auth?mode=register">
                    <motion.div
                      className="flex flex-col items-center justify-center gap-2.5 rounded-3xl text-center"
                      style={{
                        padding: '1rem 0.75rem',
                        ...GLASS,
                      }}
                      whileHover={{
                        background: `${r.color}0D`,
                        border: `1px solid ${r.color}36`,
                        scale: 1.04, y: -4,
                        boxShadow: `0 16px 40px ${r.color}14`,
                      }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
                          style={{ background: r.color }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: r.color }} />
                      </span>
                      <p className="text-xs font-bold" style={{ color: TEXT }}>{r.name}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={item}>
                <Link to="/auth?mode=register">
                  <motion.div
                    className="flex flex-col items-center justify-center gap-1.5 rounded-3xl text-center"
                    style={{
                      padding: '1rem 0.75rem',
                      border: `1.5px dashed ${TERRA}30`,
                      background: `${TERRA}06`,
                      minHeight: '80px',
                    }}
                    whileHover={{ background: `${TERRA}12`, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }} transition={SPRING}>
                    <p className="text-xs font-bold" style={{ color: TERRA }}>פרסם ארוחה</p>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER CTA — Large editorial call to action
        ══════════════════════════════════════════════ */}
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-20 max-w-7xl mx-auto">
            <div className="rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
              style={{ ...GLASS }}>

              {/* Decorative glow inside CTA block */}
              <div className="absolute pointer-events-none rounded-3xl overflow-hidden inset-0" aria-hidden>
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${TERRA}0C, transparent 70%)`,
                    filter: 'blur(40px)',
                  }} />
              </div>

              <div className="relative z-10">
                <h3 style={{
                  fontFamily: "'Frank Ruhl Libre', serif",
                  fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)',
                  color: TEXT, fontWeight: 900,
                  letterSpacing: '-0.024em', lineHeight: 1.08,
                }}>
                  מוכן לפגוש שולחן חדש?
                </h3>
                <p className="text-sm mt-3" style={{ color: MUTED }}>הצטרף לקהילה — חינמי לחלוטין</p>
              </div>

              <div className="relative z-10 flex-shrink-0">
                <Link to="/auth?mode=register">
                  <motion.button
                    className="px-10 py-4 text-base font-bold rounded-2xl text-white flex items-center gap-2.5"
                    style={{
                      background: `linear-gradient(135deg, ${TERRA}, #8F3A18)`,
                      boxShadow: `0 8px 28px ${TERRA}40`,
                    }}
                    whileHover={{ scale: 1.04, boxShadow: `0 14px 38px ${TERRA}54` }}
                    whileTap={{ scale: 0.96 }} transition={SPRING}>
                    הצטרף עכשיו — חינם
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="px-5 sm:px-8 py-8 max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <BrandLogo size="sm" />
            <nav className="flex items-center gap-6">
              {[
                { to: '/about',   label: 'אודות',         bold: true  },
                { to: '/terms',   label: 'תנאי שימוש',    bold: false },
                { to: '/privacy', label: 'פרטיות',        bold: false },
              ].map(({ to, label, bold }) => (
                <Link key={to} to={to}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: bold ? TERRA : MUTED, fontWeight: bold ? 600 : 400 }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="text-center text-[10px] pb-6" style={{ color: 'rgba(120,108,99,0.36)' }}>
            שולחן פתוח © 2026 — מיזם קהילתי
          </p>
        </footer>

      </div>
    </div>
  )
}
