import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, Shield, Heart, MapPin, Flame, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'

type BezierEase = [number, number, number, number]

/* ─── Design tokens ─── */
const C = {
  bg:       '#FDFBF7',
  card:     '#FFFFFF',
  border:   '#E8E2D8',
  text:     '#1C1A17',
  muted:    '#786C63',
  accent:   '#C0522A',
  accentBg: 'rgba(192,82,42,0.09)',
  amber:    '#B8780A',
}

/* ─── Data ─── */
const FEATURES = [
  { Icon: Calendar, color: '#C0522A', bg: 'rgba(192,82,42,0.09)', title: 'ארוחות שבת וחגים',   desc: 'שישי בערב, ראש השנה, פסח — כל אירוע על שולחן ביתי' },
  { Icon: Users,    color: '#1a7a4a', bg: 'rgba(26,122,74,0.09)', title: 'מארחים מכל הארץ',    desc: 'משפחות שפותחות את ביתן לאורחים חדשים — מכל מקום' },
  { Icon: Shield,   color: '#1e5fa5', bg: 'rgba(30,95,165,0.09)', title: 'פרופילים מאומתים',   desc: 'מערכת דירוגים שקופה אחרי כל ארוחה' },
  { Icon: Heart,    color: '#9b2c2c', bg: 'rgba(155,44,44,0.09)', title: 'חינמי לחלוטין',       desc: 'אין עמלות, אין דמי שירות — מיזם קהילתי' },
]

const STEPS = [
  { n: '01', title: 'נרשמים',         desc: 'פרופיל חינמי עם העדפות כשרות ודת — תהליך של 5 דקות.' },
  { n: '02', title: 'מוצאים ארוחה',  desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
  { n: '03', title: 'מגיעים ונהנים', desc: 'המארח בוחר ושולח כתובת ישירות.' },
]

interface Region {
  id: string
  name: string
  sub: string
  color: string
  bg: string
  dot: string
}

const REGIONS: Region[] = [
  { id: 'jerusalem', name: 'ירושלים',      sub: 'עיר הבירה',    color: '#C0522A', bg: 'rgba(192,82,42,0.07)',  dot: '#C0522A' },
  { id: 'tel-aviv',  name: 'תל אביב',      sub: 'מרכז המדינה',  color: '#1a7a4a', bg: 'rgba(26,122,74,0.07)',   dot: '#1a7a4a' },
  { id: 'haifa',     name: 'חיפה',         sub: 'עיר הכרמל',    color: '#1e5fa5', bg: 'rgba(30,95,165,0.07)',   dot: '#1e5fa5' },
  { id: 'negev',     name: 'הנגב',         sub: 'דרום ישראל',   color: '#B8780A', bg: 'rgba(184,120,10,0.07)',  dot: '#B8780A' },
  { id: 'galilee',   name: 'הגליל',        sub: 'צפון ישראל',   color: '#4A8C3A', bg: 'rgba(74,140,58,0.07)',   dot: '#4A8C3A' },
  { id: 'center',    name: 'גוש דן',       sub: 'השרון וסביבה', color: '#7B4A9E', bg: 'rgba(123,74,158,0.07)', dot: '#7B4A9E' },
  { id: 'rishon',    name: 'ראשון לציון',  sub: 'שפלת החוף',    color: '#C0522A', bg: 'rgba(192,82,42,0.07)',  dot: '#C0522A' },
  { id: 'beersheba', name: 'באר שבע',      sub: 'בירת הנגב',    color: '#B8780A', bg: 'rgba(184,120,10,0.07)',  dot: '#B8780A' },
  { id: 'netanya',   name: 'נתניה',        sub: 'חוף השרון',    color: '#1e5fa5', bg: 'rgba(30,95,165,0.07)',   dot: '#1e5fa5' },
]

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as BezierEase, delay },
})

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as BezierEase } },
}
const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as BezierEase } },
}

const spring = { type: 'spring' as const, stiffness: 380, damping: 26 }

/* ─── Region card ─── */
function RegionCard({ region, selectedRegion, onSelect }: { region: Region; selectedRegion: string | null; onSelect: (id: string) => void }) {
  const isSelected = selectedRegion === region.id
  return (
    <motion.button
      onClick={() => onSelect(region.id)}
      className="flex flex-col items-start gap-3 p-4 rounded-2xl text-right w-full"
      style={{
        background: isSelected ? region.bg : C.card,
        border: `1.5px solid ${isSelected ? region.color : C.border}`,
        boxShadow: isSelected
          ? `0 8px 24px ${region.color}22, 0 1px 3px rgba(44,24,8,0.06)`
          : '0 1px 3px rgba(44,24,8,0.04)',
      }}
      whileHover={{ y: -4, boxShadow: `0 16px 36px ${region.color}1A, 0 2px 8px rgba(44,24,8,0.07)` }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <p className="font-bold text-sm leading-snug" style={{ color: isSelected ? region.color : C.text }}>{region.name}</p>
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
            style={{ background: region.dot }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: region.dot }} />
        </span>
      </div>
      <p className="text-[11px] leading-tight" style={{ color: C.muted }}>{region.sub}</p>
    </motion.button>
  )
}

/* ─── Page ─── */
export default function Landing() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  return (
    <div className="relative min-h-dvh flex flex-col overflow-x-hidden" style={{ background: C.bg }}>

      {/* ══ AMBIENT BACKGROUND ══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 900, height: 900,
            top: -350, right: -300,
            background: 'radial-gradient(circle at center, rgba(245,158,11,0.32) 0%, rgba(245,158,11,0.12) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ x: [0, 60, -30, 0], y: [0, -50, 30, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700,
            bottom: -200, left: -250,
            background: 'radial-gradient(circle at center, rgba(192,82,42,0.28) 0%, rgba(192,82,42,0.09) 45%, transparent 70%)',
            filter: 'blur(55px)',
          }}
          animate={{ x: [0, -40, 50, 0], y: [0, 60, -40, 0], scale: [1, 0.9, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 550, height: 550,
            top: '38%', left: '18%',
            background: 'radial-gradient(circle at center, rgba(245,195,100,0.20) 0%, rgba(245,195,100,0.06) 50%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{ x: [0, 35, -50, 20, 0], y: [0, -30, 45, -20, 0], scale: [1, 1.06, 0.96, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 35, ease: 'easeInOut', delay: 6 }}
        />
      </div>

      {/* ═══ HEADER ═══ */}
      <header
        className="sticky top-0 w-full"
        style={{
          background: 'rgba(253,251,247,0.82)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid ${C.border}`,
          zIndex: 40,
        }}
      >
        <div className="relative flex items-center justify-between px-5 sm:px-8 py-3.5 max-w-7xl mx-auto">
          <Link to="/about" className="active:opacity-70 transition-opacity">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=login"
              className="hidden sm:block text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: C.muted }}>
              כניסה
            </Link>
            <Link to="/auth?mode=register">
              <motion.button
                className="text-sm font-semibold rounded-lg px-4 py-2 text-white shadow-sm"
                style={{ background: C.accent }}
                whileHover={{ scale: 1.03, boxShadow: `0 4px 16px rgba(192,82,42,0.4)` }}
                whileTap={{ scale: 0.96 }}
                transition={spring}
              >
                הצטרף
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative flex-1 flex items-center px-5 sm:px-8 py-16 sm:py-24 md:py-32 max-w-7xl mx-auto w-full" style={{ zIndex: 1 }}>
        <div className="flex flex-col items-center text-center w-full">
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center w-full max-w-2xl"
          >
            {/* Badge */}
            <motion.div
              variants={heroItem}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
              style={{ background: C.accentBg, borderColor: 'rgba(192,82,42,0.25)', color: C.accent }}
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: C.accent }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.accent }} />
              </span>
              חינמי לחלוטין · ללא עמלות
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={heroItem}
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(2.6rem, 8vw, 5.6rem)',
                color: C.text,
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                fontWeight: 900,
                marginBottom: '1.25rem',
              }}
            >
              שולחן חם
              <br />
              <span style={{ color: C.accent }}>לכל שבת וחג</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={heroItem}
              className="text-base md:text-lg leading-relaxed max-w-md mb-10"
              style={{ color: C.muted }}
            >
              מארחים פותחים את ביתם · אורחים מוצאים שולחן ביתי אמיתי בכל רחבי הארץ
            </motion.p>

            {/* CTAs */}
            <motion.div variants={heroItem} className="flex gap-3 w-full max-w-xs">
              <Link to="/auth?mode=register" className="flex-1">
                <motion.button
                  className="w-full py-3.5 text-sm font-semibold rounded-xl text-white"
                  style={{ background: C.accent, boxShadow: `0 4px 20px rgba(192,82,42,0.35)` }}
                  whileHover={{ scale: 1.03, boxShadow: `0 8px 28px rgba(192,82,42,0.45)` }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                >
                  הצטרף עכשיו
                </motion.button>
              </Link>
              <Link to="/auth?mode=login" className="flex-1">
                <motion.button
                  className="w-full py-3.5 text-sm font-medium rounded-xl"
                  style={{ border: `1.5px solid ${C.border}`, color: C.text, background: C.card }}
                  whileHover={{ scale: 1.03, borderColor: C.accent }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                >
                  כניסה
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TICKER STRIP ═══ */}
      <div
        className="overflow-hidden py-3.5 select-none"
        style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, zIndex: 1, position: 'relative', background: 'rgba(192,82,42,0.04)' }}
        aria-hidden
      >
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          style={{ width: 'max-content' }}
        >
          {[...Array(2)].flatMap(() => [
            'ירושלים', '·', 'תל אביב', '·', 'חיפה', '·', 'הנגב', '·', 'הגליל', '·',
            'שבת · חג · חול', '·', 'כולם מוזמנים', '·', 'ללא עמלות', '·',
          ]).map((item, i) => (
            <span
              key={i}
              className="text-xs font-semibold"
              style={{ color: item === '·' ? 'rgba(192,82,42,0.35)' : C.muted }}
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ═══ GEOGRAPHIC SHOWCASE ═══ */}
      <section style={{ zIndex: 1, borderTop: `1px solid ${C.border}` }}>
        <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto">
          <motion.div {...fadeUp()} className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.muted }}>
              פעיל בכל הארץ
            </p>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2
                style={{
                  fontFamily: "'Frank Ruhl Libre', serif",
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                  color: C.text,
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                מארחים בכל ישראל
              </h2>
              {selectedRegion && (
                <AnimatePresence>
                  <motion.div
                    key="filter-badge"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={spring}
                  >
                    <Link to={`/auth?mode=register&city=${selectedRegion}`}>
                      <button
                        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full text-white"
                        style={{ background: C.accent }}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        הצטרף והמתן לארוחות באזור
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {REGIONS.map((region) => (
              <motion.div key={region.id} variants={staggerItem}>
                <RegionCard
                  region={region}
                  selectedRegion={selectedRegion}
                  onSelect={(id) => setSelectedRegion(prev => prev === id ? null : id)}
                />
              </motion.div>
            ))}
            {/* CTA tile */}
            <motion.div variants={staggerItem}>
              <Link to="/auth?mode=register">
                <motion.div
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-center h-full min-h-[120px]"
                  style={{
                    background: C.accentBg,
                    border: `1.5px dashed rgba(192,82,42,0.35)`,
                  }}
                  whileHover={{ scale: 1.03, background: 'rgba(192,82,42,0.14)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                >
                  <MapPin className="w-4 h-4" style={{ color: C.accent }} />
                  <p className="text-sm font-bold" style={{ color: C.accent }}>פרסם ארוחה</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>הצטרף לרשת המארחים</p>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ zIndex: 1, borderTop: `1px solid ${C.border}` }}>
        <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto">
          <motion.p {...fadeUp()} className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: C.muted }}>
            מה תמצא כאן
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          >
            {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(44,24,8,0.09)' }}
                transition={spring}
                className="flex flex-col gap-4 p-5 rounded-2xl"
                style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(44,24,8,0.04)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1.5 leading-snug" style={{ color: C.text }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ zIndex: 1, borderTop: `1px solid ${C.border}` }}>
        <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto">
          <motion.p {...fadeUp()} className="text-xs font-semibold uppercase tracking-widest mb-12" style={{ color: C.muted }}>
            איך זה עובד
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-14"
          >
            {STEPS.map((s, i) => (
              <motion.div key={i} variants={staggerItem} className="flex items-start gap-5">
                <span
                  className="flex-shrink-0 font-black text-5xl leading-none select-none"
                  style={{ color: 'rgba(192,82,42,0.18)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.n}
                </span>
                <div>
                  <p className="font-bold text-base mb-2" style={{ color: C.text }}>{s.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER CTA STRIP ═══ */}
      <motion.section
        {...fadeUp()}
        style={{ zIndex: 1, borderTop: `1px solid ${C.border}` }}
      >
        <div className="px-5 sm:px-8 py-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
                color: C.text,
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              מוכן לפגוש שולחן חדש?
            </h3>
            <p className="text-sm mt-2" style={{ color: C.muted }}>הצטרף לקהילה — חינמי לחלוטין</p>
          </div>
          <Link to="/auth?mode=register" className="flex-shrink-0">
            <motion.button
              className="px-8 py-4 text-base font-semibold rounded-2xl text-white"
              style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #8C3318 100%)`, boxShadow: `0 8px 28px rgba(192,82,42,0.38)` }}
              whileHover={{ scale: 1.04, boxShadow: `0 12px 36px rgba(192,82,42,0.50)` }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
            >
              הצטרף עכשיו — חינם
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* ═══ FOOTER ═══ */}
      <div style={{ borderTop: `1px solid ${C.border}`, zIndex: 1, position: 'relative' }}>
        <div className="px-5 sm:px-8 py-8 max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <BrandLogo size="sm" />
          <nav className="flex items-center gap-5 flex-wrap">
            {[
              { to: '/about', label: 'אודות', bold: true },
              { to: '/terms', label: 'תנאי שימוש', bold: false },
              { to: '/privacy', label: 'פרטיות', bold: false },
            ].map(({ to, label, bold }) => (
              <Link key={to} to={to}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: bold ? C.accent : C.muted, fontWeight: bold ? 600 : 400 }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-center text-[10px] pb-5" style={{ color: 'rgba(120,108,99,0.4)' }}>
          שולחן פתוח © 2026 — מיזם קהילתי
        </p>
      </div>

    </div>
  )
}
