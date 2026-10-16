import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, X, UtensilsCrossed, CalendarPlus, ArrowLeft,
  MapPin, Users, Moon, Sun, Star, Cake,
} from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup, type Variants } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import FilterBar, { type FilterState } from '../components/FilterBar'
import TopBar from '../components/TopBar'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 400, damping: 28 }

interface BirthdayProfile {
  id: string; display_name: string; avatar_url: string | null; birthday: string
}
function isBirthdayThisWeek(birthday: string): boolean {
  const today = new Date()
  const bday = new Date(birthday + 'T00:00:00')
  for (let i = 0; i <= 6; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i)
    if (bday.getMonth() === d.getMonth() && bday.getDate() === d.getDate()) return true
  }
  return false
}

const CITIES = [
  { name: 'ירושלים', color: '#C0522A', bg: 'rgba(192,82,42,0.10)' },
  { name: 'תל אביב', color: '#1a7a4a', bg: 'rgba(26,122,74,0.10)' },
  { name: 'חיפה',    color: '#1e5fa5', bg: 'rgba(30,95,165,0.10)' },
  { name: 'ראשון לציון', color: '#7B4A9E', bg: 'rgba(123,74,158,0.10)' },
  { name: 'באר שבע', color: '#B8780A', bg: 'rgba(184,120,10,0.10)' },
  { name: 'נתניה',   color: '#1e5fa5', bg: 'rgba(30,95,165,0.10)' },
  { name: 'בני ברק', color: '#C0522A', bg: 'rgba(192,82,42,0.10)' },
]

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item: Variants   = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב'
}

/* ─────────────────────────────────────────
   City card with live-dot and count badge
───────────────────────────────────────── */
function CityCard({
  city, count, isActive, onClick,
}: { city: typeof CITIES[0]; count: number; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-start gap-2 p-3.5 rounded-2xl relative overflow-hidden"
      style={{
        width: 120,
        background: isActive ? city.bg : '#FFFFFF',
        border: `1.5px solid ${isActive ? city.color : '#E8E2D8'}`,
        boxShadow: isActive
          ? `0 8px 24px ${city.color}22, 0 1px 3px rgba(44,24,8,0.06)`
          : '0 1px 4px rgba(44,24,8,0.04)',
      }}
      whileHover={{ y: -4, scale: 1.02, boxShadow: `0 14px 32px ${city.color}1A, 0 2px 8px rgba(44,24,8,0.07)` }}
      whileTap={{ scale: 0.96 }}
      transition={SPRING}
    >
      {/* active glow strip */}
      {isActive && (
        <motion.div
          layoutId="cityCardAccent"
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: city.color }}
          transition={SPRING}
        />
      )}

      {/* live dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: city.color }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: city.color }} />
      </span>

      <div className="text-right w-full">
        <p className="text-xs font-bold leading-snug" style={{ color: isActive ? city.color : '#1C1A17' }}>
          {city.name}
        </p>
        <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#786C63' }}>
          {count > 0 ? `${count} ארוחות` : 'ממתין'}
        </p>
      </div>
    </motion.button>
  )
}

/* ─────────────────────────────────────────
   Skeleton placeholder card
───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid #E8E2D8' }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
    >
      <div className="h-20 rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #F0EBE3, #E8E0D6)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded-full w-3/4" style={{ background: '#F0EBE3' }} />
        <div className="h-2.5 rounded-full w-1/2" style={{ background: '#F5F0EA' }} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════ */
export default function Home() {
  const { user }       = useAuth()
  const { profile }    = useProfile(user?.id)
  const [events, setEvents]       = useState<Event[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [filters, setFilters]     = useState<FilterState>({ kashrut: [], religious: '', city: '', eventType: '' })
  const [filtersInit, setFiltersInit] = useState(false)
  const [birthdays, setBirthdays] = useState<BirthdayProfile[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (profile && !filtersInit) {
      if (profile.guest_kashrut_prefs?.length) setFilters(f => ({ ...f, kashrut: profile.guest_kashrut_prefs! }))
      setFiltersInit(true)
    }
  }, [profile, filtersInit])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('events').select('*, host:profiles!host_id(*)')
      .eq('status', 'active')
      .gt('event_date', new Date(Date.now() - 86400000).toISOString().split('T')[0])
      .order('event_date', { ascending: true })
    if (filters.kashrut.length) q = q.in('kashrut_level', filters.kashrut)
    if (filters.eventType)      q = q.eq('event_type', filters.eventType)
    if (filters.city)           q = q.eq('city', filters.city)
    if (filters.religious)      q = q.contains('preferred_religious_levels', [filters.religious])
    if (search.trim())          q = q.ilike('title', `%${search.trim()}%`)
    const { data } = await q.limit(50)
    setEvents(data ?? [])
    setLoading(false)
  }, [filters, search])

  useEffect(() => { const t = setTimeout(fetchEvents, 300); return () => clearTimeout(t) }, [fetchEvents])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('id, display_name, avatar_url, birthday')
      .not('birthday', 'is', null).neq('id', user.id)
      .then(({ data }) => { if (data) setBirthdays((data as BirthdayProfile[]).filter(p => isBirthdayThisWeek(p.birthday))) })
  }, [user])

  const cityCount = (name: string) => events.filter(e => e.city === name).length
  const hasFilters = filters.kashrut.length > 0 || filters.city || filters.religious || filters.eventType || search
  const activeFilterCount = [filters.kashrut.length > 0, !!filters.city, !!filters.religious, !!filters.eventType].filter(Boolean).length

  return (
    <div className="relative min-h-dvh" style={{ background: '#FDFBF7' }}>

      {/* ══ AMBIENT ORBS — Framer Motion live ══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <motion.div className="absolute rounded-full"
          style={{ width: 720, height: 720, top: -240, right: -260,
            background: 'radial-gradient(circle at 40% 40%, rgba(245,158,11,0.30) 0%, rgba(245,158,11,0.10) 45%, transparent 70%)',
            filter: 'blur(64px)' }}
          animate={{ x: [0, 60, -30, 0], y: [0, -50, 30, 0], scale: [1, 1.14, 0.92, 1] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full"
          style={{ width: 560, height: 560, bottom: 60, left: -200,
            background: 'radial-gradient(circle at 60% 60%, rgba(192,82,42,0.26) 0%, rgba(192,82,42,0.08) 50%, transparent 70%)',
            filter: 'blur(54px)' }}
          animate={{ x: [0, -40, 50, 0], y: [0, 60, -35, 0], scale: [1, 0.90, 1.10, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ══════════════════════════════════════════════
            HERO — greeting + live stats row
        ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative overflow-hidden px-5 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(232,226,216,0.7)' }}
        >
          {/* warm wash */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden
            style={{ background: 'linear-gradient(150deg, rgba(192,82,42,0.055) 0%, rgba(245,158,11,0.030) 60%, transparent 100%)' }} />

          <div className="relative max-w-lg mx-auto md:max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(192,82,42,0.60)' }}>
              {greeting()}
            </p>
            <h1 className="font-display font-black text-[1.65rem] leading-tight" style={{ color: '#1C1A17' }}>
              {profile?.display_name ?? 'ברוך הבא'}
            </h1>

            {/* Live stats pills */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <AnimatePresence>
                {!loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING, delay: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(192,82,42,0.09)', border: '1px solid rgba(192,82,42,0.18)' }}
                  >
                    <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C0522A' }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} />
                    <span className="text-xs font-semibold" style={{ color: '#C0522A' }}>
                      {events.length} ארוחות זמינות
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {filters.city && (
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={SPRING}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                  style={{ background: 'rgba(26,122,74,0.09)', border: '1px solid rgba(26,122,74,0.18)' }}
                >
                  <MapPin className="w-3 h-3" style={{ color: '#1a7a4a' }} />
                  <span className="text-xs font-semibold" style={{ color: '#1a7a4a' }}>{filters.city}</span>
                  <button onClick={() => setFilters(f => ({ ...f, city: '' }))}>
                    <X className="w-3 h-3" style={{ color: '#1a7a4a' }} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pt-4 space-y-4">

          {/* ══════════════════════════════════════════════
              BENTO CARDS — events count + create
          ══════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.08 }}
            className="grid grid-cols-5 gap-3"
            style={{ gridTemplateRows: '110px' }}
          >
            {/* WIDE: events available */}
            <motion.div
              className="col-span-3 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E2D8',
                boxShadow: '0 2px 12px rgba(44,24,8,0.05), 0 1px 3px rgba(44,24,8,0.03)',
              }}
              whileHover={{ y: -3, boxShadow: '0 14px 38px rgba(44,24,8,0.09)' }}
              transition={SPRING}
            >
              {/* color accent stripe */}
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg, #C0522A, #E8854A, #F5C24C)' }} aria-hidden />

              <div className="flex items-center gap-2 mt-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(192,82,42,0.10)' }}>
                  <UtensilsCrossed className="w-3.5 h-3.5" style={{ color: '#C0522A' }} strokeWidth={1.75} />
                </div>
                <p className="text-[11px] font-semibold" style={{ color: '#786C63' }}>ארוחות זמינות</p>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="skel"
                    className="h-8 w-12 rounded-xl" style={{ background: 'rgba(192,82,42,0.06)' }}
                    animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                ) : (
                  <motion.div key={events.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={SPRING}
                    className="flex items-end gap-1.5"
                  >
                    <span className="font-black text-4xl leading-none" style={{ color: '#1C1A17' }}>
                      {events.length}
                    </span>
                    <span className="text-[10px] font-medium pb-1" style={{ color: '#786C63' }}>שישי · שבת · חג</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* NARROW: create event */}
            <Link to="/create-event" className="col-span-2 block">
              <motion.div
                className="h-full rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(145deg, #C0522A 0%, #8C3318 100%)',
                  boxShadow: '0 4px 20px rgba(192,82,42,0.32)',
                }}
                whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(192,82,42,0.42)' }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING}
              >
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full" aria-hidden
                  style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.20)' }}>
                  <CalendarPlus className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">פרסם<br />ארוחה</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* ══════════════════════════════════════════════
              CITY SHOWCASE — interactive horizontal cards
          ══════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.13 }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#786C63' }}>
                לפי עיר
              </p>
              {filters.city && (
                <button onClick={() => setFilters(f => ({ ...f, city: '' }))}
                  className="text-[11px] font-semibold" style={{ color: '#C0522A' }}>
                  הצג הכל
                </button>
              )}
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-2.5 pb-0.5" style={{ width: 'max-content' }}>
                <LayoutGroup>
                  {CITIES.map((city) => (
                    <CityCard
                      key={city.name}
                      city={city}
                      count={cityCount(city.name)}
                      isActive={filters.city === city.name}
                      onClick={() => setFilters(f => ({ ...f, city: f.city === city.name ? '' : city.name }))}
                    />
                  ))}
                </LayoutGroup>
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════
              SEARCH + FILTERS TOGGLE
          ══════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.17 }}
            className="space-y-2"
          >
            {/* Search row */}
            <div className="flex gap-2">
              <motion.div
                className="relative flex-1 rounded-xl"
                animate={{
                  boxShadow: searchFocused
                    ? '0 0 0 2px rgba(192,82,42,0.25), 0 4px 20px rgba(192,82,42,0.10)'
                    : '0 0 0 1px #E8E2D8',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                  placeholder="חפש ארוחה, עיר, מארח..."
                  className="shulchan-input pr-10 pl-8 rounded-xl"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                      onClick={() => setSearch('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(120,108,99,0.12)' }}
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Filter toggle pill */}
              <motion.button
                onClick={() => setShowFilters(v => !v)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold"
                style={{
                  background: showFilters || activeFilterCount > 0 ? '#C0522A' : '#F5F0EA',
                  color: showFilters || activeFilterCount > 0 ? '#fff' : '#786C63',
                  border: showFilters || activeFilterCount > 0 ? 'none' : '1px solid #E8E2D8',
                }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} transition={SPRING}
              >
                {activeFilterCount > 0
                  ? <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                  : <Users className="w-3.5 h-3.5" />
                }
                סינון
              </motion.button>
            </div>

            {/* Filter bar — collapsible */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pt-1">
                    <FilterBar value={filters} onChange={setFilters} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Birthday wall ── */}
          <AnimatePresence>
            {birthdays.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                <div className="rounded-2xl p-4"
                  style={{ background: 'linear-gradient(135deg, rgba(200,134,10,0.08), rgba(240,180,40,0.04))',
                    border: '1px solid rgba(200,134,10,0.18)', borderRight: '3px solid rgba(200,134,10,0.55)' }}>
                  <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: '#1C1A17' }}>
                    <Cake className="w-4 h-4" style={{ color: '#C8860A' }} /> ימי הולדת השבוע
                  </p>
                  <div className="flex flex-col gap-2">
                    {birthdays.map(p => {
                      const bday = new Date(p.birthday + 'T00:00:00')
                      const today = new Date()
                      const isToday = bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()
                      return (
                        <div key={p.id} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#C8860A,#F0B428)', color:'#1A0800' }}>
                            {p.display_name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium truncate flex-1" style={{ color:'#1C1A17' }}>{p.display_name}</span>
                          <span className="text-[11px] font-bold flex-shrink-0" style={{ color:'#C8860A' }}>
                            {isToday ? 'היום!' : `${bday.getDate()}/${bday.getMonth()+1}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════
              EVENTS SECTION
          ══════════════════════════════════════════════ */}
          <div className="pb-8">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="flex items-center justify-between mb-3"
            >
              <h2 className="text-sm font-bold" style={{ color: '#1C1A17' }}>
                {hasFilters ? 'תוצאות חיפוש' : 'ארוחות קרובות'}
              </h2>
              <AnimatePresence>
                {!loading && events.length > 0 && (
                  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }} transition={SPRING}
                    className="text-xs font-semibold rounded-full px-2.5 py-1"
                    style={{ background: 'rgba(192,82,42,0.09)', color: '#C0522A' }}>
                    {events.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </motion.div>

              ) : events.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  <div className="rounded-3xl py-10 px-6 flex flex-col items-center text-center gap-5"
                    style={{ background: '#FFFFFF', border: '1.5px dashed #E8E2D8',
                      boxShadow: '0 2px 16px rgba(44,24,8,0.04)' }}>

                    {/* animated icon cluster */}
                    <div className="relative w-20 h-20">
                      {([Moon, Sun, Star] as const).map((Icon, i) => (
                        <motion.div key={i}
                          className="absolute w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{
                            background: ['rgba(192,82,42,0.10)', 'rgba(184,120,10,0.10)', 'rgba(74,140,58,0.10)'][i],
                            top: [0, 28, 8][i], left: [28, 0, 52][i],
                          }}
                          animate={{ y: [0, -6, 0], rotate: [0, i % 2 === 0 ? 5 : -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2.5 + i * 0.6, ease: 'easeInOut', delay: i * 0.4 }}
                        >
                          <Icon className="w-4 h-4" strokeWidth={1.75}
                            style={{ color: ['#C0522A','#B8780A','#4A8C3A'][i] }} />
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-bold text-base" style={{ color: '#1C1A17' }}>
                        {hasFilters ? 'לא נמצאו ארוחות' : 'אין ארוחות כרגע'}
                      </p>
                      <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#786C63' }}>
                        {hasFilters
                          ? 'נסה לשנות את הסינון'
                          : 'הפלטפורמה גדלה — פרסם ארוחה ביישוב שלך וצא ראשון'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-[220px]">
                      {hasFilters && (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                          onClick={() => { setFilters({ kashrut: [], religious: '', city: '', eventType: '' }); setSearch('') }}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: 'rgba(192,82,42,0.09)', color: '#C0522A' }}>
                          נקה סינונים
                        </motion.button>
                      )}
                      <Link to="/create-event" className="w-full">
                        <motion.button
                          whileHover={{ scale: 1.03, boxShadow: '0 10px 28px rgba(192,82,42,0.35)' }}
                          whileTap={{ scale: 0.97 }} transition={SPRING}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg,#C0522A,#8C3318)', boxShadow: '0 4px 16px rgba(192,82,42,0.28)' }}>
                          <CalendarPlus className="w-4 h-4" />
                          פרסם ארוחה ראשונה
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>

              ) : (
                <motion.div key="events" variants={stagger} initial="hidden" animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {events.map(event => (
                    <motion.div key={event.id} variants={item}>
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}
