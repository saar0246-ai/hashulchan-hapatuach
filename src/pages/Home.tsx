import { useState, useEffect, useCallback } from 'react'
import { useStats } from '../hooks/useStats'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Search, X, CalendarPlus, Users, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { TextShimmer } from '../components/ui/TextShimmer'
import { InView } from '../components/ui/InView'
import { Tilt } from '../components/ui/Tilt'

/* ─── Design tokens (light palette) ───────────────────────────────────── */
const TEXT        = '#1A1714'
const MUTED       = '#8C7060'
const FIRE        = '#C0522A'
const AMBER       = '#C8860A'
const BORDER      = 'rgba(232,226,216,0.70)'
const BORDER_FIRE = 'rgba(192,82,42,0.20)'
const GLASS = {
  background:           'rgba(255,255,255,0.58)',
  backdropFilter:       'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border:               '1px solid rgba(255,255,255,0.80)',
  boxShadow:            '0 8px 32px rgba(44,24,8,0.07), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)',
}

/* ─── Tabs ──────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'all',            label: 'הכל'  },
  { id: 'shabbat_dinner', label: 'שישי' },
  { id: 'shabbat_lunch',  label: 'שבת'  },
  { id: 'holiday',        label: 'חג'   },
  { id: 'weekday',        label: 'חול'  },
]

/* ─── Region filter ─────────────────────────────────────────────────────── */
interface Region { id: string; label: string; cities: string[] }
const REGIONS: Region[] = [
  { id: 'jerusalem', label: 'ירושלים', cities: ['ירושלים','בית שמש','מעלה אדומים','מבשרת ציון','גבעת זאב'] },
  { id: 'gush_dan',  label: 'תל אביב', cities: ['תל אביב','רמת גן','גבעתיים','בני ברק','ראשון לציון','פתח תקוה','חולון','בת ים','אשדוד','נתניה'] },
  { id: 'north',     label: 'הצפון',   cities: ['חיפה','נהריה','עכו','טבריה','צפת','נצרת','קריית שמונה'] },
  { id: 'negev',     label: 'דרום',    cities: ['באר שבע','אשקלון','אילת','דימונה','ערד','נתיבות'] },
]

const SP = { type: 'spring' as const, stiffness: 380, damping: 26 }

export default function Home() {
  const { user }    = useAuth()
  const { profile } = useProfile(user?.id)
  const appStats    = useStats()

  const [events, setEvents]                 = useState<Event[]>([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [searchFocused, setSearchFocused]   = useState(false)
  const [activeTab, setActiveTab]           = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [regionOpen, setRegionOpen]         = useState(false)

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
    const now = new Date()
    const filteredByTime = (data ?? []).filter(e => {
      const eventEnd = new Date(`${e.event_date}T${e.event_time}`)
      eventEnd.setHours(eventEnd.getHours() + 3)
      return eventEnd > now
    })
    setEvents(filteredByTime)
    setLoading(false)
  }, [activeTab, search])

  useEffect(() => {
    const t = setTimeout(fetchEvents, 280)
    return () => clearTimeout(t)
  }, [fetchEvents])

  const activeRegionObj = REGIONS.find(r => r.id === selectedRegion)
  const displayed = activeRegionObj
    ? events.filter(e => activeRegionObj.cities.includes(e.city))
    : events

  return (
    <div
      style={{
        minHeight:  '100dvh',
        background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)',
        color:      TEXT,
        position:   'relative',
      }}
    >
      {/* ── Luminous orbs ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <motion.div className="absolute rounded-full"
          style={{
            width: 700, height: 700, top: -260, right: -260,
            background: 'radial-gradient(circle at 40% 40%, rgba(248,163,22,0.34) 0%, rgba(245,140,10,0.12) 44%, transparent 68%)',
            filter: 'blur(80px)',
          }}
          animate={{ x: [0, 60, -24, 0], y: [0, -56, 34, 0], scale: [1, 1.14, 0.90, 1] }}
          transition={{ repeat: Infinity, duration: 26, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full"
          style={{
            width: 560, height: 560, bottom: 40, left: -220,
            background: 'radial-gradient(circle at 58% 54%, rgba(192,82,42,0.30) 0%, rgba(180,70,30,0.10) 48%, transparent 70%)',
            filter: 'blur(72px)',
          }}
          animate={{ x: [0, -44, 52, 0], y: [0, 60, -36, 0], scale: [1, 0.89, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 32, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position:      'relative',
          zIndex:        1,
          display:       'flex',
          flexDirection: 'column',
          justifyContent:'flex-end',
          padding:       '7vh clamp(1rem, 4vw, 2.5rem) 6vh',
        }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', textAlign: 'center' }}>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ color: AMBER, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16 }}
          >
            {profile?.display_name ? `✦ שלום ${profile.display_name} ✦` : '✦ שולחן פתוח ✦'}
          </motion.p>

          {/* Headline line 1 */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.55 }}>
            <TextShimmer
              as="h1"
              baseColor={TEXT}
              shimmerColor={AMBER}
              duration={3}
              spread={4}
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontWeight: 900,
                fontSize:   'clamp(3.2rem, 13vw, 5rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                display:    'block',
                marginBottom: 8,
              }}
            >
              מוצאים שולחן חם
            </TextShimmer>
          </motion.div>

          {/* Headline line 2 */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.55 }}>
            <TextShimmer
              as="h1"
              baseColor={FIRE}
              shimmerColor={AMBER}
              duration={3.5}
              spread={4}
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontWeight: 900,
                fontSize:   'clamp(3.2rem, 13vw, 5rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                display:    'block',
                marginBottom: 28,
              }}
            >
              לשבת ולחג
            </TextShimmer>
          </motion.div>

          {/* AnimatedNumber stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center' }}
          >
            <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900, fontSize: 'clamp(2.6rem, 10vw, 3.6rem)', color: FIRE, letterSpacing: '-0.05em', lineHeight: 1 }}>
              <AnimatedNumber value={loading ? 0 : events.length} springOptions={{ stiffness: 80, damping: 22 }} />
            </span>
            <span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>ארוחות פתוחות כרגע</span>
            <motion.span
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0, marginBottom: 2 }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            />
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: MUTED, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em' }}
          >
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
              <ChevronDown style={{ width: 16, height: 16 }} />
            </motion.div>
            <span>גלול לארוחות</span>
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 100 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            style={{
              ...GLASS,
              display:    'flex',
              alignItems: 'center',
              gap:        8,
              padding:    '10px 14px',
              borderRadius: 16,
              marginBottom: 20,
              border:     `1px solid ${searchFocused ? BORDER_FIRE : BORDER}`,
              transition: 'border-color 0.2s',
            }}
          >
            <Search style={{ width: 16, height: 16, color: MUTED, flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="חפש ארוחה, עיר, מארח..."
              dir="rtl"
              style={{ flex: 1, background: 'transparent', color: TEXT, outline: 'none', fontSize: 14, border: 'none' }}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={SP}
                  onClick={() => setSearch('')}
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'rgba(44,24,8,0.07)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <X style={{ width: 13, height: 13, color: MUTED }} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Emil Kowalski Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ marginBottom: 20, textAlign: 'center' }}
          >
            <LayoutGroup>
              <div
                style={{
                  display:      'inline-flex',
                  background:   'rgba(230,218,208,0.50)',
                  borderRadius: 9999,
                  padding:      3,
                  border:       `1px solid ${BORDER}`,
                }}
              >
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        position:   'relative',
                        padding:    '7px 16px',
                        borderRadius: 9999,
                        color:      isActive ? FIRE : MUTED,
                        cursor:     'pointer',
                        fontSize:   13,
                        fontWeight: isActive ? 700 : 500,
                        background: 'transparent',
                        border:     'none',
                        outline:    'none',
                      }}
                      whileTap={{ scale: 0.94 }}
                      transition={SP}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="bubble"
                          style={{
                            position:  'absolute',
                            inset:     0,
                            borderRadius: 9999,
                            background: 'rgba(255,255,255,0.88)',
                            boxShadow: '0 1px 8px rgba(44,24,8,0.10)',
                          }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </LayoutGroup>
          </motion.div>

          {/* Region filter */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{ marginBottom: 24 }}
          >
            <button
              onClick={() => setRegionOpen(p => !p)}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        6,
                ...GLASS,
                border:     `1px solid ${selectedRegion ? BORDER_FIRE : BORDER}`,
                borderRadius: 10,
                padding:    '7px 14px',
                color:      selectedRegion ? FIRE : MUTED,
                fontSize:   13,
                fontWeight: 600,
                cursor:     'pointer',
              }}
            >
              <Users style={{ width: 14, height: 14 }} />
              {activeRegionObj ? activeRegionObj.label : 'כל האזורים'}
              <motion.div animate={{ rotate: regionOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown style={{ width: 14, height: 14 }} />
              </motion.div>
            </button>

            <AnimatePresence>
              {regionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginTop: 8, ...GLASS, borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}
                >
                  <button
                    onClick={() => { setSelectedRegion(''); setRegionOpen(false) }}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: !selectedRegion ? 'rgba(192,82,42,0.10)' : 'transparent',
                      border: `1px solid ${!selectedRegion ? BORDER_FIRE : BORDER}`,
                      color:  !selectedRegion ? FIRE : MUTED,
                    }}
                  >הכל</button>
                  {REGIONS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedRegion(r.id); setRegionOpen(false) }}
                      style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: selectedRegion === r.id ? 'rgba(192,82,42,0.10)' : 'transparent',
                        border: `1px solid ${selectedRegion === r.id ? BORDER_FIRE : BORDER}`,
                        color:  selectedRegion === r.id ? FIRE : TEXT,
                      }}
                    >{r.label}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* WhatsApp community banner — animates on mount, no IntersectionObserver */}
          <motion.a
            href="https://chat.whatsapp.com/J45vgvDnJhtCOUgKvpmZk8"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            style={{ display: 'block', marginBottom: 20, textDecoration: 'none' }}
          >
            <div style={{
              ...GLASS,
              borderRadius: 16,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: '1px solid rgba(37,211,102,0.35)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: 'linear-gradient(135deg, #25D366, #128C4E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,211,102,0.30)',
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.929 1.4 5.6L0 24l6.6-1.373A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.213-3.727.977.994-3.633-.234-.374A9.772 9.772 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 3 }}>הצטרפו לקבוצת הוואטסאפ שלנו</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>עדכונים, הזדמנויות וקהילה — חינם</p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)',
              }}>
                <span style={{ fontSize: 16, color: '#25D366', fontWeight: 700, lineHeight: 1 }}>←</span>
              </div>
            </div>
          </motion.a>

          {/* CTA card */}
          <InView
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            viewOptions={{ once: true, margin: '0px 0px -20px 0px' }}
          >
            <Link to="/create-event" style={{ display: 'block', marginBottom: 28 }}>
              <Tilt
                rotationFactor={6}
                springOptions={{ stiffness: 260, damping: 24 }}
                style={{
                  borderRadius: 20,
                  overflow:     'hidden',
                  background:   'linear-gradient(135deg, #C0522A 0%, #7A3018 100%)',
                  padding:      '1.8rem',
                  display:      'block',
                  position:     'relative',
                }}
              >
                <div aria-hidden style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, background: 'radial-gradient(circle, rgba(255,215,130,0.35), transparent 60%)', filter: 'blur(8px)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarPlus style={{ width: 22, height: 22, color: 'white' }} strokeWidth={1.75} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>מארח שולחן</span>
                  </div>
                  <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900, fontSize: 'clamp(1.9rem, 7vw, 2.6rem)', color: 'white', letterSpacing: '-0.034em', lineHeight: 0.97, marginBottom: 20 }}>
                    מארחים<br />בשבת?
                  </h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.32)', borderRadius: 11, padding: '9px 18px' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>פרסום ארוחה</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16 }}>←</span>
                  </div>
                </div>
              </Tilt>
            </Link>
          </InView>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              {activeRegionObj ? `ארוחות — ${activeRegionObj.label}` : 'ארוחות קרובות'}
            </p>
            {!loading && displayed.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 10px', background: 'rgba(192,82,42,0.10)', border: `1px solid ${BORDER_FIRE}`, color: FIRE }}>
                {displayed.length}
              </span>
            )}
          </div>

          {/* Event list */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  style={{ height: 108, borderRadius: 16, background: 'rgba(255,255,255,0.58)', border: `1px solid ${BORDER}` }}
                  animate={{ opacity: [0.4, 0.75, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', ...GLASS, marginBottom: 18 }}>
                🍽️
              </div>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900, fontSize: 20, color: TEXT, marginBottom: 8 }}>
                {search ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
              </p>
              <p style={{ fontSize: 14, color: MUTED, marginBottom: 28 }}>
                {search ? 'נסה חיפוש אחר' : 'היה הראשון לפרסם ארוחה באזורך'}
              </p>
              <Link to="/create-event">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SP}
                  style={{ padding: '11px 28px', fontSize: 14, fontWeight: 700, color: 'white', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #C0522A, #7A3018)' }}
                >
                  פרסם ארוחה ראשונה
                </motion.button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayed.map((ev, i) => (
                <InView
                  key={ev.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.06, 0.3) }}
                  viewOptions={{ once: true, margin: '0px 0px -30px 0px' }}
                >
                  <EventCard event={ev} />
                </InView>
              ))}
            </div>
          )}

          {/* Food Giveaway section — always visible, no InView dependency */}
          <Link to="/food-posts" style={{ textDecoration: 'none', display: 'block', marginTop: 16 }}>
            <div style={{
              ...GLASS,
              borderRadius: 20,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: '1px solid rgba(192,82,42,0.18)',
              background: 'rgba(255,248,240,0.92)',
            }}>
              <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>🍲</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>מסירות אוכל</p>
                <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0 0' }}>שיתוף אוכל שנשאר — לקחת או לתת</p>
              </div>
              <span style={{ fontSize: 14, color: FIRE, fontWeight: 700, flexShrink: 0 }}>←</span>
            </div>
          </Link>

          {/* Live community stats */}
          <InView
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            viewOptions={{ once: true }}
            style={{ marginTop: 40 }}
          >
            <div style={{ ...GLASS, borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 20 }}>
                קהילת השולחן הפתוח
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900, fontSize: 'clamp(1.8rem, 7vw, 2.4rem)', color: FIRE, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    <AnimatedNumber value={appStats.events} />
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4, fontWeight: 500 }}>ארוחות סה״כ</div>
                </div>
                <div style={{ width: 1, height: 36, background: BORDER, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900, fontSize: 'clamp(1.8rem, 7vw, 2.4rem)', color: FIRE, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    <AnimatedNumber value={appStats.members} />
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4, fontWeight: 500 }}>חברים רשומים</div>
                </div>
                <div style={{ width: 1, height: 36, background: BORDER, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900, fontSize: 'clamp(1.8rem, 7vw, 2.4rem)', color: FIRE, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    <AnimatedNumber value={appStats.cities} />
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4, fontWeight: 500 }}>ערים פעילות</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                <motion.span
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                />
                <span style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>מתעדכן כל 30 שניות</span>
              </div>
            </div>
          </InView>

          {/* Footer links */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 20 }}>
            {[
              { to: '/about',         label: 'אודות' },
              { to: '/terms',         label: 'תנאי שימוש' },
              { to: '/privacy',       label: 'פרטיות' },
              { to: '/accessibility', label: 'נגישות' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontSize: 12, color: MUTED, textDecoration: 'none', fontWeight: 500 }}>
                {label}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
