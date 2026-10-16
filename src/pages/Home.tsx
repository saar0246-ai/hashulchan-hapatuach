import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, X, CalendarPlus, ArrowLeft,
  MapPin, Users, Moon, Sun, Star, Cake, Utensils, ChevronLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב'
}

interface Region {
  name: string
  cities: string[]
  color: string
  bg: string
  Icon: LucideIcon
}

const REGIONS: Region[] = [
  {
    name: 'ירושלים והסביבה',
    cities: ['ירושלים', 'בית שמש', 'מעלה אדומים', 'מבשרת ציון', 'גבעת זאב'],
    color: '#C0522A',
    bg: 'rgba(192,82,42,0.09)',
    Icon: Moon,
  },
  {
    name: 'גוש דן ותל אביב',
    cities: ['תל אביב', 'רמת גן', 'גבעתיים', 'בני ברק', 'ראשון לציון', 'נתניה', 'פתח תקוה', 'חולון', 'בת ים', 'אשדוד'],
    color: '#1a7a4a',
    bg: 'rgba(26,122,74,0.09)',
    Icon: Sun,
  },
  {
    name: 'חיפה והצפון',
    cities: ['חיפה', 'נהריה', 'עכו', 'טבריה', 'צפת', 'נצרת', 'קריית שמונה'],
    color: '#1e5fa5',
    bg: 'rgba(30,95,165,0.09)',
    Icon: Star,
  },
  {
    name: 'באר שבע והנגב',
    cities: ['באר שבע', 'אשקלון', 'אילת', 'דימונה', 'ערד', 'נתיבות'],
    color: '#B8780A',
    bg: 'rgba(184,120,10,0.09)',
    Icon: Utensils,
  },
]

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

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
  const { user }    = useAuth()
  const { profile } = useProfile(user?.id)
  const [events, setEvents]       = useState<Event[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [filters, setFilters]     = useState<FilterState>({ kashrut: [], religious: '', city: '', eventType: '' })
  const [filtersInit, setFiltersInit] = useState(false)
  const [birthdays, setBirthdays] = useState<BirthdayProfile[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('')

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

  const regionCount = (region: Region) =>
    events.filter(e => region.cities.includes(e.city)).length

  const displayedEvents = selectedRegion
    ? (() => {
        const region = REGIONS.find(r => r.name === selectedRegion)
        return region ? events.filter(e => region.cities.includes(e.city)) : events
      })()
    : events

  const hasFilters = filters.kashrut.length > 0 || !!filters.city || !!filters.religious || !!filters.eventType || !!search || !!selectedRegion
  const activeFilterCount = [filters.kashrut.length > 0, !!filters.city, !!filters.religious, !!filters.eventType].filter(Boolean).length

  const handleFiltersChange = (f: FilterState) => {
    setFilters(f)
    if (f.city) setSelectedRegion('')
  }

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(prev => prev === regionName ? '' : regionName)
    setFilters(f => ({ ...f, city: '' }))
  }

  return (
    <div className="relative min-h-dvh" style={{ background: '#FDFBF7' }}>

      {/* ══ AMBIENT ORBS ══ */}
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

        {/* ══ HERO ══ */}
        <div className="relative px-5 pt-8 pb-6 overflow-hidden"
          style={{ borderBottom: '1px solid rgba(232,226,216,0.55)' }}>
          <div className="absolute inset-0 pointer-events-none" aria-hidden
            style={{ background: 'linear-gradient(148deg, rgba(192,82,42,0.055) 0%, rgba(245,158,11,0.025) 55%, transparent 100%)' }} />

          <div className="relative max-w-lg mx-auto md:max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: EASE }}
              className="text-sm font-medium mb-2"
              style={{ color: '#786C63' }}
            >
              {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, ease: EASE, delay: 0.04 }}
              className="font-display font-black leading-[1.15]"
              style={{ color: '#1C1A17', fontSize: 'clamp(1.55rem, 5.5vw, 2.1rem)' }}
            >
              מוצאים שולחן חם<br />
              <span style={{ color: '#C0522A' }}>לשבת ולחג</span>
            </motion.h1>

            {/* Floating search */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.10 }}
              className="mt-5"
            >
              <motion.div
                className="relative rounded-2xl"
                animate={{
                  boxShadow: searchFocused
                    ? '0 0 0 2.5px rgba(192,82,42,0.28), 0 10px 40px rgba(192,82,42,0.12)'
                    : '0 4px 24px rgba(44,24,8,0.09), 0 1px 3px rgba(44,24,8,0.05)',
                }}
                style={{
                  background: 'rgba(255,255,255,0.88)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#786C63' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="חפש ארוחה, עיר, מארח..."
                  className="w-full py-4 pr-11 pl-11 text-sm font-medium outline-none bg-transparent rounded-2xl"
                  style={{ color: '#1C1A17' }}
                  dir="rtl"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                      onClick={() => setSearch('')}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(120,108,99,0.12)' }}
                    >
                      <X className="w-3.5 h-3.5" style={{ color: '#786C63' }} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pt-4 pb-10 space-y-5">

          {/* ══ BENTO GRID (3 boxes) ══ */}
          <motion.div
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: EASE, delay: 0.12 }}
            className="space-y-3"
          >
            {/* Row: Create card + Stats card */}
            <div className="grid grid-cols-5 gap-3" style={{ gridTemplateRows: '148px' }}>

              {/* a) Large "פרסם ארוחה" terracotta card */}
              <Link to="/create-event" className="col-span-3 block">
                <motion.div
                  className="h-full rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #C0522A 0%, #7A2C0A 100%)',
                    boxShadow: '0 4px 20px rgba(192,82,42,0.32)',
                  }}
                  whileHover={{ y: -4, boxShadow: '0 22px 64px rgba(192,82,42,0.46)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                >
                  {/* warm glow */}
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none" aria-hidden
                    style={{ background: 'radial-gradient(circle, rgba(255,168,80,0.55), transparent)' }} />
                  <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none" aria-hidden
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.22), transparent)' }} />

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center relative z-10"
                    style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <CalendarPlus className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>

                  <div className="relative z-10">
                    <p className="text-white/65 text-[10px] font-bold uppercase tracking-wider mb-1">מארח שולחן</p>
                    <p className="text-white font-black text-xl leading-tight font-display">
                      פרסם<br />ארוחה
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-white/75 text-xs font-semibold">התחל עכשיו</span>
                      <ArrowLeft className="w-3 h-3 text-white/75" />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* b) Live stats card — glassmorphism */}
              <motion.div
                className="col-span-2 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(232,226,216,0.9)',
                  boxShadow: '0 2px 16px rgba(44,24,8,0.05)',
                }}
                whileHover={{ y: -4, boxShadow: '0 14px 36px rgba(44,24,8,0.09)' }}
                transition={SPRING}
              >
                <div className="flex items-center gap-1.5">
                  <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e' }}
                    animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} />
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#786C63' }}>עכשיו</p>
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="skel" className="h-10 w-10 rounded-xl"
                      style={{ background: 'rgba(192,82,42,0.06)' }}
                      animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                  ) : (
                    <motion.div key={events.length}
                      initial={{ opacity: 0, scale: 0.72 }} animate={{ opacity: 1, scale: 1 }}
                      transition={SPRING}
                    >
                      <p className="font-black text-4xl leading-none" style={{ color: '#1C1A17' }}>{events.length}</p>
                      <p className="text-[10px] font-medium mt-1 leading-snug" style={{ color: '#786C63' }}>
                        ארוחות<br />זמינות
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* c) Geographic shortcut card */}
            <motion.button
              className="w-full rounded-2xl p-3.5 flex items-center gap-3 text-right relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E2D8',
                boxShadow: '0 1px 6px rgba(44,24,8,0.04)',
              }}
              whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(44,24,8,0.08)' }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING}
              onClick={() => document.getElementById('regions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(192,82,42,0.09)' }}>
                <MapPin className="w-4 h-4" style={{ color: '#C0522A' }} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs font-bold" style={{ color: '#1C1A17' }}>גלה לפי אזור</p>
                <p className="text-[10px] truncate" style={{ color: '#786C63' }}>
                  ירושלים · גוש דן · חיפה והצפון · הנגב
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{ background: ['#C0522A', '#1a7a4a', '#1e5fa5', '#B8780A'][i] }} />
                ))}
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" style={{ color: '#786C63' }} />
              </div>
            </motion.button>
          </motion.div>

          {/* ══ REGIONAL EXPLORER ══ */}
          <motion.div
            id="regions-section"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.52, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#786C63' }}>
                גלה לפי אזור
              </p>
              <AnimatePresence>
                {selectedRegion && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }} transition={SPRING}
                    onClick={() => setSelectedRegion('')}
                    className="text-[11px] font-semibold flex items-center gap-1"
                    style={{ color: '#C0522A' }}
                  >
                    <X className="w-3 h-3" /> נקה
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <LayoutGroup>
              <div className="grid grid-cols-2 gap-2.5">
                {REGIONS.map((region) => {
                  const count = regionCount(region)
                  const isActive = selectedRegion === region.name
                  const { Icon } = region
                  return (
                    <motion.button
                      key={region.name}
                      onClick={() => handleRegionClick(region.name)}
                      className="relative flex flex-col gap-2.5 p-4 rounded-2xl text-right"
                      style={{
                        background: isActive ? region.bg : '#FFFFFF',
                        border: `1.5px solid ${isActive ? region.color : '#E8E2D8'}`,
                        boxShadow: isActive
                          ? `0 8px 28px ${region.color}22`
                          : '0 1px 4px rgba(44,24,8,0.04)',
                      }}
                      whileHover={{
                        y: -6, scale: 1.02,
                        boxShadow: `0 18px 44px ${region.color}1C, 0 4px 12px rgba(44,24,8,0.06)`,
                      }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="regionAccent"
                          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                          style={{ background: region.color }}
                          transition={SPRING}
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: region.bg }}>
                          <Icon className="w-4 h-4" style={{ color: region.color }} strokeWidth={1.75} />
                        </div>
                        <AnimatePresence>
                          {count > 0 && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }} transition={SPRING}
                              className="text-[10px] font-bold rounded-full px-2 py-0.5"
                              style={{ background: `${region.color}18`, color: region.color }}
                            >
                              {count}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <p className="text-xs font-bold leading-snug"
                          style={{ color: isActive ? region.color : '#1C1A17' }}>
                          {region.name}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#786C63' }}>
                          {count > 0 ? `${count} ארוחות` : 'ממתין לפעילות'}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </LayoutGroup>
          </motion.div>

          {/* ══ FILTERS TOGGLE ══ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.44, ease: EASE }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <motion.button
                onClick={() => setShowFilters(v => !v)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold"
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
                  placeholder="חפש ארוחה, מארח..."
                  className="shulchan-input pr-10 pl-8 rounded-xl"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
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
            </div>

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
                    <FilterBar value={filters} onChange={handleFiltersChange} />
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
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,134,10,0.08), rgba(240,180,40,0.04))',
                    border: '1px solid rgba(200,134,10,0.18)',
                    borderRight: '3px solid rgba(200,134,10,0.55)',
                  }}>
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
                            style={{ background: 'linear-gradient(135deg,#C8860A,#F0B428)', color: '#1A0800' }}>
                            {p.display_name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium truncate flex-1" style={{ color: '#1C1A17' }}>{p.display_name}</span>
                          <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#C8860A' }}>
                            {isToday ? 'היום!' : `${bday.getDate()}/${bday.getMonth() + 1}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══ EVENTS SECTION ══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: '#1C1A17' }}>
                {hasFilters ? 'תוצאות חיפוש' : 'ארוחות קרובות'}
              </h2>
              <AnimatePresence>
                {!loading && displayedEvents.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }} transition={SPRING}
                    className="text-xs font-semibold rounded-full px-2.5 py-1"
                    style={{ background: 'rgba(192,82,42,0.09)', color: '#C0522A' }}>
                    {displayedEvents.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </motion.div>

              ) : displayedEvents.length === 0 ? (
                <motion.div key="empty"
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  <div className="rounded-3xl py-10 px-6 flex flex-col items-center text-center gap-5"
                    style={{
                      background: '#FFFFFF', border: '1.5px dashed #E8E2D8',
                      boxShadow: '0 2px 16px rgba(44,24,8,0.04)',
                    }}>
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
                            style={{ color: ['#C0522A', '#B8780A', '#4A8C3A'][i] }} />
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
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                          onClick={() => {
                            setFilters({ kashrut: [], religious: '', city: '', eventType: '' })
                            setSearch('')
                            setSelectedRegion('')
                          }}
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
                  {displayedEvents.map(event => (
                    <motion.div key={event.id} variants={item}>
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
