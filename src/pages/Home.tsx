import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, AnimatePresence, LayoutGroup,
  type Variants,
} from 'framer-motion'
import {
  Search, X, CalendarPlus, ArrowLeft,
  Moon, Sun, Star, Flame, Sparkles, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import TopBar from '../components/TopBar'

/* ─── Motion config ──────────────────────────────────────── */
type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 350, damping: 22 }

/* ─── Brand palette ──────────────────────────────────────── */
const TERRA = '#C0390A'
const OLIVE = '#2D4A1E'
const TEXT  = '#1C1A17'
const MUTED = '#786C63'

/* ─── Glass ──────────────────────────────────────────────── */
const GLASS = {
  background:           'rgba(255,255,255,0.50)',
  backdropFilter:       'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  border:               '1px solid rgba(255,255,255,0.90)',
  boxShadow:            '0 20px 50px rgba(192,57,10,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
} as const

/* ─── Data ───────────────────────────────────────────────── */
const TABS = [
  { id: 'all',            label: 'הכל'        },
  { id: 'shabbat_dinner', label: 'שישי'        },
  { id: 'shabbat_lunch',  label: 'שבת'         },
  { id: 'holiday',        label: 'חג'          },
  { id: 'weekday',        label: 'חול'         },
]

interface Region { name: string; color: string; cities: string[]; Icon: LucideIcon }
const REGIONS: Region[] = [
  {
    name: 'ירושלים', color: TERRA, Icon: Moon,
    cities: ['ירושלים','בית שמש','מעלה אדומים','מבשרת ציון','גבעת זאב'],
  },
  {
    name: 'גוש דן', color: OLIVE, Icon: Sun,
    cities: ['תל אביב','רמת גן','גבעתיים','בני ברק','ראשון לציון','פתח תקוה','חולון','בת ים','אשדוד','נתניה'],
  },
  {
    name: 'הצפון', color: '#1E5A8A', Icon: Star,
    cities: ['חיפה','נהריה','עכו','טבריה','צפת','נצרת','קריית שמונה'],
  },
  {
    name: 'הנגב', color: '#8F5A0A', Icon: Flame,
    cities: ['באר שבע','אשקלון','אילת','דימונה','ערד','נתיבות'],
  },
]

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const fadeUp: Variants  = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
}

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

  const displayed = selectedRegion
    ? (() => {
        const r = REGIONS.find(x => x.name === selectedRegion)
        return r ? events.filter(e => r.cities.includes(e.city)) : events
      })()
    : events

  return (
    <div dir="rtl" className="relative min-h-dvh overflow-x-hidden" style={{ background: '#FDFBF7' }}>

      {/* ── Ambient blobs — fixed behind everything ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: -120, right: -100,
            width: 600, height: 600,
            background: `${TERRA}16`, borderRadius: '50%', filter: 'blur(100px)',
          }}
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', top: '35%', left: -150,
            width: 700, height: 700,
            background: `${OLIVE}12`, borderRadius: '50%', filter: 'blur(120px)',
          }}
        />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          style={{
            position: 'absolute', bottom: 0, right: '20%',
            width: 400, height: 400,
            background: '#F59E0B18', borderRadius: '50%', filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ══════════════════════════════════════
            CINEMATIC HERO — asymmetric, massive
        ══════════════════════════════════════ */}
        <section className="relative px-6 pt-8 pb-4 max-w-5xl mx-auto">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ ...GLASS }}
          >
            <Sparkles className="w-4 h-4" style={{ color: TERRA }} />
            <span className="text-xs font-bold" style={{ color: '#8F4222', letterSpacing: '0.04em' }}>
              {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''} · שולחן פתוח
            </span>
          </motion.div>

          {/* Headline with overlapping glass layers */}
          <div className="relative">

            {/* Glass shard 1 — behind, rotated */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="absolute pointer-events-none"
              style={{
                top: -18, right: -20, width: '62%', height: 110,
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.85)',
                borderRadius: '1.75rem',
                boxShadow: '0 16px 50px rgba(192,57,10,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
                transform: 'rotate(-1.5deg)',
              }}
            />
            {/* Glass shard 2 — terracotta tint, offset */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="absolute pointer-events-none"
              style={{
                top: 36, left: -10, width: '38%', height: 80,
                background: `${TERRA}0A`,
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${TERRA}1C`,
                borderRadius: '1.25rem',
                transform: 'rotate(1.2deg)',
              }}
            />

            <motion.h1
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
              className="relative font-black leading-[0.95]"
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 'clamp(3.2rem, 11vw, 5.5rem)',
                color: TEXT,
                letterSpacing: '-0.04em',
                zIndex: 10,
              }}
            >
              מוצאים שולחן חם<br />
              <span style={{ color: TERRA }}>לשבת ולחג</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.22 }}
            className="mt-6 text-base max-w-sm leading-relaxed"
            style={{ color: MUTED }}
          >
            פלטפורמה מחברת בין מארחים לאורחים לארוחות שבת, חגים ומפגשים ברחבי הארץ.
          </motion.p>
        </section>

        {/* ══════════════════════════════════════
            FLOATING SEARCH DOCK
        ══════════════════════════════════════ */}
        <div className="px-6 max-w-5xl mx-auto mt-8" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            className="relative rounded-2xl"
            style={{
              ...GLASS,
              boxShadow: searchFocused
                ? `0 0 0 2.5px ${TERRA}42, 0 20px 50px rgba(192,57,10,0.10), inset 0 1px 0 rgba(255,255,255,0.95)`
                : '0 20px 50px rgba(192,57,10,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
              transition: 'box-shadow 0.3s ease',
            }}
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
              className="w-full outline-none bg-transparent rounded-2xl text-base font-medium"
              style={{ color: TEXT, padding: '1.1rem 3.5rem 1.1rem 3.5rem' }}
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
        </div>

        {/* ══════════════════════════════════════
            OVERLAPPING FLOATING STAGE
            Translucent backdrop + primary card
            floating dramatically on top of it
        ══════════════════════════════════════ */}
        <section className="relative px-6 max-w-5xl mx-auto mt-10">

          {/* Large translucent stage backdrop — sits behind the card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.14 }}
            className="absolute"
            style={{
              top: 44, right: 12, left: 12, bottom: -20,
              background: `linear-gradient(135deg, ${TERRA}0B 0%, rgba(255,248,240,0.60) 100%)`,
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${TERRA}16`,
              borderRadius: '2.5rem',
              boxShadow: `0 40px 100px rgba(192,57,10,0.08)`,
            }}
          />

          {/* Primary Feature Card — floats above the stage with deep shadow */}
          <Link to="/create-event" className="block" style={{ position: 'relative', zIndex: 10 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: EASE, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="relative overflow-hidden"
              style={{
                borderRadius: '2rem',
                background: `linear-gradient(148deg, ${TERRA} 0%, #A9603D 55%, #6E2E17 100%)`,
                boxShadow: `0 40px 100px rgba(192,57,10,0.28), 0 8px 30px ${TERRA}2E, inset 0 1px 0 rgba(255,255,255,0.22)`,
                minHeight: 280,
                transition: 'box-shadow 0.35s ease',
              }}
            >
              {/* Inner amber backlight */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: -80, right: -60, width: 360, height: 360,
                  background: 'radial-gradient(circle, rgba(255,215,130,0.55), transparent 65%)',
                  filter: 'blur(10px)',
                }}
                aria-hidden
              />
              {/* Grain */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.045,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
                aria-hidden
              />

              <div
                className="relative flex flex-col justify-between p-7"
                style={{ zIndex: 10, minHeight: 280 }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="rounded-2xl flex items-center justify-center"
                    style={{
                      width: 52, height: 52,
                      background: 'rgba(255,255,255,0.18)',
                      border: '1px solid rgba(255,255,255,0.32)',
                      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    <CalendarPlus className="w-6 h-6 text-white" strokeWidth={1.75} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.20em' }}
                  >
                    מארח שולחן
                  </span>
                </div>

                <div>
                  <h2
                    className="font-black leading-[0.97] mb-5"
                    style={{
                      fontFamily: "'Frank Ruhl Libre', serif",
                      fontSize: 'clamp(2.6rem, 8vw, 3.6rem)',
                      color: 'white',
                      letterSpacing: '-0.034em',
                    }}
                  >
                    פרסם<br />ארוחה
                  </h2>
                  <div
                    className="inline-flex items-center gap-2.5 rounded-2xl px-5 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>
                      פתח לאורחים
                    </span>
                    <ArrowLeft className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.70)' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Live status bar — rests on stage, overlaps card's lower edge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.36 }}
            className="relative flex items-center gap-4 px-6 py-4 rounded-2xl mt-4"
            style={{ ...GLASS, zIndex: 20 }}
          >
            <motion.span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: '#22c55e' }}
              animate={{ scale: [1, 1.45, 1], opacity: [1, 0.35, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            />
            <span className="text-xs font-bold" style={{ color: OLIVE }}>פעילות חיה</span>
            <span
              className="font-black text-xl leading-none"
              style={{ color: TEXT, letterSpacing: '-0.05em' }}
            >
              {loading ? '—' : events.length}
            </span>
            <span className="text-xs flex-1" style={{ color: MUTED }}>ארוחות פתוחות</span>
            <Users className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />
          </motion.div>
        </section>

        {/* ══════════════════════════════════════
            FILTERS + REGIONS + EVENTS
        ══════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto px-6 mt-8 pb-16 space-y-7">

          {/* Emil Kowalski spring tabs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE }}
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
          </motion.div>

          {/* Region pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
            className="flex flex-wrap gap-2"
          >
            {REGIONS.map(r => {
              const isActive = selectedRegion === r.name
              const { Icon } = r
              return (
                <motion.button
                  key={r.name}
                  onClick={() => setSelectedRegion(p => p === r.name ? '' : r.name)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: isActive ? `${r.color}16` : 'rgba(255,255,255,0.60)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: isActive ? `1.5px solid ${r.color}40` : '1px solid rgba(255,255,255,0.80)',
                    color: isActive ? r.color : MUTED,
                    boxShadow: isActive ? `0 4px 16px ${r.color}1A` : 'none',
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {r.name}
                </motion.button>
              )
            })}
            <AnimatePresence>
              {selectedRegion && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                  onClick={() => setSelectedRegion('')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ color: TERRA, background: `${TERRA}0D`, border: `1px solid ${TERRA}22` }}
                >
                  <X className="w-3 h-3" /> נקה
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Events feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
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
                    style={{ height: 112, ...GLASS }}
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
                  <span className="text-3xl">🍽️</span>
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
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING}
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
