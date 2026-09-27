import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Star } from 'lucide-react'
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

const STATUS_STYLES = {
  pending: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
  approved: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
  rejected: 'border-red-300 bg-red-50 dark:bg-red-950/30',
  cancelled: 'border-border bg-muted/30',
}

const STATUS_TEXT = {
  pending: '⏳ ממתין לאישור',
  approved: '✅ מאושר!',
  rejected: '❌ לא אושר',
  cancelled: '🚫 בוטל',
}

export default function MyBookings() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingModal, setRatingModal] = useState<{ eventId: string; hostId: string; regId: string } | null>(null)
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
    const sevenDaysAfter = addDays(eventDate, 7)
    return now >= eventDate && now <= sevenDaysAfter
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
      toast.error(error.message.includes('duplicate') ? 'כבר דירגת את הארוחה הזו' : 'שגיאה בשמירת הדירוג')
    } else {
      toast.success('תודה על הדירוג!')
      setRatingModal(null)
      setRatingComment('')
      setRatingScore(5)
    }
    setRatingLoading(false)
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar title="ההזמנות שלי" />

      <div className="page-container space-y-4">
        <p className="text-sm text-muted-foreground stagger-1">
          כל הבקשות שהגשת לארוחות
        </p>

        {loading ? <LoadingSpinner /> : registrations.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="עוד לא נרשמת לארוחה"
            description="מצא ארוחה קרובה אליך"
            action={
              <Link to="/home">
                <button className="btn-primary px-6 py-2.5 text-sm">גלה ארוחות</button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {registrations.map(reg => {
              const event = reg.event
              if (!event) return null
              const dateStr = format(new Date(event.event_date + 'T00:00:00'), "EE, d בMMM", { locale: he })

              return (
                <div key={reg.id} className={`shulchan-card p-4 space-y-3 border-2 ${STATUS_STYLES[reg.status]}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm leading-tight">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
                    <span className="text-xs font-semibold flex-shrink-0">
                      {STATUS_TEXT[reg.status]}
                    </span>
                  </div>

                  {/* Approved: show host contact */}
                  {reg.status === 'approved' && event.host && (
                    <div className="bg-emerald-100/60 dark:bg-emerald-900/30 rounded-xl p-3 space-y-1">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">פרטי המארח</p>
                      <p className="text-sm text-foreground">📍 {event.address}</p>
                      {event.address_notes && <p className="text-xs text-muted-foreground">{event.address_notes}</p>}
                      {event.host.phone && (
                        <a href={`tel:${event.host.phone}`} className="text-sm text-primary font-medium flex items-center gap-1">
                          📞 {event.host.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Rating button */}
                  {canRate(reg) && event.host && (
                    <button
                      onClick={() => setRatingModal({ eventId: event.id, hostId: event.host_id, regId: reg.id })}
                      className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                    >
                      <Star className="w-4 h-4" />
                      דרג את הארוחה
                    </button>
                  )}

                  <div className="flex items-center justify-between">
                    <Link to={`/events/${event.id}`} className="text-xs text-muted-foreground underline">
                      פרטי האירוע
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reg.created_at), 'd בMMM, HH:mm', { locale: he })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rating modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setRatingModal(null)}>
          <div className="bg-card w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl text-foreground text-center">דרג את הארוחה</h3>
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
            <button
              onClick={handleRate}
              disabled={ratingLoading}
              className="w-full btn-primary py-3.5 font-semibold"
            >
              {ratingLoading
                ? <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto" />
                : 'שלח דירוג'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
