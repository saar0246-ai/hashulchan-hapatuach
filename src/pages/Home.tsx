import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarPlus, X, UtensilsCrossed, Home as HomeIcon, Cake, ChefHat, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup, type Variants } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import FilterBar, { type FilterState } from '../components/FilterBar'
import LoadingSpinner from '../components/LoadingSpinner'
import TopBar from '../components/TopBar'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]

interface BirthdayProfile {
  id: string
  display_name: string
  avatar_url: string | null
  birthday: string
}

function isBirthdayThisWeek(birthday: string): boolean {
  const today = new Date()
  const bday = new Date(birthday + 'T00:00:00')
  for (let i = 0; i <= 6; i++) {
    const check = new Date(today)
    check.setDate(today.getDate() + i)
    if (bday.getMonth() === check.getMonth() && bday.getDate() === check.getDate()) return true
  }
  return false
}

const CITIES_QUICK = ['ירושלים', 'תל אביב', 'חיפה', 'ראשון לציון', 'באר שבע', 'נתניה', 'בני ברק']

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 22 } as const,
  animate:    { opacity: 1, y: 0 } as const,
  transition: { duration: 0.5, ease: EASE, delay },
})

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}
const spring = { type: 'spring' as const, stiffness: 380, damping: 26 }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'בוקר טוב'
  if (h < 17) return 'צהריים טובים'
  return 'ערב טוב'
}

export default function Home() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [filters, setFilters] = useState<FilterState>({ kashrut: [], religious: '', city: '', eventType: '' })
  const [filtersInitialized, setFiltersInitialized] = useState(false)
  const [birthdays, setBirthdays] = useState<BirthdayProfile[]>([])

  useEffect(() => {
    if (profile && !filtersInitialized) {
      if (profile.guest_kashrut_prefs && profile.guest_kashrut_prefs.length > 0) {
        setFilters(f => ({ ...f, kashrut: profile.guest_kashrut_prefs! }))
      }
      setFiltersInitialized(true)
    }
  }, [profile, filtersInitialized])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('events')
      .select('*, host:profiles!host_id(*)')
      .eq('status', 'active')
      .gt('event_date', new Date(Date.now() - 86400000).toISOString().split('T')[0])
      .order('event_date', { ascending: true })

    if (filters.kashrut.length > 0) query = query.in('kashrut_level', filters.kashrut)
    if (filters.eventType) query = query.eq('event_type', filters.eventType)
    if (filters.city)      query = query.eq('city', filters.city)
    if (filters.religious) query = query.contains('preferred_religious_levels', [filters.religious])
    if (search.trim())     query = query.ilike('title', `%${search.trim()}%`)

    const { data } = await query.limit(50)
    setEvents(data ?? [])
    setLoading(false)
  }, [filters, search])

  useEffect(() => {
    const t = setTimeout(fetchEvents, 300)
    return () => clearTimeout(t)
  }, [fetchEvents])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, birthday')
      .not('birthday', 'is', null)
      .neq('id', user.id)
      .then(({ data }) => {
        if (data) setBirthdays((data as BirthdayProfile[]).filter(p => isBirthdayThisWeek(p.birthday)))
      })
  }, [user])

  const hasFilters = filters.kashrut.length > 0 || filters.city || filters.religious || filters.eventType || search

  return (
    <div className="relative min-h-dvh" style={{ background: '#FDFBF7' }}>

      {/* ── Live Framer Motion ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700,
            top: -200, right: -250,
            background: 'radial-gradient(circle at center, rgba(245,158,11,0.28) 0%, rgba(245,158,11,0.08) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ x: [0, 55, -25, 0], y: [0, -45, 28, 0], scale: [1, 1.12, 0.93, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 550, height: 550,
            bottom: 80, left: -180,
            background: 'radial-gradient(circle at center, rgba(192,82,42,0.24) 0%, rgba(192,82,42,0.07) 50%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{ x: [0, -38, 48, 0], y: [0, 58, -32, 0], scale: [1, 0.91, 1.09, 1] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ════════════════════════════════════════
            HERO BANNER — rich greeting panel
        ════════════════════════════════════════ */}
        <motion.div
          {...fadeUp(0.04)}
          className="relative overflow-hidden"
          style={{ borderBottom: '1px solid rgba(232,226,216,0.8)' }}
        >
          {/* Warm gradient wash behind hero */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(160deg, rgba(192,82,42,0.06) 0%, rgba(245,158,11,0.04) 50%, transparent 100%)',
            }}
            aria-hidden
          />

          <div className="relative px-5 pt-6 pb-5 max-w-lg mx-auto md:max-w-3xl">
            {/* Greeting + name row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(192,82,42,0.65)' }}>
                  {greeting()}
                </p>
                <h1 className="font-display font-black text-2xl leading-tight" style={{ color: '#1C1A17' }}>
                  {profile?.display_name ?? 'ברוך הבא'}
                </h1>
                <p className="text-xs mt-1.5" style={{ color: '#786C63' }}>
                  מצא שולחן לשישי, לחג, או לסתם ערב טוב
                </p>
              </div>

              {/* Live events badge */}
              {!loading && events.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: 0.25 }}
                  className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-3.5 py-2.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(192,82,42,0.12), rgba(192,82,42,0.06))',
                    border: '1.5px solid rgba(192,82,42,0.22)',
                    minWidth: 60,
                  }}
                >
                  <span className="font-black text-2xl leading-none" style={{ color: '#C0522A' }}>
                    {events.length}
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(192,82,42,0.7)' }}>
                    ארוחות
                  </span>
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ background: '#C0522A' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pt-4">

          {/* ════════════════════════════════════════
              QUICK ACTION CARDS
          ════════════════════════════════════════ */}
          <motion.div {...fadeUp(0.09)} className="grid grid-cols-2 gap-3 mb-5">

            {/* Events available card */}
            <motion.div
              className="rounded-2xl p-4 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FDF8F3 100%)',
                border: '1px solid #E8E2D8',
                boxShadow: '0 2px 8px rgba(44,24,8,0.05)',
              }}
              whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(44,24,8,0.10)' }}
              transition={spring}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg, #C0522A, #E8854A)' }}
              />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 mt-1" style={{ background: 'rgba(192,82,42,0.10)' }}>
                <UtensilsCrossed className="w-4 h-4" style={{ color: '#C0522A' }} strokeWidth={1.75} />
              </div>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-8 w-10 rounded-lg" style={{ background: 'rgba(192,82,42,0.08)' }} />
                ) : (
                  <motion.p
                    key={events.length}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    className="font-black text-3xl leading-none mb-1"
                    style={{ color: '#1C1A17' }}
                  >
                    {events.length}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs font-semibold" style={{ color: '#1C1A17' }}>ארוחות זמינות</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#786C63' }}>שישי, שבת וחגים</p>
            </motion.div>

            {/* Create event card */}
            <Link to="/create-event" className="block">
              <motion.div
                className="rounded-2xl p-4 h-full flex flex-col justify-between cursor-pointer relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #C0522A 0%, #8C3318 100%)',
                  boxShadow: '0 4px 20px rgba(192,82,42,0.30)',
                }}
                whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(192,82,42,0.40)' }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                {/* Decorative circle */}
                <div
                  className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  aria-hidden
                />
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  <HomeIcon className="w-4 h-4 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">פרסם ארוחה</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>הפוך למארח</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* ════════════════════════════════════════
              CITY QUICK-FILTER STRIP — layoutId sliding pill
          ════════════════════════════════════════ */}
          <motion.div {...fadeUp(0.13)} className="mb-3 overflow-x-auto no-scrollbar flex gap-2 pb-0.5">
            <LayoutGroup>
              {CITIES_QUICK.map((city) => {
                const isActive = filters.city === city
                return (
                  <motion.button
                    key={city}
                    onClick={() => setFilters(f => ({ ...f, city: f.city === city ? '' : city }))}
                    className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold relative"
                    style={{ color: isActive ? '#fff' : '#786C63' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    transition={spring}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="homeCityActivePill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: '#C0522A', zIndex: 0 }}
                        transition={spring}
                      />
                    )}
                    {!isActive && (
                      <span className="absolute inset-0 rounded-full" style={{ background: 'hsl(var(--muted))', zIndex: 0 }} />
                    )}
                    <span style={{ position: 'relative', zIndex: 1 }}>{city}</span>
                  </motion.button>
                )
              })}
            </LayoutGroup>
          </motion.div>

          {/* ════════════════════════════════════════
              SEARCH BAR — spring focus glow
          ════════════════════════════════════════ */}
          <motion.div
            {...fadeUp(0.15)}
            animate={{
              scale: searchFocused ? 1.015 : 1,
              boxShadow: searchFocused
                ? '0 4px 24px rgba(192,82,42,0.16), 0 0 0 2px rgba(192,82,42,0.20)'
                : '0 0 0 transparent',
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative mb-3 rounded-lg"
          >
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="חפש ארוחה, עיר, מארח..."
              className="shulchan-input pr-10 pl-9"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={spring}
                  onClick={() => setSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── FilterBar ── */}
          <motion.div {...fadeUp(0.17)} className="mb-5">
            <FilterBar value={filters} onChange={setFilters} />
          </motion.div>

          {/* ── Birthday wall ── */}
          <AnimatePresence>
            {birthdays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.38 }}
                className="mb-4"
              >
                <div
                  className="rounded-2xl p-4 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,134,10,0.09), rgba(240,180,40,0.04))',
                    border: '1px solid rgba(200,134,10,0.20)',
                    borderRight: '3px solid rgba(200,134,10,0.55)',
                  }}
                >
                  <p className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: '#1C1A17' }}>
                    <Cake className="w-4 h-4" style={{ color: '#C8860A' }} />
                    ימי הולדת השבוע
                  </p>
                  <div className="flex flex-col gap-2">
                    {birthdays.map(p => {
                      const bday = new Date(p.birthday + 'T00:00:00')
                      const today = new Date()
                      const isToday = bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()
                      const dayLabel = isToday ? 'היום!' : `${bday.getDate()}/${bday.getMonth() + 1}`
                      return (
                        <div key={p.id} className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #C8860A, #F0B428)', color: '#1A0800' }}
                          >
                            {p.display_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium truncate flex-1" style={{ color: '#1C1A17' }}>
                            {p.display_name}
                          </span>
                          <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#C8860A' }}>
                            {isToday ? 'היום!' : dayLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════════════════════════════
              EVENTS LIST
          ════════════════════════════════════════ */}
          <div className="pb-8">
            <motion.div {...fadeUp(0.19)} className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#1C1A17' }}>
                {hasFilters ? 'תוצאות חיפוש' : 'ארוחות קרובות'}
              </h2>
              <AnimatePresence>
                {events.length > 0 && !loading && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    className="text-xs rounded-full px-2.5 py-0.5 font-semibold"
                    style={{ background: 'rgba(192,82,42,0.10)', color: '#C0522A' }}
                  >
                    {events.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingSpinner />
                </motion.div>

              ) : events.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {/* Animated empty state */}
                  <div
                    className="rounded-3xl p-8 flex flex-col items-center text-center gap-5"
                    style={{
                      background: 'linear-gradient(160deg, #FFFFFF 0%, #FDF8F3 100%)',
                      border: '1.5px dashed rgba(192,82,42,0.25)',
                    }}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(192,82,42,0.08)' }}
                    >
                      <ChefHat className="w-8 h-8" style={{ color: '#C0522A' }} strokeWidth={1.5} />
                    </motion.div>
                    <div>
                      <p className="font-bold text-base mb-1" style={{ color: '#1C1A17' }}>
                        {hasFilters ? 'לא נמצאו ארוחות' : 'אין ארוחות זמינות כרגע'}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: '#786C63' }}>
                        {hasFilters
                          ? 'נסה לשנות את הסינון או לנקות אותו'
                          : 'הפלטפורמה גדלה בכל יום — חזור מחר, או פרסם בעצמך'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      {hasFilters && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={spring}
                          onClick={() => setFilters({ kashrut: [], religious: '', city: '', eventType: '' })}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: 'rgba(192,82,42,0.10)', color: '#C0522A' }}
                        >
                          נקה סינונים
                        </motion.button>
                      )}
                      <Link to="/create-event" className="w-full">
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(192,82,42,0.30)' }}
                          whileTap={{ scale: 0.97 }}
                          transition={spring}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg, #C0522A, #8C3318)', boxShadow: '0 4px 16px rgba(192,82,42,0.25)' }}
                        >
                          <CalendarPlus className="w-4 h-4" />
                          פרסם ארוחה
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>

              ) : (
                <motion.div
                  key="events"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {events.map(event => (
                    <motion.div key={event.id} variants={staggerItem}>
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
