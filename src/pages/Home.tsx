import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, X, CalendarPlus, MapPin, ChevronLeft, Utensils,
  Moon, Sun, Star, Flame,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup, type Variants } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import TopBar from '../components/TopBar'

// ── Emil Kowalski spring physics ──────────────────────────────
type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 350, damping: 25 }

// ── Palette lock — warm Mediterranean cream ───────────────────
const BG     = '#FDFBF7'
const TERRA  = '#C0390A'
const OLIVE  = '#2D4A1E'
const TEXT   = '#1C1A17'
const MUTED  = '#786C63'
const BORDER = '#E8E2D8'

// ── Glassmorphism surface ─────────────────────────────────────
const GLASS = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: `1px solid rgba(255,255,255,0.82)`,
  boxShadow: '0 8px 32px rgba(44,24,8,0.06), inset 0 1px 0 rgba(255,255,255,0.92)',
} as const

// ── Category tabs ─────────────────────────────────────────────
const TABS = [
  { id: 'all',            label: 'הכל'         },
  { id: 'shabbat_dinner', label: 'ארוחות שישי'  },
  { id: 'shabbat_lunch',  label: 'ארוחות שבת'   },
  { id: 'holiday',        label: 'חגים'         },
  { id: 'weekday',        label: 'חול'          },
]

// ── Regional settlement explorer ──────────────────────────────
interface Region { name: string; label: string; color: string; cities: string[]; Icon: LucideIcon }
const REGIONS: Region[] = [
  {
    name: 'ירושלים', label: 'ירושלים והסביבה', color: TERRA, Icon: Moon,
    cities: ['ירושלים','בית שמש','מעלה אדומים','מבשרת ציון','גבעת זאב'],
  },
  {
    name: 'גוש דן', label: 'גוש דן ותל אביב', color: OLIVE, Icon: Sun,
    cities: ['תל אביב','רמת גן','גבעתיים','בני ברק','ראשון לציון','פתח תקוה','חולון','בת ים','אשדוד','נתניה'],
  },
  {
    name: 'הצפון', label: 'חיפה והצפון', color: '#1E5A8A', Icon: Star,
    cities: ['חיפה','נהריה','עכו','טבריה','צפת','נצרת','קריית שמונה'],
  },
  {
    name: 'הנגב', label: 'באר שבע והנגב', color: '#8F5A0A', Icon: Flame,
    cities: ['באר שבע','אשקלון','אילת','דימונה','ערד','נתיבות'],
  },
]

// ── Stagger variants ──────────────────────────────────────────
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.44, ease: EASE } },
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב'
}

/* ═══════════════════════════════════════════════════════════
   HOME — Warm Mediterranean Luxury
   4 sections: Hero/Search · Bento Grid · Sliding Tabs · Geo Explorer
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const { user }    = useAuth()
  const { profile } = useProfile(user?.id)
  const [events, setEvents]             = useState<Event[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeTab, setActiveTab]       = useState('all')
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
    <div dir="rtl" className="relative min-h-dvh" style={{ background: BG }}>

      {/* ════════════════════════════════════════════════════
          SECTION 4: AMBIENT ANIMATED BACKGROUND
          Multi-point floating gradient orbs — ultra-blurred
      ════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>

        {/* Terracotta — top-right, 12% opacity */}
        <motion.div className="absolute rounded-full"
          style={{
            width: 960, height: 960, top: -380, right: -360,
            background: `radial-gradient(circle at 40% 38%, ${TERRA}1F 0%, ${TERRA}0A 44%, transparent 68%)`,
            filter: 'blur(120px)',
          }}
          animate={{ x: [0, 72, -28, 0], y: [0, -64, 38, 0], scale: [1, 1.16, 0.88, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut' }}
        />

        {/* Olive/Carmel Green — bottom-left, 8% opacity */}
        <motion.div className="absolute rounded-full"
          style={{
            width: 720, height: 720, bottom: 20, left: -280,
            background: `radial-gradient(circle at 56% 52%, ${OLIVE}14 0%, ${OLIVE}07 48%, transparent 70%)`,
            filter: 'blur(120px)',
          }}
          animate={{ x: [0, -58, 68, 0], y: [0, 76, -44, 0], scale: [1, 0.87, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 36, ease: 'easeInOut', delay: 7 }}
        />

        {/* Warm amber — mid canvas */}
        <motion.div className="absolute rounded-full"
          style={{
            width: 560, height: 560, top: '42%', left: '18%',
            background: 'radial-gradient(circle at 50% 50%, rgba(220,150,55,0.13) 0%, transparent 68%)',
            filter: 'blur(100px)',
          }}
          animate={{ x: [0, 46, -32, 0], y: [0, -40, 58, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ════════════════════════════════════════════════════
            SECTION 1: EDITORIAL HERO + FLOATING GLASS SEARCH
        ════════════════════════════════════════════════════ */}
        <div className="px-5 pt-9 pb-6 max-w-lg mx-auto md:max-w-3xl">

          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: EASE }}
            className="text-sm font-semibold mb-3"
            style={{ color: MUTED, letterSpacing: '0.01em' }}>
            {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease: EASE, delay: 0.04 }}
            className="font-black leading-[1.06]"
            style={{
              color: TEXT,
              fontSize: 'clamp(1.90rem, 6.5vw, 2.65rem)',
              letterSpacing: '-0.032em',
              marginBottom: '1.25rem',
              fontFamily: "'Frank Ruhl Libre', serif",
            }}>
            מוצאים שולחן חם<br />
            <span style={{ color: TERRA }}>לשבת ולחג</span>
          </motion.h1>

          {/* Floating Glassmorphism Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.50, ease: EASE, delay: 0.10 }}>
            <motion.div
              className="relative rounded-2xl"
              animate={{
                boxShadow: searchFocused
                  ? `0 0 0 2.5px ${TERRA}42, 0 20px 50px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.96)`
                  : '0 20px 50px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.96)',
              }}
              style={{
                background: 'rgba(255,255,255,0.60)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.80)',
              }}
              transition={SPRING}>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: MUTED }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="חפש ארוחה, עיר, מארח..."
                className="w-full py-4 pr-11 pl-11 text-sm font-medium outline-none bg-transparent rounded-2xl"
                style={{ color: TEXT }}
                dir="rtl"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                    onClick={() => setSearch('')}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(28,26,23,0.07)' }}>
                    <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pb-12 space-y-5">

          {/* ════════════════════════════════════════════════
              SECTION 2: 21st.dev BENTO GRID
              Card A: Terracotta Feature  |  Card B: Live Activity
              Card C: Quick Region Shortcut
          ════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.14 }}
            className="space-y-3">

            <div className="grid grid-cols-5 gap-3" style={{ gridTemplateRows: '164px' }}>

              {/* ── Card A: Rich gradient terracotta feature ── */}
              <Link to="/create-event" className="col-span-3 block">
                <motion.div
                  className="h-full rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background: `linear-gradient(148deg, ${TERRA} 0%, #8F4222 100%)`,
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: `0 12px 44px ${TERRA}38, 0 4px 14px ${TERRA}20, inset 0 1px 0 rgba(255,255,255,0.16)`,
                  }}
                  whileHover={{ y: -6, scale: 1.015, boxShadow: `0 28px 72px ${TERRA}4A, 0 8px 20px ${TERRA}30` }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}>

                  {/* Inner backlight glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,200,100,0.55), transparent 68%)', filter: 'blur(6px)' }} aria-hidden />
                  <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.24), transparent)' }} aria-hidden />

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center relative z-10"
                    style={{ background: 'rgba(255,255,255,0.20)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                    <CalendarPlus className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>

                  <div className="relative z-10">
                    <p className="text-white/55 text-[10px] font-bold uppercase tracking-[0.16em] mb-1">מארח שולחן</p>
                    <p className="text-white font-black text-[1.22rem] leading-tight"
                      style={{ fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: '-0.024em' }}>
                      פרסם<br />ארוחה
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-white/65 text-xs font-semibold">התחל עכשיו</span>
                      <ChevronLeft className="w-3 h-3 text-white/65" />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* ── Card B: Live activity glass card ── */}
              <motion.div
                className="col-span-2 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                style={{ ...GLASS }}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={SPRING}>
                <div className="flex items-center gap-1.5">
                  <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#22c55e' }}
                    animate={{ opacity: [1, 0.20, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>עכשיו</p>
                </div>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="skel"
                      className="h-12 w-12 rounded-xl animate-pulse"
                      style={{ background: `${TERRA}0F` }} />
                  ) : (
                    <motion.div key={events.length}
                      initial={{ opacity: 0, scale: 0.68 }} animate={{ opacity: 1, scale: 1 }}
                      transition={SPRING}>
                      <p className="font-black text-[2.7rem] leading-none"
                        style={{ color: TEXT, letterSpacing: '-0.06em' }}>
                        {events.length}
                      </p>
                      <p className="text-[10px] font-medium mt-0.5 leading-snug" style={{ color: MUTED }}>
                        ארוחות<br />זמינות
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── Card C: Quick region shortcut with olive-green accent ── */}
            <motion.button
              className="w-full rounded-2xl p-4 flex items-center gap-3 text-right"
              style={{ ...GLASS }}
              whileHover={{ y: -3, scale: 1.005 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING}
              onClick={() => document.getElementById('regions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${OLIVE}12`, border: `1px solid ${OLIVE}22`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                <MapPin className="w-4 h-4" style={{ color: OLIVE }} strokeWidth={1.75} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs font-bold" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
                  גלה לפי אזור
                </p>
                <p className="text-[10px]" style={{ color: MUTED }}>
                  ירושלים · גוש דן · הצפון · הנגב
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {[TERRA, OLIVE, '#1E5A8A', '#8F5A0A'].map((c, i) => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{ background: c, boxShadow: `0 0 4px ${c}80` }} />
                ))}
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" style={{ color: MUTED }} />
              </div>
            </motion.button>
          </motion.div>

          {/* ════════════════════════════════════════════════
              SECTION 3A: SLIDING CATEGORY TABS
              Emil Kowalski layoutId="activeFilterTab" sliding indicator
          ════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.46, ease: EASE }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3"
              style={{ color: MUTED }}>
              סנן לפי סוג
            </p>

            {/* LayoutGroup creates the shared animation context */}
            <LayoutGroup>
              <div className="flex gap-1.5 flex-wrap">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative px-4 py-2 rounded-full text-sm font-semibold"
                      style={{ color: isActive ? '#fff' : MUTED }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}>
                      {isActive && (
                        /* layoutId makes this pill slide physically between tabs */
                        <motion.span
                          layoutId="activeFilterTab"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: TERRA,
                            boxShadow: `0 4px 16px ${TERRA}40`,
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

          {/* ════════════════════════════════════════════════
              SECTION 3B: INTERACTIVE GEOGRAPHIC EXPLORER
              Israeli hosting hubs with glassmorphic surfaces
              and warm hover elevation
          ════════════════════════════════════════════════ */}
          <motion.div id="regions"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.52, ease: EASE }}>

            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                גלה לפי אזור
              </p>
              <AnimatePresence>
                {selectedRegion && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }} transition={SPRING}
                    onClick={() => setSelectedRegion('')}
                    className="text-[11px] font-semibold flex items-center gap-1"
                    style={{ color: TERRA }}>
                    <X className="w-3 h-3" /> נקה
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <LayoutGroup id="geo-regions">
              <div className="grid grid-cols-2 gap-2.5">
                {REGIONS.map(r => {
                  const count    = events.filter(e => r.cities.includes(e.city)).length
                  const isActive = selectedRegion === r.name
                  const { Icon } = r
                  return (
                    <motion.button
                      key={r.name}
                      onClick={() => setSelectedRegion(p => p === r.name ? '' : r.name)}
                      className="relative flex flex-col gap-2.5 p-4 rounded-2xl text-right"
                      style={isActive ? {
                        ...GLASS,
                        background: `linear-gradient(148deg, ${r.color}0E, rgba(255,255,255,0.75))`,
                        border: `1.5px solid ${r.color}36`,
                        boxShadow: `0 14px 48px ${r.color}18, 0 4px 14px rgba(44,24,8,0.06), inset 0 1px 0 rgba(255,255,255,0.92)`,
                      } : {
                        ...GLASS,
                        border: `1px solid ${BORDER}`,
                      }}
                      whileHover={{ y: -6, scale: 1.015 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}>

                      {/* Subtle top accent bar on active */}
                      {isActive && (
                        <motion.div
                          layoutId={`regionAccent-${r.name}`}
                          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                          style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}55)` }}
                          transition={SPRING}
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: `${r.color}12`, border: `1px solid ${r.color}20`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                          <Icon className="w-4 h-4" style={{ color: r.color }} strokeWidth={1.75} />
                        </div>
                        <AnimatePresence>
                          {count > 0 && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                              className="text-[10px] font-bold rounded-full px-2 py-0.5"
                              style={{ background: `${r.color}14`, color: r.color, border: `1px solid ${r.color}26` }}>
                              {count}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <p className="text-xs font-bold leading-snug"
                          style={{ color: isActive ? r.color : TEXT, letterSpacing: '-0.01em' }}>
                          {r.label}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                          {count > 0 ? `${count} ארוחות` : 'ממתין לפעילות'}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </LayoutGroup>
          </motion.div>

          {/* ── EVENTS LIST ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                {selectedRegion ? `ארוחות — ${selectedRegion}` : 'ארוחות קרובות'}
              </p>
              {displayed.length > 0 && (
                <span className="text-[10px] font-bold rounded-full px-2 py-0.5"
                  style={{ background: `${TERRA}10`, color: TERRA, border: `1px solid ${TERRA}20` }}>
                  {displayed.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="rounded-2xl h-28"
                    style={{ ...GLASS }}
                    animate={{ opacity: [0.40, 0.85, 0.40] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: i * 0.15 }} />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: EASE }}
                className="flex flex-col items-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ ...GLASS }}>
                  <Utensils className="w-8 h-8" style={{ color: MUTED }} strokeWidth={1.5} />
                </div>
                <h3 className="font-black text-lg mb-2"
                  style={{ color: TEXT, fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: '-0.015em' }}>
                  {search ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
                </h3>
                <p className="text-sm max-w-xs mb-6" style={{ color: MUTED }}>
                  {search ? 'נסה חיפוש אחר' : 'היה הראשון לפרסם ארוחה באזורך'}
                </p>
                <Link to="/create-event">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: `0 12px 32px ${TERRA}38` }}
                    whileTap={{ scale: 0.97 }} transition={SPRING}
                    className="px-6 py-2.5 text-sm font-bold text-white rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${TERRA}, #8F4222)`,
                      boxShadow: `0 4px 16px ${TERRA}28`,
                    }}>
                    פרסם ארוחה
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
