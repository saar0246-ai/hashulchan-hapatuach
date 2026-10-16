import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, X, CalendarPlus, MapPin, ChevronLeft, Utensils,
  Moon, Sun, Star, Flame, ArrowUpRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  motion, AnimatePresence, LayoutGroup,
  useMotionValue, useSpring,
  type Variants,
} from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import TopBar from '../components/TopBar'
import FluidCanvas from '../components/FluidCanvas'

/* ─── Motion config ──────────────────────────────────────── */
type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING           = { type: 'spring' as const, stiffness: 350, damping: 22 }
const SPRING_TILT      = { stiffness: 300, damping: 28 }

/* ─── Brand palette ──────────────────────────────────────── */
const TERRA = '#C0390A'
const OLIVE = '#2D4A1E'
const TEXT  = '#1C1A17'
const MUTED = '#786C63'

/* ─── Glass surfaces ─────────────────────────────────────── */
const GLASS = {
  background:           'rgba(255,255,255,0.45)',
  backdropFilter:       'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border:               '1px solid rgba(255,255,255,0.75)',
  boxShadow:            '0 24px 60px rgba(192,57,10,0.08), inset 0 1px 0 rgba(255,255,255,0.90)',
} as const

const GLASS_HEAVY = {
  background:           'rgba(255,255,255,0.72)',
  backdropFilter:       'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border:               '1px solid rgba(255,255,255,0.90)',
  boxShadow:            '0 30px 60px rgba(192,57,10,0.10), 0 4px 16px rgba(44,24,8,0.06), inset 0 1px 0 rgba(255,255,255,0.98)',
} as const

/* ─── Data ───────────────────────────────────────────────── */
const TABS = [
  { id: 'all',            label: 'הכל'        },
  { id: 'shabbat_dinner', label: 'ארוחות שישי' },
  { id: 'shabbat_lunch',  label: 'ארוחות שבת'  },
  { id: 'holiday',        label: 'חגים'        },
  { id: 'weekday',        label: 'חול'         },
]

interface Region { name: string; label: string; color: string; cities: string[]; Icon: LucideIcon }
const REGIONS: Region[] = [
  {
    name: 'ירושלים', label: 'ירושלים והסביבה', color: TERRA, Icon: Moon,
    cities: ['ירושלים', 'בית שמש', 'מעלה אדומים', 'מבשרת ציון', 'גבעת זאב'],
  },
  {
    name: 'גוש דן', label: 'גוש דן ותל אביב', color: OLIVE, Icon: Sun,
    cities: ['תל אביב', 'רמת גן', 'גבעתיים', 'בני ברק', 'ראשון לציון', 'פתח תקוה', 'חולון', 'בת ים', 'אשדוד', 'נתניה'],
  },
  {
    name: 'הצפון', label: 'חיפה והצפון', color: '#1E5A8A', Icon: Star,
    cities: ['חיפה', 'נהריה', 'עכו', 'טבריה', 'צפת', 'נצרת', 'קריית שמונה'],
  },
  {
    name: 'הנגב', label: 'באר שבע והנגב', color: '#8F5A0A', Icon: Flame,
    cities: ['באר שבע', 'אשקלון', 'אילת', 'דימונה', 'ערד', 'נתיבות'],
  },
]

/* ─── Animation variants ─────────────────────────────────── */
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp: Variants  = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.44, ease: EASE } },
}

/* ─── Border Beam ────────────────────────────────────────── */
function BorderBeam() {
  return (
    <>
      <motion.div
        className="absolute top-0 inset-x-0 pointer-events-none"
        style={{ height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.90), transparent)' }}
        initial={{ x: '-100%' }}
        animate={{ x: '350%' }}
        transition={{ duration: 2.6, ease: EASE, repeat: Infinity, repeatDelay: 4 }}
      />
      <motion.div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{ height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.90), transparent)' }}
        initial={{ x: '100%' }}
        animate={{ x: '-350%' }}
        transition={{ duration: 2.6, ease: EASE, repeat: Infinity, repeatDelay: 4, delay: 1.3 }}
      />
    </>
  )
}

/* ─── SpotlightCard — 3D tilt + 600px DOM spotlight + beam ─ */
interface SpotlightCardProps {
  children:   React.ReactNode
  className?: string
  style?:     React.CSSProperties
  onClick?:   () => void
}

function SpotlightCard({ children, className = '', style, onClick }: SpotlightCardProps) {
  const ref        = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const rawX       = useMotionValue(0)
  const rawY       = useMotionValue(0)
  const rotY       = useSpring(rawX, SPRING_TILT)
  const rotX       = useSpring(rawY, SPRING_TILT)

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!ref.current || !overlayRef.current) return
    const r  = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rawX.set((px - 0.5) * 14)
    rawY.set((0.5 - py) * 14)
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    overlayRef.current.style.background =
      `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.22), transparent 40%)`
    overlayRef.current.style.opacity = '1'
  }

  function onLeave() {
    rawX.set(0)
    rawY.set(0)
    if (overlayRef.current) overlayRef.current.style.opacity = '0'
  }

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1000, ...style }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
    >
      {children}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute', inset: 0, opacity: 0,
          pointerEvents: 'none', borderRadius: 'inherit',
          transition: 'opacity 0.35s ease',
        }}
      />
      <BorderBeam />
    </motion.div>
  )
}

/* ─── Shimmer sweep ──────────────────────────────────────── */
function ShimmerSweep({ delay = 0.8 }: { delay?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.48) 50%, transparent 72%)',
          width: '55%',
        }}
        initial={{ x: '-130%' }}
        animate={{ x: '320%' }}
        transition={{ duration: 1.8, ease: EASE, delay }}
      />
    </div>
  )
}

/* ─── Greeting ───────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב'
}

/* ═══════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const { user }    = useAuth()
  const { profile } = useProfile(user?.id)

  const [events, setEvents]               = useState<Event[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeTab, setActiveTab]         = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('events')
      .select('*, host:profiles!host_id(*)')
      .eq('status', 'active')
      .gt('event_date', new Date(Date.now() - 86400000).toISOString().split('T')[0])
      .order('event_date', { ascending: true })
    if (activeTab !== 'all') q = q.eq('event_type', activeTab)
    if (search.trim())       q = q.ilike('title', `%${search.trim()}%`)
    const { data } = await q.limit(50)
    setEvents(data ?? [])
    setLoading(false)
  }, [activeTab, search])

  useEffect(() => {
    const t = setTimeout(fetchEvents, 280)
    return () => clearTimeout(t)
  }, [fetchEvents])

  const displayed = selectedRegion
    ? (() => {
        const r = REGIONS.find(x => x.name === selectedRegion)
        return r ? events.filter(e => r.cities.includes(e.city)) : events
      })()
    : events

  return (
    <div dir="rtl" className="relative min-h-dvh">

      {/* WebGL fluid mesh — position:fixed, z-index:0 */}
      <FluidCanvas />

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ══════════════════════════════════════
            HERO — watermark + editorial headline
        ══════════════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ minHeight: '46vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>

          {/* Large watermark behind copy */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            aria-hidden
          >
            <span style={{
              fontFamily:    "'Frank Ruhl Libre', serif",
              fontSize:      'clamp(110px, 42vw, 340px)',
              color:         `${TERRA}07`,
              fontWeight:    900,
              letterSpacing: '-0.04em',
              lineHeight:    1,
              whiteSpace:    'nowrap',
            }}>
              שולחן
            </span>
          </div>

          <div className="relative px-5 max-w-lg mx-auto md:max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, ease: EASE }}
              className="text-sm font-semibold mb-5"
              style={{ color: MUTED, letterSpacing: '0.01em' }}
            >
              {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
            </motion.p>

            {/* Headline with shimmer sweep */}
            <div className="relative inline-block">
              <motion.h1
                initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.62, ease: EASE, delay: 0.05 }}
                style={{
                  fontFamily:    "'Frank Ruhl Libre', serif",
                  fontSize:      'clamp(2.5rem, 9.5vw, 3.8rem)',
                  color:         TEXT,
                  fontWeight:    900,
                  letterSpacing: '-0.038em',
                  lineHeight:    1.03,
                }}
              >
                מוצאים שולחן חם<br />
                <span style={{ color: TERRA }}>לשבת ולחג</span>
              </motion.h1>
              <ShimmerSweep delay={0.9} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            FLOATING GLASS SEARCH DOCK
        ══════════════════════════════════════ */}
        <div
          className="px-5 max-w-lg mx-auto md:max-w-3xl"
          style={{ marginTop: '-3.5rem', position: 'relative', zIndex: 10 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.12 }}
          >
            <motion.div
              className="relative rounded-3xl"
              style={{ ...GLASS_HEAVY }}
              animate={{
                boxShadow: searchFocused
                  ? `0 0 0 2.5px ${TERRA}42, 0 30px 60px rgba(192,57,10,0.14), inset 0 1px 0 rgba(255,255,255,0.98)`
                  : '0 30px 60px rgba(192,57,10,0.10), inset 0 1px 0 rgba(255,255,255,0.98)',
              }}
              transition={SPRING}
            >
              <Search
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ right: '1.25rem', color: searchFocused ? TERRA : MUTED }}
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="חפש ארוחה, עיר, מארח..."
                className="w-full outline-none bg-transparent rounded-3xl text-base font-medium"
                style={{ color: TEXT, padding: '1.25rem 3.5rem 1.25rem 3.5rem' }}
                dir="rtl"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }} transition={SPRING}
                    onClick={() => setSearch('')}
                    className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ left: '1rem', background: 'rgba(28,26,23,0.07)' }}
                  >
                    <X className="w-4 h-4" style={{ color: MUTED }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pt-5 pb-14 space-y-8">

          {/* ══════════════════════════════════════
              ASYMMETRIC BENTO GRID
              Row 1: Feature card full-width (300px)
              Row 2: Live count + Geo shortcut
          ══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease: EASE, delay: 0.18 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* ── Primary Feature Card ── */}
            <Link to="/create-event" className="col-span-2 block">
              <SpotlightCard
                className="rounded-3xl"
                style={{
                  minHeight: '300px',
                  background: `linear-gradient(148deg, ${TERRA} 0%, #A9603D 55%, #6E2E17 100%)`,
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow: `0 30px 60px rgba(192,57,10,0.30), 0 6px 20px ${TERRA}28, inset 0 1px 0 rgba(255,255,255,0.22)`,
                }}
              >
                <motion.div
                  className="h-full flex flex-col justify-between p-6"
                  whileHover={{ y: -6 }}
                  transition={SPRING}
                >
                  {/* Inner backlight */}
                  <div
                    className="absolute pointer-events-none rounded-full"
                    style={{
                      width: 280, height: 280, top: -80, right: -60,
                      background: 'radial-gradient(circle, rgba(255,215,130,0.50), transparent 68%)',
                      filter: 'blur(12px)',
                    }}
                    aria-hidden
                  />
                  {/* Grain texture */}
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      opacity: 0.04,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden
                  />
                  {/* Top row */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div
                      className="rounded-2xl flex items-center justify-center"
                      style={{
                        width: 52, height: 52,
                        background: 'rgba(255,255,255,0.18)',
                        border: '1px solid rgba(255,255,255,0.30)',
                        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      <CalendarPlus className="w-6 h-6 text-white" strokeWidth={1.75} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.20em]"
                      style={{ color: 'rgba(255,255,255,0.45)' }}>
                      מארח שולחן
                    </p>
                  </div>
                  {/* Bottom: headline + CTA */}
                  <div className="relative z-10">
                    <h2 style={{
                      fontFamily:    "'Frank Ruhl Libre', serif",
                      fontSize:      'clamp(2.4rem, 7vw, 3.2rem)',
                      color:         'white',
                      fontWeight:    900,
                      letterSpacing: '-0.032em',
                      lineHeight:    1.04,
                      marginBottom:  '1.25rem',
                    }}>
                      פרסם<br />ארוחה
                    </h2>
                    <div
                      className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.16)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      <span className="text-white/80 text-sm font-bold">פתח לאורחים</span>
                      <ArrowUpRight className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                </motion.div>
              </SpotlightCard>
            </Link>

            {/* ── Live Count Card ── */}
            <SpotlightCard
              className="col-span-1 rounded-3xl"
              style={{ ...GLASS, minHeight: '170px', padding: '1.25rem' }}
            >
              <motion.div
                className="h-full flex flex-col justify-between"
                whileHover={{ y: -5 }}
                transition={SPRING}
              >
                <div
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    width: 140, height: 140, bottom: -50, left: -40,
                    background: `radial-gradient(circle, ${TERRA}18, transparent 70%)`,
                    filter: 'blur(24px)',
                  }}
                  aria-hidden
                />
                <div className="relative z-10 flex items-center gap-1.5">
                  <motion.span
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#22c55e' }}
                    animate={{ opacity: [1, 0.22, 1], scale: [1, 0.72, 1] }}
                    transition={{ repeat: Infinity, duration: 2.0 }}
                  />
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: MUTED }}>
                    עכשיו
                  </p>
                </div>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="skel"
                      className="relative z-10 h-14 w-14 rounded-2xl animate-pulse"
                      style={{ background: `${TERRA}0F` }}
                    />
                  ) : (
                    <motion.div
                      key={events.length}
                      className="relative z-10"
                      initial={{ opacity: 0, scale: 0.55 }} animate={{ opacity: 1, scale: 1 }}
                      transition={SPRING}
                    >
                      <p
                        className="font-black leading-none"
                        style={{ fontSize: 'clamp(3rem, 11vw, 4.2rem)', color: TEXT, letterSpacing: '-0.07em' }}
                      >
                        {events.length}
                      </p>
                      <p className="text-xs font-medium mt-1 leading-snug" style={{ color: MUTED }}>
                        ארוחות<br />זמינות
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </SpotlightCard>

            {/* ── Geo Shortcut Card ── */}
            <SpotlightCard
              className="col-span-1 rounded-3xl cursor-pointer"
              style={{ ...GLASS, minHeight: '170px', padding: '1.25rem', border: `1.5px solid ${OLIVE}26` }}
              onClick={() => document.getElementById('regions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <motion.div
                className="h-full flex flex-col justify-between"
                whileHover={{ y: -5 }}
                transition={SPRING}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <ChevronLeft className="w-4 h-4 mt-0.5" style={{ color: MUTED }} />
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `${OLIVE}14`, border: `1px solid ${OLIVE}28` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: OLIVE }} strokeWidth={1.75} />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold leading-tight" style={{ color: TEXT }}>גלה לפי אזור</p>
                  <p className="text-[10px] mt-1" style={{ color: MUTED }}>
                    ירושלים · גוש דן<br />הצפון · הנגב
                  </p>
                </div>
              </motion.div>
            </SpotlightCard>
          </motion.div>

          {/* ══════════════════════════════════════
              EMIL KOWALSKI FILTER TABS
              layoutId="activeFilterTab" spring pill
          ══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.46, ease: EASE }}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: MUTED }}>
              סנן לפי סוג
            </p>
            <LayoutGroup>
              <div className="flex gap-2 flex-wrap">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative px-5 py-2.5 rounded-full text-sm font-semibold"
                      style={{ color: isActive ? '#fff' : MUTED }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={SPRING}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeFilterTab"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${TERRA}, #A9603D, #6E2E17)`,
                            boxShadow: `0 4px 18px ${TERRA}45`,
                          }}
                          transition={SPRING}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </LayoutGroup>
          </motion.div>

          {/* ══════════════════════════════════════
              REGIONAL SETTLEMENT HUBS
              Horizontal bands with SpotlightCard
          ══════════════════════════════════════ */}
          <motion.div
            id="regions"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.52, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
                גלה לפי אזור
              </p>
              <AnimatePresence>
                {selectedRegion && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }} transition={SPRING}
                    onClick={() => setSelectedRegion('')}
                    className="text-[11px] font-semibold flex items-center gap-1.5"
                    style={{ color: TERRA }}
                  >
                    <X className="w-3 h-3" /> נקה
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              {REGIONS.map((r, idx) => {
                const count    = events.filter(e => r.cities.includes(e.city)).length
                const isActive = selectedRegion === r.name
                const { Icon } = r
                return (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.42, ease: EASE, delay: idx * 0.07 }}
                  >
                    <SpotlightCard
                      className="rounded-3xl w-full"
                      style={{
                        padding: '1rem 1.25rem',
                        ...(isActive ? {
                          background: `linear-gradient(135deg, ${r.color}12, rgba(255,255,255,0.72))`,
                          border: `1.5px solid ${r.color}42`,
                          boxShadow: `0 12px 36px ${r.color}1A, inset 0 1px 0 rgba(255,255,255,0.90)`,
                          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                        } : GLASS),
                      }}
                      onClick={() => setSelectedRegion(p => p === r.name ? '' : r.name)}
                    >
                      <motion.div
                        className="flex items-center gap-4 cursor-pointer"
                        whileHover={{ x: -3 }}
                        transition={SPRING}
                      >
                        {isActive && (
                          <motion.div
                            layoutId={`rAccent-${r.name}`}
                            className="absolute top-3 bottom-3 rounded-full"
                            style={{ right: 0, width: 3, background: r.color }}
                            transition={SPRING}
                          />
                        )}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive ? `${r.color}1E` : `${r.color}0E`,
                            border: `1px solid ${r.color}28`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: r.color }} strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <p
                            className="text-sm font-bold truncate"
                            style={{ color: isActive ? r.color : TEXT, letterSpacing: '-0.012em' }}
                          >
                            {r.label}
                          </p>
                          <p className="text-[10px] mt-0.5 truncate" style={{ color: MUTED }}>
                            {r.cities.slice(0, 4).join(' · ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {count > 0 && (
                            <motion.span
                              initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={SPRING}
                              className="text-[10px] font-bold rounded-full px-2.5 py-1"
                              style={{ background: `${r.color}16`, color: r.color, border: `1px solid ${r.color}28` }}
                            >
                              {count}
                            </motion.span>
                          )}
                          <ChevronLeft
                            className="w-4 h-4 transition-transform duration-300"
                            style={{
                              color: isActive ? r.color : MUTED,
                              transform: isActive ? 'rotate(180deg)' : 'none',
                            }}
                          />
                        </div>
                      </motion.div>
                    </SpotlightCard>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* ── Events list ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
                {selectedRegion ? `ארוחות — ${selectedRegion}` : 'ארוחות קרובות'}
              </p>
              {displayed.length > 0 && (
                <span
                  className="text-[10px] font-bold rounded-full px-2.5 py-1"
                  style={{ background: `${TERRA}10`, color: TERRA, border: `1px solid ${TERRA}22` }}
                >
                  {displayed.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="rounded-3xl"
                    style={{ ...GLASS, height: 112 }}
                    animate={{ opacity: [0.40, 0.85, 0.40] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: i * 0.15 }}
                  />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.44, ease: EASE }}
                className="flex flex-col items-center py-20 px-6 text-center"
              >
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ ...GLASS }}>
                  <Utensils className="w-9 h-9" style={{ color: MUTED }} strokeWidth={1.5} />
                </div>
                <h3
                  className="font-black text-xl mb-3"
                  style={{ color: TEXT, fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: '-0.018em' }}
                >
                  {search ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
                </h3>
                <p className="text-sm max-w-xs mb-8 leading-relaxed" style={{ color: MUTED }}>
                  {search ? 'נסה חיפוש אחר' : 'היה הראשון לפרסם ארוחה באזורך'}
                </p>
                <Link to="/create-event">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: `0 14px 36px ${TERRA}42` }}
                    whileTap={{ scale: 0.97 }}
                    transition={SPRING}
                    className="px-8 py-3.5 text-sm font-bold text-white rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${TERRA}, #A9603D, #6E2E17)`,
                      boxShadow: `0 4px 18px ${TERRA}30`,
                    }}
                  >
                    פרסם ארוחה ראשונה
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
                {displayed.map(ev => (
                  <motion.div key={ev.id} variants={fadeUp}>
                    <EventCard event={ev} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
