import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Star, Phone, ChevronLeft } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { EventRegistration } from '../types'
import TopBar from '../components/TopBar'
import StarRating from '../components/StarRating'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const STATUS_CONFIG = {
  pending:   { label: 'ממתין',  emoji: '⏳', border: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  text: '#D97706' },
  approved:  { label: 'מאושר', emoji: '✅', border: '#10B981', bg: 'rgba(16,185,129,0.08)',  text: '#059669' },
  rejected:  { label: 'נדחה',  emoji: '❌', border: '#EF4444', bg: 'rgba(239,68,68,0.08)',   text: '#DC2626' },
  cancelled: { label: 'בוטל',  emoji: '🚫', border: '#9CA3AF', bg: 'rgba(156,163,175,0.08)', text: '#6B7280' },
} as const

export default function MyBookings() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingModal, setRatingModal] = useState<{ eventId: string; hostId: string } | null>(null)
  const [ratingScore, setRatingScore] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)

  const fetchBookings = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('event_registrations')
      .select('*, event:events!event_id(*, host:profiles!host_id(*))')
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })
    setRegistrations(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const canRate = (reg: EventRegistration) => {
    if (!reg.event || reg.status !== 'approved') return false
    const eventDate = new Date(reg.event.event_date)
    const now = new Date()
    return now >= eventDate && now <= addDays(eventDate, 7)
  }

  const handleRate = async () => {
    if (!ratingModal || !user) return
    setRatingLoading(true)
    const { error } = await supabase.from('ratings').insert({
      event_id: ratingModal.eventId,
      rater_id: user.id,
      rated_id: ratingModal.hostId,
      role: 'as_host',
      score: ratingScore,
      comment: ratingComment.trim() || null,
    })
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'כבר דירגת ארוחה זו' : 'שגיאה בשמירת הדירוג')
    } else {
      toast.success('תודה על הדירוג! ⭐')
      setRatingModal(null)
      setRatingComment('')
      setRatingScore(5)
    }
    setRatingLoading(false)
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar title="ההזמנות שלי" />

      {/* Hero strip */}
      <div className="page-hero px-5 pt-4 pb-10">
        <div className="max-w-lg mx-auto relative z-10">
          <p className="text-white/40 text-xs mb-1">כל הבקשות שהגשת</p>
          <h2 className="font-display font-black text-2xl text-white">ההזמנות שלי</h2>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 relative z-20 pb-28">
        {loading ? <LoadingSpinner /> : registrations.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="עוד לא נרשמת לארוחה"
            description="מצא ארוחה קרובה אליך"
            action={
              <Link to="/home">
                <button className="btn-gold px-6 py-2.5 text-sm">גלה ארוחות</button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3 pt-2">
            {registrations.map(reg => {
              const event = reg.event
              if (!event) return null
              const cfg = STATUS_CONFIG[reg.status]
              const dateStr = format(new Date(event.event_date + 'T00:00:00'), "EE, d בMMM", { locale: he })

              return (
                <div
                  key={reg.id}
                  className="shulchan-card overflow-hidden"
                  style={{ borderRight: `3px solid ${cfg.border}` }}
                >
                  {/* Status header */}
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: cfg.bg }}>
                    <span className="text-xs font-bold" style={{ color: cfg.text }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(reg.created_at), "d בMMM, HH:mm", { locale: he })}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Event title & meta */}
                    <div>
                      <p className="font-bold text-foreground text-sm leading-tight">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.city}
                        </span>
                      </div>
                    </div>

                    {/* Approved: host details */}
                    {reg.status === 'approved' && event.host && (
                      <div
                        className="rounded-xl p-3 space-y-1.5"
                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
                      >
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">📍 פרטי המארח</p>
                        <p className="text-sm text-foreground font-medium">{event.address}</p>
                        {event.address_notes && (
                          <p className="text-xs text-muted-foreground">{event.address_notes}</p>
                        )}
                        {event.host.phone && (
                          <a
                            href={`tel:${event.host.phone}`}
                            className="flex items-center gap-1.5 text-sm font-semibold"
                            style={{ color: '#059669' }}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {event.host.phone}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <Link to={`/events/${event.id}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        פרטי האירוע
                        <ChevronLeft className="w-3 h-3" />
                      </Link>
                      {canRate(reg) && event.host && (
                        <button
                          onClick={() => setRatingModal({ eventId: event.id, hostId: event.host_id })}
                          className="flex items-center gap-1.5 text-xs font-bold"
                          style={{ color: '#C8860A' }}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          דרג את הארוחה
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => setRatingModal(null)}>
          <div
            className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-5"
            style={{ background: 'hsl(var(--card))', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto" />
            <h3 className="font-display font-black text-xl text-foreground text-center">דרג את הארוחה ⭐</h3>
            <div className="flex justify-center">
              <StarRating score={ratingScore} interactive onChange={setRatingScore} size="md" />
            </div>
            <textarea
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              placeholder="ספר על החוויה (אופציונלי)..."
              className="shulchan-input resize-none h-24 text-sm"
              maxLength={300}
            />
            <button onClick={handleRate} disabled={ratingLoading} className="w-full btn-gold py-4 font-bold text-base">
              {ratingLoading
                ? <div className="w-5 h-5 border-2 border-amber-900/40 border-t-amber-900 rounded-full animate-spin mx-auto" />
                : 'שלח דירוג'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
