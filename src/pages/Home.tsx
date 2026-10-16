import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, X, CalendarPlus, ArrowLeft,
  MapPin, Moon, Sun, Star, Utensils, ChevronLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup, type Variants } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import TopBar from '../components/TopBar'

// ── Motion primitives ────────────────────────────────────────
type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 420, damping: 30 }

// ── Design Tokens ────────────────────────────────────────────
const ACCENT  = '#C0390A'
const FOREST  = '#2D4A1E'
const TEXT    = '#1C1A17'
const MUTED   = '#8A6650'

// Warm-tinted glass surface — replaces the cold white/40 default
function S(opacity = 0.70) {
  return {
    background: `rgba(255,248,240,${opacity})`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,210,170,0.48)',
    boxShadow: '0 8px 32px rgba(28,12,4,0.07), inset 0 1px 0 rgba(255,255,255,0.88)',
  } as const
}

// ── Regions ──────────────────────────────────────────────────
interface Region { name: string; label: string; cities: string[]; color: string; Icon: LucideIcon }
const REGIONS: Region[] = [
  { name: 'ירושלים', label: 'ירושלים והסביבה', color: ACCENT,    Icon: Moon,
    cities: ['ירושלים','בית שמש','מעלה אדומים','מבשרת ציון','גבעת זאב'] },
  { name: 'גוש דן',  label: 'גוש דן ותל אביב', color: FOREST,    Icon: Sun,
    cities: ['תל אביב','רמת גן','גבעתיים','בני ברק','ראשון לציון','פתח תקוה','חולון','בת ים','אשדוד','נתניה'] },
  { name: 'הצפון',   label: 'חיפה והצפון',      color: '#1E5A8A', Icon: Star,
    cities: ['חיפה','נהריה','עכו','טבריה','צפת','נצרת','קריית שמונה'] },
  { name: 'הנגב',    label: 'באר שבע והנגב',     color: '#8F5A0A', Icon: Utensils,
    cities: ['באר שבע','אשקלון','אילת','דימונה','ערד','נתיבות'] },
]
const REGION_COLORS = REGIONS.map(r => r.color)

// ── Category tabs ────────────────────────────────────────────
const TABS = [
  { id: 'all',            label: 'הכל'   },
  { id: 'shabbat_dinner', label: 'שישי'  },
  { id: 'shabbat_lunch',  label: 'שבת'   },
  { id: 'holiday',        label: 'חג'    },
  { id: 'weekday',        label: 'רגיל'  },
]

// ── Variants ─────────────────────────────────────────────────
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp:  Variants = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.46, ease: EASE } },
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב'
}

/* ═══════════════════════════════════════════════════
   HOME  —  draft-2
═══════════════════════════════════════════════════ */
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
    let q = supabase.from('events').select('*, host:profiles!host_id(*)')
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
    const t = setTimeout(fetchEvents, 300)
    return () => clearTimeout(t)
  }, [fetchEvents])

  const displayedEvents = selectedRegion
    ? (() => {
        const r = REGIONS.find(x => x.name === selectedRegion)
        return r ? events.filter(e => r.cities.includes(e.city)) : events
      })()
    : events

  return (
    <div dir="rtl" className="relative min-h-dvh"
      style={{ background: '#FFF3E0' }}>

      {/* ── Ambient canvas: three drifting colour spheres ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        {/* terracotta — top-right */}
        <motion.div className="absolute rounded-full"
          style={{ width: 960, height: 960, top: -380, right: -380,
            background: `radial-gradient(circle at 40% 38%, ${ACCENT}26 0%, ${ACCENT}0C 44%, transparent 68%)`,
            filter: 'blur(120px)' }}
          animate={{ x: [0, 80, -30, 0], y: [0, -70, 40, 0], scale: [1, 1.16, 0.88, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut' }}
        />
        {/* forest green — bottom-left */}
        <motion.div className="absolute rounded-full"
          style={{ width: 720, height: 720, bottom: 20, left: -280,
            background: `radial-gradient(circle at 56% 52%, ${FOREST}1C 0%, ${FOREST}08 48%, transparent 70%)`,
            filter: 'blur(120px)' }}
          animate={{ x: [0, -60, 72, 0], y: [0, 80, -48, 0], scale: [1, 0.86, 1.16, 1] }}
          transition={{ repeat: Infinity, duration: 36, ease: 'easeInOut', delay: 7 }}
        />
        {/* amber — mid */}
        <motion.div className="absolute rounded-full"
          style={{ width: 520, height: 520, top: '42%', left: '20%',
            background: 'radial-gradient(circle at 50% 50%, rgba(240,160,60,0.18) 0%, transparent 68%)',
            filter: 'blur(90px)' }}
          animate={{ x: [0, 50, -28, 0], y: [0, -40, 60, 0], scale: [1, 1.14, 0.92, 1] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ── Hero ── */}
        <div className="px-5 pt-9 pb-6 max-w-lg mx-auto md:max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: EASE }}
            className="text-sm font-semibold mb-2.5"
            style={{ color: MUTED, letterSpacing: '0.01em' }}>
            {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease: EASE, delay: 0.04 }}
            className="font-display font-black leading-[1.08]"
            style={{ color: TEXT, fontSize: 'clamp(1.80rem, 6vw, 2.40rem)', letterSpacing: '-0.032em' }}>
            מוצאים שולחן חם<br />
            <span style={{ color: ACCENT }}>לשבת ולחג</span>
          </motion.h1>

          {/* Floating search dock */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.10 }}
            className="mt-5">
            <motion.div
              className="relative rounded-2xl"
              animate={{
                boxShadow: searchFocused
                  ? `0 0 0 2.5px ${ACCENT}4A, 0 14px 52px rgba(192,57,10,0.14), inset 0 1px 0 rgba(255,255,255,0.96)`
                  : '0 8px 32px rgba(28,12,4,0.09), inset 0 1px 0 rgba(255,255,255,0.96)',
              }}
              style={{
                background: 'rgba(255,251,246,0.90)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,215,175,0.65)',
              }}
              transition={SPRING}>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: MUTED }} />
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
                    style={{ background: 'rgba(120,90,60,0.12)' }}>
                    <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pb-12 space-y-5">

          {/* ── BENTO GRID ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.12 }}
            className="space-y-3">

            <div className="grid grid-cols-5 gap-3" style={{ gridTemplateRows: '156px' }}>

              {/* Create card — deep terracotta */}
              <Link to="/create-event" className="col-span-3 block">
                <motion.div
                  className="h-full rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background: `linear-gradient(148deg, ${ACCENT} 0%, #8F2808 100%)`,
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: `0 12px 44px ${ACCENT}40, 0 4px 14px ${ACCENT}22, inset 0 1px 0 rgba(255,255,255,0.16)`,
                  }}
                  whileHover={{ y: -5, scale: 1.015, boxShadow: `0 28px 72px ${ACCENT}50, 0 8px 20px ${ACCENT}30, inset 0 1px 0 rgba(255,255,255,0.22)` }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}>
                  {/* inner backlight */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,180,100,0.55), transparent 68%)', filter: 'blur(4px)' }} aria-hidden />
                  <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.24), transparent)' }} aria-hidden />

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center relative z-10"
                    style={{ background: 'rgba(255,255,255,0.20)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                    <CalendarPlus className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>

                  <div className="relative z-10">
                    <p className="text-white/55 text-[10px] font-bold uppercase tracking-[0.16em] mb-1">מארח שולחן</p>
                    <p className="text-white font-black text-[1.22rem] leading-tight font-display" style={{ letterSpacing: '-0.024em' }}>
                      פרסם<br />ארוחה
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-white/65 text-xs font-semibold">התחל עכשיו</span>
                      <ArrowLeft className="w-3 h-3 text-white/65" />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Live stats card */}
              <motion.div
                className="col-span-2 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                style={{ ...S(0.72) }}
                whileHover={{ y: -5, scale: 1.015 }}
                transition={SPRING}>
                <div className="flex items-center gap-1.5">
                  <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e' }}
                    animate={{ opacity: [1, 0.20, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>עכשיו</p>
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="skel" className="h-10 w-10 rounded-xl animate-pulse"
                      style={{ background: `${ACCENT}0F` }} />
                  ) : (
                    <motion.div key={events.length}
                      initial={{ opacity: 0, scale: 0.68 }} animate={{ opacity: 1, scale: 1 }}
                      transition={SPRING}>
                      <p className="font-black text-[2.5rem] leading-none" style={{ color: TEXT, letterSpacing: '-0.06em' }}>
                        {events.length}
                      </p>
                      <p className="text-[10px] font-medium mt-1 leading-snug" style={{ color: MUTED }}>
                        ארוחות<br />זמינות
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Geo shortcut */}
            <motion.button
              className="w-full rounded-2xl p-4 flex items-center gap-3 text-right"
              style={{ ...S(0.65) }}
              whileHover={{ y: -2, scale: 1.005 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING}
              onClick={() => document.getElementById('regions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}22`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                <MapPin className="w-4 h-4" style={{ color: ACCENT }} strokeWidth={1.75} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs font-bold" style={{ color: TEXT, letterSpacing: '-0.01em' }}>גלה לפי אזור</p>
                <p className="text-[10px]" style={{ color: MUTED }}>ירושלים · גוש דן · הצפון · הנגב</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {REGION_COLORS.map((c, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 5px ${c}80` }} />
                ))}
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" style={{ color: MUTED }} />
              </div>
            </motion.button>
          </motion.div>

          {/* ── CATEGORY TABS — animated sliding pill ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.48, ease: EASE }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: MUTED }}>סנן לפי סוג</p>
            <LayoutGroup>
              <div className="flex gap-2 flex-wrap">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative px-4 py-2 rounded-full text-sm font-semibold"
                      style={{ color: isActive ? '#fff' : MUTED }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={SPRING}>
                      {isActive && (
                        <motion.span
                          layoutId="draft2ActiveTab"
                          className="absolute inset-0 rounded-full"
                          style={{ background: ACCENT, boxShadow: `0 4px 18px ${ACCENT}40` }}
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

          {/* ── REGIONAL EXPLORER ── */}
          <motion.div id="regions"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.54, ease: EASE }}>

            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>גלה לפי אזור</p>
              <AnimatePresence>
                {selectedRegion && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }} transition={SPRING}
                    onClick={() => setSelectedRegion('')}
                    className="text-[11px] font-semibold flex items-center gap-1"
                    style={{ color: ACCENT }}>
                    <X className="w-3 h-3" /> נקה
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <LayoutGroup id="regions-lg">
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
                        background: `linear-gradient(148deg, ${r.color}12, rgba(255,248,240,0.75))`,
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: `1.5px solid ${r.color}40`,
                        boxShadow: `0 14px 48px ${r.color}20, 0 4px 14px rgba(28,12,4,0.06), inset 0 1px 0 rgba(255,255,255,0.90)`,
                      } : { ...S(0.60) }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}>

                      {isActive && (
                        <motion.div layoutId={`regionBar-${r.name}`}
                          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                          style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}60)` }}
                          transition={SPRING} />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: `${r.color}14`, border: `1px solid ${r.color}22`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                          <Icon className="w-4 h-4" style={{ color: r.color }} strokeWidth={1.75} />
                        </div>
                        <AnimatePresence>
                          {count > 0 && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                              className="text-[10px] font-bold rounded-full px-2 py-0.5"
                              style={{ background: `${r.color}16`, color: r.color, border: `1px solid ${r.color}28` }}>
                              {count}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <p className="text-xs font-bold leading-snug"
                          style={{ color: isActive ? r.color : TEXT, letterSpacing: '-0.01em' }}>{r.label}</p>
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
              {displayedEvents.length > 0 && (
                <span className="text-[10px] font-bold rounded-full px-2 py-0.5"
                  style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}22` }}>
                  {displayedEvents.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="rounded-2xl h-24"
                    style={{ ...S(0.52) }}
                    animate={{ opacity: [0.35, 0.85, 0.35] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: i * 0.15 }} />
                ))}
              </div>
            ) : displayedEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: EASE }}
                className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ ...S(0.65) }}>
                  <Utensils className="w-8 h-8" style={{ color: MUTED }} strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2"
                  style={{ color: TEXT, letterSpacing: '-0.015em' }}>
                  {search ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
                </h3>
                <p className="text-sm max-w-xs mb-6" style={{ color: MUTED }}>
                  {search ? 'נסה חיפוש אחר' : 'היה הראשון לפרסם ארוחה באזורך'}
                </p>
                <Link to="/create-event">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: `0 12px 32px ${ACCENT}38` }}
                    whileTap={{ scale: 0.97 }} transition={SPRING}
                    className="px-6 py-2.5 text-sm font-bold text-white rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, #8F2808)`, boxShadow: `0 4px 16px ${ACCENT}28` }}>
                    פרסם ארוחה
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
                {displayedEvents.map(event => (
                  <motion.div key={event.id} variants={fadeUp}>
                    <EventCard event={event} />
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
