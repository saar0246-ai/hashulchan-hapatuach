import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarPlus, X } from 'lucide-react'
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

export default function Home() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({ kashrut: '', religious: '', city: '', eventType: '' })
  const [birthdays, setBirthdays] = useState<BirthdayProfile[]>([])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('events')
      .select('*, host:profiles!host_id(*)')
      .eq('status', 'active')
      .gt('event_date', new Date(Date.now() - 86400000).toISOString().split('T')[0])
      .order('event_date', { ascending: true })

    if (filters.kashrut)   query = query.eq('kashrut_level', filters.kashrut)
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

  const hasFilters = filters.kashrut || filters.city || filters.religious || filters.eventType || search

  return (
    <div className="min-h-dvh bg-background">
      <TopBar logo />

      {/* Greeting hero */}
      <div className="page-hero px-5 pt-5 pb-10">
        <div className="max-w-lg mx-auto relative z-10">
          <p className="text-white/50 text-sm mb-1">{greeting()},</p>
          <h1 className="font-display font-black text-2xl text-white leading-tight">
            {profile?.display_name
              ? <><span className="text-gold-gradient">{profile.display_name}</span> 👋</>
              : 'ברוך הבא 👋'}
          </h1>
          <p className="text-white/45 text-xs mt-1.5">מצא שולחן לשישי, לחג, או לסתם ערב טוב</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 relative z-20">

        {/* Quick actions */}
        <div className="stagger-1 grid grid-cols-2 gap-3 mb-5">
          <div className="shulchan-card p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🍽️</span>
              <p className="text-2xl font-black text-foreground">{events.length}</p>
            </div>
            <p className="text-xs font-medium text-foreground">ארוחות זמינות</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">שישי, שבת וחגים</p>
          </div>
          <Link to="/create-event" className="block">
            <div
              className="shulchan-card p-4 h-full flex flex-col justify-between shulchan-card-hover cursor-pointer"
              style={{ background: 'linear-gradient(135deg, hsl(347,72%,24%/0.08), hsl(347,72%,24%/0.03))' }}
            >
              <span className="text-xl">🏠</span>
              <div>
                <p className="text-sm font-bold text-primary">פרסם ארוחה</p>
                <p className="text-xs text-muted-foreground">הפוך למארח</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="stagger-2 relative mb-3">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
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
        </div>

        {/* Filters */}
        <div className="stagger-3 mb-5">
          <FilterBar value={filters} onChange={setFilters} />
        </div>

        {/* Birthday wall */}
        {birthdays.length > 0 && (
          <div className="stagger-3b mb-4">
            <div
              className="shulchan-card p-4 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(200,134,10,0.08), rgba(240,180,40,0.04))', borderRight: '3px solid rgba(200,134,10,0.5)' }}
            >
              <p className="text-sm font-bold text-foreground mb-3">🎂 ימי הולדת השבוע</p>
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
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">{p.display_name}</span>
                      </div>
                      <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#C8860A' }}>
                        {isToday ? '🎉 היום!' : dayLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Events list */}
        <div className="stagger-4 space-y-3 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="section-title">
              {hasFilters ? 'תוצאות חיפוש' : 'ארוחות קרובות'}
            </h2>
            {events.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {events.length}
              </span>
            )}
          </div>

          {loading ? <LoadingSpinner /> : events.length === 0 ? (
            <EmptyState
              icon="🍽️"
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
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
