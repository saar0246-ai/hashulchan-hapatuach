import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { Event } from '../types'
import EventCard from '../components/EventCard'
import FilterBar, { type FilterState } from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import TopBar from '../components/TopBar'

export default function Home() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({ kashrut: '', religious: '', city: '', eventType: '' })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('events')
      .select('*, host:profiles!host_id(*)')
      .eq('status', 'active')
      .gt('event_date', new Date(Date.now() - 86400000).toISOString().split('T')[0])
      .order('event_date', { ascending: true })

    if (filters.kashrut) query = query.eq('kashrut_level', filters.kashrut)
    if (filters.eventType) query = query.eq('event_type', filters.eventType)
    if (filters.city) query = query.eq('city', filters.city)
    if (filters.religious) query = query.contains('preferred_religious_levels', [filters.religious])
    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)

    const { data } = await query.limit(50)
    setEvents(data ?? [])
    setLoading(false)
  }, [filters, search])

  useEffect(() => {
    const t = setTimeout(fetchEvents, 300)
    return () => clearTimeout(t)
  }, [fetchEvents])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'בוקר טוב'
    if (h < 17) return 'צהריים טובים'
    return 'ערב טוב'
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar logo />

      <div className="page-container space-y-5">
        {/* Welcome */}
        <div className="stagger-1">
          <p className="text-sm text-muted-foreground">{greeting()},</p>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {profile?.display_name ?? 'אורח יקר'} 👋
          </h1>
        </div>

        {/* Hero quick stats */}
        <div className="stagger-2 grid grid-cols-2 gap-3">
          <div className="shulchan-card p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🍽️</span>
              <p className="text-2xl font-bold text-foreground">{events.length}</p>
            </div>
            <p className="text-xs text-muted-foreground">ארוחות זמינות</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">שישי, שבת וחגים</p>
          </div>
          <Link
            to="/create-event"
            className="shulchan-card p-4 flex flex-col justify-between active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.12), hsl(var(--primary)/0.05))' }}
          >
            <span className="text-xl">🏠</span>
            <div>
              <p className="text-sm font-bold text-primary">פרסם ארוחה</p>
              <p className="text-xs text-muted-foreground">הפוך למארח</p>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="stagger-3 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש ארוחה..."
            className="shulchan-input pr-9"
          />
        </div>

        {/* Filters */}
        <div className="stagger-4">
          <FilterBar value={filters} onChange={setFilters} />
        </div>

        {/* Events list */}
        <div className="stagger-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">ארוחות קרובות</h2>
            {events.length > 0 && (
              <span className="text-xs text-muted-foreground">{events.length} תוצאות</span>
            )}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : events.length === 0 ? (
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
            <div className="space-y-4">
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
