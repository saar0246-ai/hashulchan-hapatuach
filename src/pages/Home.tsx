import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, Plus, MapPin, Utensils, ChevronLeft, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import TopBar from '../components/TopBar'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30 }

// ── Palette — dark espresso, matching Landing ─────────────────
const BG     = '#141008'
const AMBER  = '#F0B044'
const TERRA  = '#C85030'
const CREAM  = '#FFF8EC'
const BODY   = 'rgba(255,240,210,0.58)'
const SURF   = 'rgba(255,248,230,0.06)'  // dark glass surface
const SURFHI = 'rgba(255,248,230,0.10)'  // hover surface

// ── Category tabs ─────────────────────────────────────────────
const TABS = [
  { id: 'all',            label: 'הכל'   },
  { id: 'shabbat_dinner', label: 'ארוחת שישי' },
  { id: 'shabbat_lunch',  label: 'ארוחת שבת'  },
  { id: 'holiday',        label: 'חג'    },
  { id: 'weekday',        label: 'חול'   },
]

// ── Region filter ─────────────────────────────────────────────
const REGIONS = [
  { name: 'ירושלים', cities: ['ירושלים','בית שמש','מעלה אדומים','מבשרת ציון'],       color: TERRA },
  { name: 'גוש דן',  cities: ['תל אביב','רמת גן','גבעתיים','בני ברק','ראשון לציון','פתח תקוה','חולון','בת ים'], color: '#3A8C5A' },
  { name: 'הצפון',   cities: ['חיפה','נהריה','עכו','טבריה','צפת','נצרת'],            color: '#2E70B0' },
  { name: 'הנגב',    cities: ['באר שבע','אשקלון','אילת','דימונה','ערד'],             color: AMBER },
]

// ── Stagger variants ──────────────────────────────────────────
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp: Variants  = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.44, ease: EASE } },
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב'
}

/* ═══════════════════════════════════════════════════════
   HOME — dark espresso
═══════════════════════════════════════════════════════ */
export default function Home() {
  const { user }    = useAuth()
  const { profile } = useProfile(user?.id)

  const [events, setEvents]       = useState<Event[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [activeRegion, setActiveRegion] = useState('')
  const [showRegions, setShowRegions] = useState(false)

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

  const displayed = (() => {
    if (!activeRegion) return events
    const r = REGIONS.find(x => x.name === activeRegion)
    return r ? events.filter(e => r.cities.includes(e.city)) : events
  })()

  return (
    <div dir="rtl" className="relative min-h-dvh" style={{ background: BG }}>

      {/* ── Ambient canvas ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
        <motion.div className="absolute rounded-full"
          style={{
            width: 900, height: 900, top: -360, right: -300,
            background: `radial-gradient(circle at 42% 40%, ${AMBER}1E 0%, ${AMBER}09 46%, transparent 68%)`,
            filter: 'blur(100px)',
          }}
          animate={{ x: [0,70,-28,0], y: [0,-60,36,0], scale: [1,1.14,0.90,1] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full"
          style={{
            width: 700, height: 700, bottom: 40, left: -260,
            background: `radial-gradient(circle at 56% 52%, ${TERRA}18 0%, ${TERRA}07 48%, transparent 70%)`,
            filter: 'blur(90px)',
          }}
          animate={{ x: [0,-50,60,0], y: [0,70,-40,0], scale: [1,0.88,1.14,1] }}
          transition={{ repeat: Infinity, duration: 36, ease: 'easeInOut', delay: 7 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ── HERO ── */}
        <div className="px-5 pt-8 pb-5 max-w-lg mx-auto md:max-w-3xl">

          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: EASE }}
            className="text-xs font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: `${AMBER}88` }}>
            {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.04 }}
            style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              fontSize: 'clamp(2rem, 7vw, 3rem)',
              color: CREAM,
              lineHeight: 1.08,
              letterSpacing: '-0.028em',
              fontWeight: 900,
              marginBottom: '1.25rem',
            }}>
            מוצאים שולחן חם<br />
            <span style={{
              background: `linear-gradient(135deg, ${AMBER} 20%, #F07830 80%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              לשבת ולחג
            </span>
          </motion.h1>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.08 }}>
            <motion.div className="relative rounded-2xl"
              animate={{
                boxShadow: searchFocused
                  ? `0 0 0 2px ${AMBER}50, 0 12px 48px rgba(240,176,68,0.12)`
                  : '0 4px 24px rgba(0,0,0,0.28)',
              }}
              style={{
                background: SURFHI,
                border: `1px solid rgba(255,215,150,0.16)`,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
              transition={SPRING}>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: `${AMBER}88` }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="חפש ארוחה, עיר, מארח..."
                className="w-full py-4 pr-11 pl-11 text-sm font-medium outline-none bg-transparent rounded-2xl"
                style={{ color: CREAM }}
                dir="rtl"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                    onClick={() => setSearch('')}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.10)' }}>
                    <X className="w-3.5 h-3.5" style={{ color: CREAM }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pb-28 space-y-5">

          {/* ── CATEGORY TABS ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, ease: EASE, delay: 0.12 }}
            className="flex gap-2 flex-wrap">
            {TABS.map(tab => {
              const active = activeTab === tab.id
              return (
                <motion.button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: active ? `linear-gradient(135deg, ${AMBER}, #D07820)` : SURF,
                    color: active ? '#1A0E04' : BODY,
                    border: active ? 'none' : '1px solid rgba(255,215,150,0.12)',
                    boxShadow: active ? `0 4px 16px ${AMBER}44` : 'none',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING}>
                  {tab.label}
                </motion.button>
              )
            })}
          </motion.div>

          {/* ── REGION FILTER ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.16 }}>
            <motion.button
              onClick={() => setShowRegions(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-full text-right"
              style={{ background: SURF, border: '1px solid rgba(255,215,150,0.12)' }}
              whileTap={{ scale: 0.98 }}>
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: activeRegion ? AMBER : BODY }} strokeWidth={1.75} />
              <span className="flex-1 text-sm font-medium" style={{ color: activeRegion ? AMBER : BODY }}>
                {activeRegion ? `אזור: ${activeRegion}` : 'סנן לפי אזור'}
              </span>
              {activeRegion && (
                <motion.button
                  onClick={e => { e.stopPropagation(); setActiveRegion('') }}
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  whileTap={{ scale: 0.9 }}>
                  <X className="w-3 h-3" style={{ color: CREAM }} />
                </motion.button>
              )}
              <motion.div animate={{ rotate: showRegions ? 180 : 0 }} transition={SPRING}>
                <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: BODY }} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showRegions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28, ease: EASE }}
                  className="overflow-hidden mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {REGIONS.map(r => (
                      <motion.button key={r.name}
                        onClick={() => { setActiveRegion(p => p === r.name ? '' : r.name); setShowRegions(false) }}
                        className="flex items-center gap-2.5 p-3 rounded-xl text-right"
                        style={{
                          background: activeRegion === r.name ? `${r.color}18` : SURF,
                          border: `1px solid ${activeRegion === r.name ? `${r.color}40` : 'rgba(255,215,150,0.10)'}`,
                        }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={SPRING}>
                        <span className="relative flex h-2 w-2 flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                            style={{ background: r.color }} />
                          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: r.color }} />
                        </span>
                        <span className="text-sm font-semibold" style={{ color: activeRegion === r.name ? r.color : CREAM }}>
                          {r.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── EVENTS ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: `${AMBER}66` }}>
                {activeRegion ? `ארוחות — ${activeRegion}` : 'ארוחות קרובות'}
              </p>
              {displayed.length > 0 && (
                <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5"
                  style={{ background: `${AMBER}16`, color: AMBER, border: `1px solid ${AMBER}30` }}>
                  {displayed.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="rounded-2xl h-28"
                    style={{ background: SURF, border: '1px solid rgba(255,215,150,0.08)' }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut', delay: i * 0.18 }} />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: SURF, border: '1px solid rgba(255,215,150,0.10)' }}>
                  <Utensils className="w-8 h-8" style={{ color: `${AMBER}66` }} strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2"
                  style={{ color: CREAM, fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: '-0.015em' }}>
                  {search ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
                </h3>
                <p className="text-sm max-w-xs mb-6" style={{ color: BODY }}>
                  {search ? 'נסה חיפוש אחר' : 'היה הראשון לפרסם ארוחה באזורך'}
                </p>
                <Link to="/create-event">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: `0 12px 36px ${AMBER}44` }}
                    whileTap={{ scale: 0.96 }} transition={SPRING}
                    className="px-7 py-3 text-sm font-bold rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${AMBER}, #D07820)`, color: '#1A0E04' }}>
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

          {/* ── REGION EXPLORER — bottom shortcut ── */}
          {!activeRegion && !loading && displayed.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="grid grid-cols-2 gap-2 pt-2">
              {REGIONS.map((r, i) => {
                const count = events.filter(e => r.cities.includes(e.city)).length
                if (count === 0) return null
                return (
                  <motion.button key={r.name}
                    onClick={() => setActiveRegion(r.name)}
                    className="flex items-center gap-2.5 p-3 rounded-xl text-right"
                    style={{ background: SURF, border: `1px solid ${r.color}22` }}
                    whileHover={{ background: `${r.color}12`, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={SPRING}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06, ease: EASE, duration: 0.4 } }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color, boxShadow: `0 0 6px ${r.color}80` }} />
                    <span className="flex-1 text-xs font-semibold" style={{ color: CREAM }}>{r.name}</span>
                    <span className="text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: `${r.color}18`, color: r.color }}>
                      {count}
                    </span>
                    <ChevronLeft className="w-3.5 h-3.5" style={{ color: BODY }} />
                  </motion.button>
                )
              })}
            </motion.div>
          )}

        </div>
      </div>

      {/* ── FLOATING CREATE BUTTON ── */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING, delay: 0.5 }}>
        <Link to="/create-event">
          <motion.button
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${AMBER} 0%, #D07820 100%)`,
              color: '#1A0E04',
              boxShadow: `0 8px 32px ${AMBER}50, 0 2px 8px rgba(0,0,0,0.4)`,
            }}
            whileHover={{ scale: 1.06, boxShadow: `0 14px 48px ${AMBER}60` }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            פרסם ארוחה
          </motion.button>
        </Link>
      </motion.div>

    </div>
  )
}
