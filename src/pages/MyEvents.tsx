import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, ChevronLeft, Clock, Users, Star } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Event, EventRegistration } from '../types'
import { EVENT_TYPE_LABELS, KASHRUT_LABELS } from '../types'
import TopBar from '../components/TopBar'
import GuestCard from '../components/GuestCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import StarRating from '../components/StarRating'

export default function MyEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [guestRatingModal, setGuestRatingModal] = useState<{ eventId: string; guestId: string; guestName: string } | null>(null)
  const [guestRatingScore, setGuestRatingScore] = useState(5)
  const [guestRatingComment, setGuestRatingComment] = useState('')
  const [guestRatingLoading, setGuestRatingLoading] = useState(false)

  const fetchEvents = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', user.id)
      .order('event_date', { ascending: false })
    setEvents(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const fetchRegistrations = useCallback(async (eventId: string) => {
    const { data } = await supabase
      .from('event_registrations')
      .select('*, guest:profiles!guest_id(*)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    setRegistrations(data ?? [])
  }, [])

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    fetchRegistrations(event.id)
  }

  const handleApprove = async (registrationId: string) => {
    setActionLoading(true)
    const reg = registrations.find(r => r.id === registrationId)
    if (!reg || !selectedEvent) return

    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'approved', responded_at: new Date().toISOString() })
      .eq('id', registrationId)

    if (error) {
      toast.error('שגיאה באישור האורח')
    } else {
      setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status: 'approved' } : r))

      // Trigger email notification
      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'guest_approved',
          registration_id: registrationId,
        },
      })

      // Update current_guests count
      await supabase
        .from('events')
        .update({ current_guests: selectedEvent.current_guests + 1 })
        .eq('id', selectedEvent.id)

      setSelectedEvent(e => e ? { ...e, current_guests: e.current_guests + 1 } : e)
      toast.success('האורח אושר! נשלח לו מייל עם הכתובת.')
    }
    setActionLoading(false)
  }

  const handleReject = async (registrationId: string) => {
    setActionLoading(true)
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', registrationId)

    if (error) {
      toast.error('שגיאה בדחיית האורח')
    } else {
      setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status: 'rejected' } : r))

      await supabase.functions.invoke('send-notification-email', {
        body: { type: 'guest_rejected', registration_id: registrationId },
      })

      toast.success('הבקשה נדחתה.')
    }
    setActionLoading(false)
  }

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('האם לבטל את האירוע? פעולה זו לא ניתנת לביטול.')) return
    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', eventId)
    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'cancelled' } : e))
      if (selectedEvent?.id === eventId) setSelectedEvent(e => e ? { ...e, status: 'cancelled' } : e)
      toast.success('האירוע בוטל')
    }
  }

  const canRateGuest = (reg: EventRegistration) => {
    if (!selectedEvent || reg.status !== 'approved') return false
    const eventDate = new Date(selectedEvent.event_date)
    const now = new Date()
    return now >= eventDate && now <= addDays(eventDate, 7)
  }

  const handleRateGuest = async () => {
    if (!guestRatingModal || !user) return
    setGuestRatingLoading(true)
    const { error } = await supabase.from('ratings').insert({
      event_id: guestRatingModal.eventId,
      rater_id: user.id,
      rated_id: guestRatingModal.guestId,
      role: 'as_guest',
      score: guestRatingScore,
      comment: guestRatingComment.trim() || null,
    })
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'כבר דירגת אורח זה' : 'שגיאה בשמירת הדירוג')
    } else {
      toast.success('תודה על הדירוג! ⭐')
      setGuestRatingModal(null)
      setGuestRatingComment('')
      setGuestRatingScore(5)
    }
    setGuestRatingLoading(false)
  }

  const pendingCount = registrations.filter(r => r.status === 'pending').length
  const approvedCount = registrations.filter(r => r.status === 'approved').length

  return (
    <>
    <div className="min-h-dvh bg-background">
      <TopBar title="הארוחות שלי" />

      <div className="page-container space-y-4">
        {/* Event list or selected */}
        {!selectedEvent ? (
          <>
            <div className="flex items-center justify-between stagger-1">
              <h2 className="section-title">הארוחות שפרסמתי</h2>
              <Link to="/create-event">
                <button className="flex items-center gap-1.5 text-sm text-primary font-medium">
                  <CalendarPlus className="w-4 h-4" />
                  חדשה
                </button>
              </Link>
            </div>

            {loading ? <LoadingSpinner /> : events.length === 0 ? (
              <EmptyState
                icon="🏠"
                title="עוד לא פרסמת ארוחה"
                description="פתח את ביתך לאורחים חדשים!"
                action={
                  <Link to="/create-event">
                    <button className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                      <CalendarPlus className="w-4 h-4" />
                      פרסם ארוחה ראשונה
                    </button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {events.map(event => {
                  const dateStr = format(new Date(event.event_date + 'T00:00:00'), 'd בMMM', { locale: he })
                  const statusColor = {
                    active: 'text-emerald-600',
                    full: 'text-amber-600',
                    cancelled: 'text-red-500',
                    completed: 'text-muted-foreground',
                  }[event.status]
                  const statusLabel = {
                    active: 'פעיל',
                    full: 'מלא',
                    cancelled: 'בוטל',
                    completed: 'הסתיים',
                  }[event.status]

                  return (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className="shulchan-card p-4 w-full text-right hover:shadow-md active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">{event.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dateStr} • {event.event_time.slice(0, 5)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.current_guests}/{event.max_guests}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs badge bg-muted text-muted-foreground">
                              {KASHRUT_LABELS[event.kashrut_level]}
                            </span>
                            <span className="text-xs badge bg-muted text-muted-foreground">
                              {EVENT_TYPE_LABELS[event.event_type]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
                          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              כל הארוחות
            </button>

            {/* Event header */}
            <div className="shulchan-card p-4 space-y-2">
              <h2 className="font-display font-bold text-lg text-foreground">{selectedEvent.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{format(new Date(selectedEvent.event_date + 'T00:00:00'), 'd בMMM yyyy', { locale: he })}</span>
                <span>{selectedEvent.event_time.slice(0, 5)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full"
                    style={{ width: `${(selectedEvent.current_guests / selectedEvent.max_guests) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedEvent.current_guests}/{selectedEvent.max_guests}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {pendingCount} ממתינים
                </span>
                <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {approvedCount} מאושרים
                </span>
              </div>

              {selectedEvent.status === 'active' && (
                <button
                  onClick={() => handleCancelEvent(selectedEvent.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  ביטול האירוע
                </button>
              )}
            </div>

            {/* Guests */}
            <div>
              <h3 className="section-title mb-3">אורחים</h3>
              {registrations.length === 0 ? (
                <EmptyState icon="👥" title="אין אורחים עדיין" description="ברגע שמישהו יירשם תקבל התראה" />
              ) : (
                <div className="space-y-3">
                  {registrations.map(reg => (
                    <div key={reg.id}>
                      <GuestCard
                        registration={reg}
                        onApprove={reg.status === 'pending' ? handleApprove : undefined}
                        onReject={reg.status === 'pending' ? handleReject : undefined}
                        loading={actionLoading}
                      />
                      {canRateGuest(reg) && reg.guest && (
                        <button
                          onClick={() => setGuestRatingModal({ eventId: selectedEvent!.id, guestId: reg.guest_id, guestName: reg.guest!.display_name })}
                          className="mt-1.5 mr-2 flex items-center gap-1.5 text-xs font-bold"
                          style={{ color: '#C8860A' }}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          דרג את {reg.guest.display_name}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    {/* Rate guest modal */}
    {guestRatingModal && (
      <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => setGuestRatingModal(null)}>
        <div
          className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-5"
          style={{ background: 'hsl(var(--card))', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-1 bg-border rounded-full mx-auto" />
          <h3 className="font-display font-black text-xl text-foreground text-center">
            דרג את {guestRatingModal.guestName} ⭐
          </h3>
          <div className="flex justify-center">
            <StarRating score={guestRatingScore} interactive onChange={setGuestRatingScore} size="md" />
          </div>
          <textarea
            value={guestRatingComment}
            onChange={e => setGuestRatingComment(e.target.value)}
            placeholder="ספר על האורח (אופציונלי)..."
            className="shulchan-input resize-none h-24 text-sm"
            maxLength={300}
          />
          <button onClick={handleRateGuest} disabled={guestRatingLoading} className="w-full btn-gold py-4 font-bold text-base">
            {guestRatingLoading
              ? <div className="w-5 h-5 border-2 border-amber-900/40 border-t-amber-900 rounded-full animate-spin mx-auto" />
              : 'שלח דירוג'}
          </button>
        </div>
      </div>
    )}
    </>
  )
}
