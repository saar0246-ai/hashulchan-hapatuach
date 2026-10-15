import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarPlus, X, UtensilsCrossed, Home as HomeIcon, Cake } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

type BezierEase = [number, number, number, number]
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import FilterBar, { type FilterState } from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import TopBar from '../components/TopBar'

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

const EASE: BezierEase = [0.22, 1, 0.36, 1]

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 } as const,
  animate:    { opacity: 1, y: 0 } as const,
  transition: { duration: 0.45, ease: EASE, delay },
})

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
}

const spring = { type: 'spring' as const, stiffness: 380, damping: 26 }

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

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'בוקר טוב'
    if (h < 17) return 'צהריים טובים'
    return 'ערב טוב'
  }

  const hasFilters = filters.kashrut.length > 0 || filters.city || filters.religious || filters.eventType || search

  return (
    <div className="relative min-h-dvh" style={{ background: '#FDFBF7' }}>

      {/* ── Ambient background orbs — Framer Motion ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700,
            top: -200, right: -250,
            background: 'radial-gradient(circle at center, rgba(245,158,11,0.26) 0%, rgba(245,158,11,0.08) 45%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{ x: [0, 50, -20, 0], y: [0, -40, 25, 0], scale: [1, 1.1, 0.93, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 550, height: 550,
            bottom: 100, left: -180,
            background: 'radial-gradient(circle at center, rgba(192,82,42,0.22) 0%, rgba(192,82,42,0.07) 50%, transparent 70%)',
            filter: 'blur(45px)',
          }}
          animate={{ x: [0, -35, 45, 0], y: [0, 55, -30, 0], scale: [1, 0.92, 1.07, 1] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'easeInOut', delay: 4 }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar logo />

        {/* ── Greeting hero ── */}
        <motion.div
          {...fadeUp(0.05)}
          className="px-5 pt-6 pb-5 relative overflow-hidden"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <div
            className="absolute inset-0 pointer-events-none select-none flex items-center justify-end pr-4"
            aria-hidden
          >
            <motion.span
              key={events.length}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-black leading-none"
              style={{ fontSize: 'clamp(4rem, 20vw, 8rem)', color: 'rgba(192,82,42,0.06)' }}
            >
              {loading ? '' : events.length}
            </motion.span>
          </div>
          <div className="max-w-lg mx-auto md:max-w-3xl relative">
            <p className="text-muted-foreground text-sm mb-1">{greeting()},</p>
            <h1 className="font-display font-black text-2xl text-foreground leading-tight">
              {profile?.display_name ? profile.display_name : 'ברוך הבא'}
            </h1>
            <p className="text-muted-foreground text-xs mt-1.5">מצא שולחן לשישי, לחג, או לסתם ערב טוב</p>
          </div>
        </motion.div>

        <div className="max-w-lg mx-auto md:max-w-3xl px-4 pt-4">

          {/* ── Quick actions ── */}
          <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 gap-3 mb-5">
            <motion.div
              className="shulchan-card p-4"
              whileHover={{ y: -3, boxShadow: '0 14px 36px rgba(44,24,8,0.10)' }}
              transition={spring}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                  <UtensilsCrossed className="w-4 h-4 text-primary" />
                  {!loading && events.length > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{ background: 'hsl(var(--primary))' }}
                      animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    />
                  )}
                </div>
                <motion.p
                  key={events.length}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-black text-foreground"
                >
                  {events.length}
                </motion.p>
              </div>
              <p className="text-xs font-medium text-foreground">ארוחות זמינות</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">שישי, שבת וחגים</p>
            </motion.div>

            <Link to="/create-event" className="block">
              <motion.div
                className="shulchan-card p-4 h-full flex flex-col justify-between cursor-pointer"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.10), hsl(var(--primary) / 0.04))' }}
                whileHover={{ y: -3, boxShadow: '0 14px 36px rgba(192,82,42,0.14)' }}
                transition={spring}
              >
                <motion.div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'hsl(var(--primary) / 0.15)' }}
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <HomeIcon className="w-4 h-4 text-primary" />
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-primary">פרסם ארוחה</p>
                  <p className="text-xs text-muted-foreground">הפוך למארח</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* ── City quick-filter strip ── */}
          <motion.div {...fadeUp(0.12)} className="mb-3 overflow-x-auto no-scrollbar flex gap-2 pb-0.5">
            {CITIES_QUICK.map((city) => {
              const isActive = filters.city === city
              return (
                <motion.button
                  key={city}
                  onClick={() => setFilters(f => ({ ...f, city: f.city === city ? '' : city }))}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold relative"
                  style={{ color: isActive ? '#fff' : 'hsl(var(--muted-foreground))' }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                >
                  {isActive && (
                    <motion.div
                      layoutId="homeCityPill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'hsl(var(--primary))', zIndex: 0 }}
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
          </motion.div>

          {/* ── Search ── */}
          <motion.div
            {...fadeUp(0.14)}
            animate={{
              scale: searchFocused ? 1.01 : 1,
              boxShadow: searchFocused
                ? '0 4px 20px rgba(192,82,42,0.14), 0 0 0 2px rgba(192,82,42,0.18)'
                : '0 0 0 rgba(0,0,0,0)',
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
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
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>

          {/* ── Filters ── */}
          <motion.div {...fadeUp(0.16)} className="mb-5">
            <FilterBar value={filters} onChange={setFilters} />
          </motion.div>

          {/* ── Birthday wall ── */}
          <AnimatePresence>
            {birthdays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="mb-4"
              >
                <div
                  className="shulchan-card p-4 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(200,134,10,0.08), rgba(240,180,40,0.04))', borderRight: '3px solid rgba(200,134,10,0.5)' }}
                >
                  <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
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
                          <span className="text-sm font-medium text-foreground truncate flex-1">{p.display_name}</span>
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

          {/* ── Events list ── */}
          <div className="pb-4">
            <motion.div {...fadeUp(0.18)} className="flex items-center justify-between mb-3">
              <h2 className="section-title">
                {hasFilters ? 'תוצאות חיפוש' : 'ארוחות קרובות'}
              </h2>
              {events.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {events.length}
                </span>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingSpinner />
                </motion.div>
              ) : events.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState
                    icon={<UtensilsCrossed className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />}
                    title="לא נמצאו ארוחות"
                    description="נסה לשנות את הסינון, או פרסם ארוחה בעצמך"
                    action={
                      <Link to="/create-event">
                        <button className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
                          <CalendarPlus className="w-4 h-4" />
                          פרסם ארוחה
                        </button>
                      </Link>
                    }
                  />
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
