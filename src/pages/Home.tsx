import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Search, X, CalendarPlus, MapPin,
  Moon, Sun, Star, Flame, ArrowLeft, Users,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import TopBar from '../components/TopBar'

const SPRING = { type: 'spring' as const, stiffness: 350, damping: 22 }
const EASE   = [0.22, 1, 0.36, 1] as const

const TERRA = '#C0390A'
const OLIVE = '#2D4A1E'
const TEXT  = '#1C1A17'
const MUTED = '#786C63'

const TABS = [
  { id: 'all',            label: 'הכל'        },
  { id: 'shabbat_dinner', label: 'ארוחות שישי' },
  { id: 'shabbat_lunch',  label: 'שבת'         },
  { id: 'holiday',        label: 'חג'          },
  { id: 'weekday',        label: 'חול'         },
]

const REGIONS = [
  { id: 'jerusalem', label: 'ירושלים',        color: TERRA,     Icon: Moon,  cities: ['ירושלים','בית שמש','מעלה אדומים','מבשרת ציון','גבעת זאב'] },
  { id: 'gush_dan',  label: 'תל אביב',        color: OLIVE,     Icon: Sun,   cities: ['תל אביב','רמת גן','גבעתיים','בני ברק','ראשון לציון','פתח תקוה','חולון','בת ים','אשדוד','נתניה'] },
  { id: 'north',     label: 'הצפון',          color: '#1E5A8A', Icon: Star,  cities: ['חיפה','נהריה','עכו','טבריה','צפת','נצרת','קריית שמונה'] },
  { id: 'negev',     label: 'דימונה והנגב',   color: '#8F5A0A', Icon: Flame, cities: ['באר שבע','אשקלון','אילת','דימונה','ערד','נתיבות'] },
]

export default function Home() {
  const { user }    = useAuth()
  const { profile } = useProfile(user?.id)

  const [events, setEvents]                 = useState<Event[]>([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [searchFocused, setSearchFocused]   = useState(false)
  const [activeTab, setActiveTab]           = useState('all')
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

  const region      = REGIONS.find(r => r.id === selectedRegion)
  const displayed   = region
    ? events.filter(e => region.cities.includes(e.city as typeof region.cities[number]))
    : events

  return (
    <div dir="rtl" className="min-h-dvh bg-[#FDFBF7] text-[#1C1A17] overflow-x-hidden">
      <TopBar logo />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative px-5 pt-10 pb-8 max-w-2xl mx-auto md:max-w-4xl">

        {/* Ambient orb — top right */}
        <div
          className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(192,57,10,0.13), transparent 65%)',
            zIndex: 0,
          }}
        />
        {/* Second orb — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-[320px] h-[320px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at bottom left, rgba(45,74,30,0.09), transparent 65%)',
            zIndex: 0,
          }}
        />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: EASE }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 bg-white/80 backdrop-blur-md border border-[#E8E2D8] shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#C0390A] animate-pulse" />
            <span className="text-[11px] font-bold text-[#8F4222] tracking-wide">
              {profile?.display_name ? `שלום ${profile.display_name} ·` : ''} שולחן פתוח
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.06 }}
            className="font-black leading-[0.94] mb-5"
            style={{
              fontFamily:    "'Frank Ruhl Libre', serif",
              fontSize:      'clamp(2.8rem, 10vw, 5rem)',
              color:         TEXT,
              letterSpacing: '-0.04em',
            }}
          >
            מוצאים שולחן חם<br />
            <span style={{ color: TERRA }}>לשבת ולחג</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
            className="text-base leading-relaxed max-w-sm mb-8"
            style={{ color: MUTED }}
          >
            פלטפורמה מחברת בין מארחים לאורחים לארוחות שבת, חגים ומפגשים ברחבי הארץ.
          </motion.p>

          {/* ── FLOATING GLASS SEARCH BAR ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.22 }}
            className="flex items-center gap-2 rounded-2xl p-2 bg-white/80 backdrop-blur-xl border border-[#E8E2D8]"
            style={{
              boxShadow: searchFocused
                ? `0 0 0 2px ${TERRA}40, 0 20px 40px rgba(192,57,10,0.08)`
                : '0 20px 40px rgba(192,57,10,0.06)',
              transition: 'box-shadow 0.25s ease',
            }}
          >
            <Search className="w-5 h-5 flex-shrink-0 mr-1" style={{ color: searchFocused ? TERRA : MUTED }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="חפש ארוחה, עיר, מארח..."
              className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-[#9E958C]"
              style={{ color: TEXT }}
              dir="rtl"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }} transition={SPRING}
                  onClick={() => setSearch('')}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5"
                >
                  <X className="w-4 h-4" style={{ color: MUTED }} />
                </motion.button>
              )}
            </AnimatePresence>
            <button
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: TERRA,
                boxShadow: `0 4px 14px ${TERRA}40`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#A33008')}
              onMouseLeave={e => (e.currentTarget.style.background = TERRA)}
            >
              חפש
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── ASYMMETRIC BENTO GRID ────────────────── */}
      <section className="px-5 max-w-2xl mx-auto md:max-w-4xl mb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.28 }}
          className="flex flex-col md:flex-row gap-4"
        >

          {/* Card A — Main CTA, 60% */}
          <Link to="/create-event" className="md:flex-[3] block">
            <motion.div
              whileHover={{ y: -5, scale: 1.01 }}
              transition={SPRING}
              className="relative overflow-hidden rounded-3xl h-full min-h-[260px] flex flex-col justify-between p-7"
              style={{
                background: `linear-gradient(148deg, ${TERRA} 0%, #8A2504 100%)`,
                boxShadow: '0 30px 70px rgba(192,57,10,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              {/* Backlight */}
              <div
                className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,215,130,0.45), transparent 60%)', filter: 'blur(8px)' }}
              />
              {/* Grain */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)', backdropFilter: 'blur(8px)' }}
                >
                  <CalendarPlus className="w-6 h-6 text-white" strokeWidth={1.75} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  מארח שולחן
                </span>
              </div>

              <div className="relative z-10">
                <h2
                  className="font-black leading-[0.96] mb-4"
                  style={{
                    fontFamily: "'Frank Ruhl Libre', serif",
                    fontSize: 'clamp(2.2rem, 7vw, 3rem)',
                    color: 'white',
                    letterSpacing: '-0.034em',
                  }}
                >
                  מארחים<br />בשבת?
                </h2>
                <div
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span className="text-sm font-bold text-white/90">פרסום ארוחה</span>
                  <ArrowLeft className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card B — Live Stats, 40% */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={SPRING}
            className="md:flex-[2] rounded-3xl p-6 flex flex-col justify-between min-h-[180px] md:min-h-[260px]"
            style={{
              background: 'rgba(255,255,255,0.70)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.90)',
              boxShadow: '0 20px 50px rgba(192,57,10,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
            }}
          >
            <div className="flex items-center gap-2">
              <motion.span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              />
              <span className="text-xs font-bold" style={{ color: OLIVE }}>פעילות חיה</span>
            </div>

            <div>
              <p
                className="font-black leading-none mb-1"
                style={{ fontSize: 'clamp(3rem, 12vw, 4.5rem)', color: TEXT, letterSpacing: '-0.07em' }}
              >
                {loading ? <span className="animate-pulse text-4xl" style={{ color: `${TERRA}40` }}>—</span> : events.length}
              </p>
              <p className="text-sm font-semibold" style={{ color: MUTED }}>ארוחות פתוחות</p>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" style={{ color: MUTED }} />
              <span className="text-xs" style={{ color: MUTED }}>בזמן אמת</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Card C — Regions Strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.36 }}
          className="mt-4 rounded-2xl p-4 flex flex-wrap items-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.60)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 30px rgba(192,57,10,0.05)',
          }}
        >
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />
          {REGIONS.map(r => {
            const isActive = selectedRegion === r.id
            return (
              <motion.button
                key={r.id}
                onClick={() => setSelectedRegion(p => p === r.id ? '' : r.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: isActive ? `${r.color}18` : 'rgba(255,255,255,0.70)',
                  border: isActive ? `1.5px solid ${r.color}45` : '1px solid rgba(0,0,0,0.07)',
                  color: isActive ? r.color : MUTED,
                  boxShadow: isActive ? `0 4px 14px ${r.color}1A` : 'none',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING}
              >
                <r.Icon className="w-3.5 h-3.5" />
                {r.label}
              </motion.button>
            )
          })}
          <AnimatePresence>
            {selectedRegion && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                onClick={() => setSelectedRegion('')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ color: TERRA, background: `${TERRA}0D`, border: `1px solid ${TERRA}25` }}
              >
                <X className="w-3 h-3" /> נקה
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── FILTER TABS + EVENT FEED ─────────────── */}
      <div className="px-5 max-w-2xl mx-auto md:max-w-4xl pb-20 space-y-6">

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
                  <span className="relative" style={{ zIndex: 1 }}>{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </LayoutGroup>

        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
              {region ? `ארוחות — ${region.label}` : 'ארוחות קרובות'}
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
                  style={{
                    height: 112,
                    background: 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.80)',
                  }}
                  animate={{ opacity: [0.40, 0.85, 0.40] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: EASE }}
              className="flex flex-col items-center py-16 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl"
                style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}
              >
                🍽️
              </div>
              <p className="font-black text-lg mb-2" style={{ color: TEXT, fontFamily: "'Frank Ruhl Libre', serif" }}>
                {search ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
              </p>
              <p className="text-sm mb-7" style={{ color: MUTED }}>
                {search ? 'נסה חיפוש אחר' : 'היה הראשון לפרסם ארוחה באזורך'}
              </p>
              <Link to="/create-event">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                  className="px-7 py-3 text-sm font-bold text-white rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${TERRA}, #6E2E17)`, boxShadow: `0 4px 18px ${TERRA}30` }}
                >
                  פרסם ארוחה ראשונה
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {displayed.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, ease: EASE, delay: i * 0.05 }}
                >
                  <EventCard event={ev} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
