import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Search, X, CalendarPlus, MapPin, Users, Moon, Sun, Star, Flame, ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import TopBar from '../components/TopBar'

const SPRING = { type: 'spring' as const, stiffness: 350, damping: 22 }

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

interface Region {
  id: string
  label: string
  color: string
  Icon: LucideIcon
  cities: string[]
}

const REGIONS: Region[] = [
  { id: 'jerusalem', label: 'ירושלים',      color: TERRA,     Icon: Moon,  cities: ['ירושלים','בית שמש','מעלה אדומים','מבשרת ציון','גבעת זאב'] },
  { id: 'gush_dan',  label: 'תל אביב',      color: OLIVE,     Icon: Sun,   cities: ['תל אביב','רמת גן','גבעתיים','בני ברק','ראשון לציון','פתח תקוה','חולון','בת ים','אשדוד','נתניה'] },
  { id: 'north',     label: 'הצפון',        color: '#1E5A8A', Icon: Star,  cities: ['חיפה','נהריה','עכו','טבריה','צפת','נצרת','קריית שמונה'] },
  { id: 'negev',     label: 'דימונה והנגב', color: '#8F5A0A', Icon: Flame, cities: ['באר שבע','אשקלון','אילת','דימונה','ערד','נתיבות'] },
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

  const activeRegion = REGIONS.find(r => r.id === selectedRegion)
  const displayed    = activeRegion
    ? events.filter(e => activeRegion.cities.includes(e.city))
    : events

  return (
    <div dir="rtl" className="min-h-dvh bg-[#FDFBF7]" style={{ color: TEXT }}>
      <TopBar logo />

      {/* ─── HERO ─────────────────────────────────── */}
      <section
        className="relative px-5 pt-10 pb-8"
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
        {/* Ambient orb — decorative, does not affect layout */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 340,
            background: 'radial-gradient(ellipse at 80% 0%, rgba(192,57,10,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid #E8E2D8',
              boxShadow: '0 2px 12px rgba(192,57,10,0.06)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: TERRA, animation: 'pulse 2s infinite' }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8F4222', letterSpacing: '0.04em' }}>
              {profile?.display_name ? `שלום ${profile.display_name} · ` : ''}שולחן פתוח
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black mb-4"
            style={{
              fontFamily:    "'Frank Ruhl Libre', serif",
              fontSize:      'clamp(2.6rem, 9vw, 4.5rem)',
              lineHeight:    0.95,
              letterSpacing: '-0.04em',
              color:         TEXT,
            }}
          >
            מוצאים שולחן חם<br />
            <span style={{ color: TERRA }}>לשבת ולחג</span>
          </h1>

          {/* Sub-headline */}
          <p className="mb-8 text-base leading-relaxed" style={{ color: MUTED, maxWidth: 340 }}>
            פלטפורמה מחברת בין מארחים לאורחים לארוחות שבת, חגים ומפגשים ברחבי הארץ.
          </p>

          {/* ── Search bar ── */}
          <div
            className="flex items-center gap-2 rounded-2xl"
            style={{
              padding: '6px 6px 6px 10px',
              background: 'rgba(255,255,255,0.85)',
              border: searchFocused ? `1.5px solid ${TERRA}60` : '1.5px solid #E8E2D8',
              boxShadow: searchFocused
                ? `0 0 0 3px ${TERRA}18, 0 16px 40px rgba(192,57,10,0.08)`
                : '0 16px 40px rgba(192,57,10,0.06)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          >
            <Search className="w-5 h-5 shrink-0" style={{ color: searchFocused ? TERRA : MUTED }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="חפש ארוחה, עיר, מארח..."
              className="flex-1 min-w-0 bg-transparent outline-none text-base font-medium"
              style={{ color: TEXT }}
              dir="rtl"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                  onClick={() => setSearch('')}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(0,0,0,0.06)' }}
                >
                  <X className="w-4 h-4" style={{ color: MUTED }} />
                </motion.button>
              )}
            </AnimatePresence>
            <button
              className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all"
              style={{ background: TERRA, boxShadow: `0 4px 14px ${TERRA}40` }}
            >
              חפש
            </button>
          </div>
        </div>
      </section>

      {/* ─── BENTO GRID ───────────────────────────── */}
      <section
        className="px-5 mb-8"
        style={{ maxWidth: 720, margin: '0 auto 2rem' }}
      >
        {/* Row 1: Card A + Card B */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">

          {/* Card A — Publish CTA */}
          <Link to="/create-event" className="block" style={{ flex: '0 0 58%' }}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={SPRING}
              className="relative overflow-hidden rounded-3xl flex flex-col justify-between"
              style={{
                minHeight: 260,
                padding: '1.75rem',
                background: `linear-gradient(148deg, ${TERRA} 0%, #8A2504 100%)`,
                boxShadow: '0 30px 70px rgba(192,57,10,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              {/* Backlight top-right */}
              <div
                aria-hidden
                style={{
                  position: 'absolute', top: -60, right: -50,
                  width: 240, height: 240,
                  background: 'radial-gradient(circle, rgba(255,215,130,0.40), transparent 60%)',
                  filter: 'blur(8px)',
                  pointerEvents: 'none',
                }}
              />

              {/* Top row */}
              <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.30)',
                  }}
                >
                  <CalendarPlus className="w-6 h-6 text-white" strokeWidth={1.75} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em' }}
                >
                  מארח שולחן
                </span>
              </div>

              {/* Bottom */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2
                  className="font-black mb-4"
                  style={{
                    fontFamily:    "'Frank Ruhl Libre', serif",
                    fontSize:      'clamp(2rem, 6vw, 2.8rem)',
                    color:         'white',
                    letterSpacing: '-0.034em',
                    lineHeight:    0.97,
                  }}
                >
                  מארחים<br />בשבת?
                </h2>
                <div
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>
                    פרסום ארוחה
                  </span>
                  <ArrowLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.70)' }} />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card B — Live count */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={SPRING}
            className="flex-1 rounded-3xl flex flex-col justify-between"
            style={{
              padding: '1.5rem',
              minHeight: 180,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.90)',
              boxShadow: '0 20px 50px rgba(192,57,10,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
            }}
          >
            <div className="flex items-center gap-2">
              <motion.span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: '#22c55e', display: 'inline-block' }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              />
              <span className="text-xs font-bold" style={{ color: OLIVE }}>פעילות חיה</span>
            </div>

            <div>
              <p
                className="font-black leading-none mb-1"
                style={{
                  fontSize: 'clamp(3rem, 12vw, 4.2rem)',
                  color: TEXT,
                  letterSpacing: '-0.07em',
                }}
              >
                {loading ? '—' : events.length}
              </p>
              <p className="text-sm font-semibold" style={{ color: MUTED }}>ארוחות פתוחות</p>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" style={{ color: MUTED }} />
              <span className="text-xs" style={{ color: MUTED }}>בזמן אמת</span>
            </div>
          </motion.div>
        </div>

        {/* Card C — Region pills strip */}
        <div
          className="rounded-2xl flex flex-wrap items-center gap-2"
          style={{
            padding: '0.875rem 1rem',
            background: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(255,255,255,0.88)',
            boxShadow: '0 8px 30px rgba(192,57,10,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <MapPin className="w-4 h-4 shrink-0" style={{ color: MUTED }} />
          {REGIONS.map(r => {
            const isActive = selectedRegion === r.id
            const Icon = r.Icon
            return (
              <motion.button
                key={r.id}
                onClick={() => setSelectedRegion(p => p === r.id ? '' : r.id)}
                className="flex items-center gap-1.5 rounded-xl text-xs font-bold"
                style={{
                  padding: '6px 14px',
                  background: isActive ? `${r.color}18` : 'rgba(255,255,255,0.75)',
                  border: isActive ? `1.5px solid ${r.color}50` : '1px solid rgba(0,0,0,0.08)',
                  color: isActive ? r.color : MUTED,
                  boxShadow: isActive ? `0 4px 12px ${r.color}1A` : 'none',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING}
              >
                <Icon className="w-3.5 h-3.5" />
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
                className="flex items-center gap-1 rounded-xl text-xs font-bold"
                style={{ padding: '6px 12px', color: TERRA, background: `${TERRA}0D`, border: `1px solid ${TERRA}28` }}
              >
                <X className="w-3 h-3" /> נקה
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── FILTER TABS + EVENT FEED ──────────────── */}
      <div
        className="px-5 pb-20 space-y-6"
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
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
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${TERRA}, #6E2E17)`,
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
            <p
              className="text-[9px] font-bold uppercase"
              style={{ color: MUTED, letterSpacing: '0.18em' }}
            >
              {activeRegion ? `ארוחות — ${activeRegion.label}` : 'ארוחות קרובות'}
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
                    height: 108,
                    background: 'rgba(255,255,255,0.60)',
                    border: '1px solid rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                  }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(255,255,255,0.90)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                🍽️
              </div>
              <p
                className="font-black text-lg mb-2"
                style={{ color: TEXT, fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                {search ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
              </p>
              <p className="text-sm mb-7" style={{ color: MUTED }}>
                {search ? 'נסה חיפוש אחר' : 'היה הראשון לפרסם ארוחה באזורך'}
              </p>
              <Link to="/create-event">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                  className="px-7 py-3 text-sm font-bold text-white rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${TERRA}, #6E2E17)`,
                    boxShadow: `0 4px 18px ${TERRA}30`,
                  }}
                >
                  פרסם ארוחה ראשונה
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
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
