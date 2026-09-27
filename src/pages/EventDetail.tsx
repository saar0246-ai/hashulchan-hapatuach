import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Users, Calendar, Clock, ChevronLeft, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Event, EventRegistration } from '../types'
import {
  KASHRUT_LABELS, KASHRUT_COLORS,
  RELIGIOUS_LABELS, RELIGIOUS_COLORS,
  EVENT_TYPE_LABELS,
} from '../types'
import TopBar from '../components/TopBar'
import ProfileAvatar from '../components/ProfileAvatar'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [registration, setRegistration] = useState<EventRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      const [{ data: ev }, { data: reg }] = await Promise.all([
        supabase
          .from('events')
          .select('*, host:profiles!host_id(*)')
          .eq('id', id)
          .single(),
        user
          ? supabase
              .from('event_registrations')
              .select('*')
              .eq('event_id', id)
              .eq('guest_id', user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ])
      setEvent(ev)
      setRegistration(reg)
      setLoading(false)
    }
    fetchData()
  }, [id, user])

  const handleRegister = async () => {
    if (!user || !event) return
    setRegistering(true)
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({ event_id: event.id, guest_id: user.id, message_to_host: message || null })
      .select()
      .single()
    if (error) {
      toast.error('שגיאה בהרשמה. נסה שוב.')
    } else {
      setRegistration(data)
      toast.success('בקשתך נשלחה למארח! תקבל עדכון בקרוב.')
      setShowForm(false)
    }
    setRegistering(false)
  }

  const handleCancel = async () => {
    if (!registration) return
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registration.id)
    if (!error) {
      setRegistration({ ...registration, status: 'cancelled' })
      toast.success('הבקשה בוטלה')
    }
  }

  if (loading) return <div className="min-h-dvh bg-background"><TopBar showBack /><LoadingSpinner /></div>
  if (!event) return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center">
      <p>האירוע לא נמצא</p>
      <button onClick={() => navigate('/home')} className="btn-primary mt-4">חזור לדף הבית</button>
    </div>
  )

  const isHost = user?.id === event.host_id
  const spotsLeft = event.max_guests - event.current_guests
  const dateObj = new Date(event.event_date + 'T00:00:00')

  const STATUS_TEXT: Record<string, { text: string; class: string }> = {
    pending: { text: 'הבקשה שלך ממתינה לאישור המארח', class: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800' },
    approved: { text: '✅ אושרת! פרטי הכתובת נשלחו במייל', class: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800' },
    rejected: { text: 'הבקשה לא אושרה הפעם', class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800' },
    cancelled: { text: 'ביטלת את הבקשה', class: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700' },
  }

  return (
    <div className="min-h-dvh bg-background pb-32">
      <TopBar showBack title={EVENT_TYPE_LABELS[event.event_type]} />

      <div className="max-w-lg mx-auto">
        {/* Hero gradient */}
        <div className="h-2 bg-gradient-to-l from-primary to-secondary" />

        <div className="px-4 pt-4 space-y-5">
          {/* Title + date */}
          <div className="stagger-1">
            <h1 className="font-display font-black text-2xl text-foreground">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(dateObj, 'EEEE, d בMMMM yyyy', { locale: he })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {event.event_time.slice(0, 5)}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="stagger-2 flex flex-wrap gap-2">
            <span className={`badge ${KASHRUT_COLORS[event.kashrut_level]}`}>
              🍽️ {KASHRUT_LABELS[event.kashrut_level]}
            </span>
            {event.preferred_religious_levels.map(r => (
              <span key={r} className={`badge ${RELIGIOUS_COLORS[r]}`}>
                {RELIGIOUS_LABELS[r]}
              </span>
            ))}
            {event.min_age || event.max_age ? (
              <span className="badge bg-muted text-muted-foreground">
                גילאים: {event.min_age ?? 18}–{event.max_age ?? '∞'}
              </span>
            ) : null}
          </div>

          {/* Location (no address for non-approved) */}
          <div className="stagger-2 shulchan-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">מיקום</span>
            </div>
            <p className="text-foreground font-medium">{event.city}{event.neighborhood ? `, ${event.neighborhood}` : ''}</p>
            {registration?.status === 'approved' ? (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-sm text-foreground">📍 {event.address}</p>
                {event.address_notes && <p className="text-xs text-muted-foreground mt-1">{event.address_notes}</p>}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">הכתובת המדויקת תישלח לאחר אישור המארח</p>
            )}
          </div>

          {/* Spots */}
          <div className="stagger-3 flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>{event.current_guests} אורחים רשומים מתוך {event.max_guests}</span>
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${(event.current_guests / event.max_guests) * 100}%` }}
              />
            </div>
            {spotsLeft > 0 ? (
              <span className="text-xs text-primary font-medium">{spotsLeft} פנויים</span>
            ) : (
              <span className="text-xs text-destructive font-medium">מלא</span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="stagger-3 shulchan-card p-4">
              <p className="text-sm font-medium text-foreground mb-2">על הארוחה</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Host */}
          {event.host && (
            <div className="stagger-4 shulchan-card p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">המארח</p>
              <Link to={`/profile/${event.host.id}`} className="flex items-center gap-3">
                <ProfileAvatar name={event.host.display_name} avatarUrl={event.host.avatar_url} size="lg" />
                <div>
                  <p className="font-semibold text-foreground">{event.host.display_name}</p>
                  {event.host.rating_count_host > 0 && (
                    <StarRating score={Math.round(event.host.rating_as_host)} count={event.host.rating_count_host} size="md" />
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {event.host.city && <span>📍 {event.host.city}</span>}
                    <span>🍽️ {event.host.total_hosted} ארוחות</span>
                  </div>
                  {event.host.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.host.bio}</p>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Disclaimer */}
          <div className="stagger-5 shulchan-card p-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/40">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                האירוח הוא בין שני אנשים פרטיים. הפלטפורמה אינה אחראית לנזקים, פציעות או גניבות.
                במקרה של בעיות — פנה למשטרה.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 p-4 glass border-t border-border/60 max-w-lg mx-auto pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {isHost ? (
          <Link to="/my-events">
            <button className="w-full btn-outline py-3.5">
              נהל אירוע זה
            </button>
          </Link>
        ) : registration ? (
          <div className="space-y-3">
            <div className={`rounded-xl p-3 border text-sm text-center ${STATUS_TEXT[registration.status]?.class ?? ''}`}>
              {STATUS_TEXT[registration.status]?.text}
            </div>
            {(registration.status === 'pending' || registration.status === 'approved') && (
              <button onClick={handleCancel} className="w-full btn-secondary py-2.5 text-sm text-destructive hover:bg-destructive/10">
                ביטול הרשמה
              </button>
            )}
            {registration.status === 'rejected' && (
              <button
                onClick={() => { setRegistration(null); setShowForm(true) }}
                className="w-full btn-outline py-2.5 text-sm"
              >
                שלח בקשה מחדש
              </button>
            )}
          </div>
        ) : event.status !== 'active' || spotsLeft <= 0 ? (
          <button disabled className="w-full btn-primary py-3.5 opacity-50 cursor-not-allowed">
            {event.status === 'cancelled' ? 'אירוע בוטל' : 'אין מקומות פנויים'}
          </button>
        ) : showForm ? (
          <div className="space-y-3">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="הצג את עצמך למארח (אופציונלי)..."
              className="shulchan-input resize-none h-20 text-sm"
              maxLength={200}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">
                <ChevronLeft className="w-4 h-4 mx-auto rotate-180" />
              </button>
              <button onClick={handleRegister} disabled={registering} className="btn-primary flex-1 py-3">
                {registering ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto" /> : 'שלח בקשה'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => user ? setShowForm(true) : navigate('/auth')} className="w-full btn-primary py-3.5 text-base font-bold">
            {user ? '🙋 אני רוצה להגיע!' : 'התחבר כדי להירשם'}
          </button>
        )}
      </div>
    </div>
  )
}
