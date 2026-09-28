import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Users, Calendar, Clock, ChevronLeft, AlertTriangle, ArrowRight } from 'lucide-react'
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
import ProfileAvatar from '../components/ProfileAvatar'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'

const EVENT_TYPE_EMOJI: Record<string, string> = {
  shabbat_dinner: '🕯️',
  shabbat_lunch:  '☀️',
  holiday:        '🎉',
  weekday:        '🍽️',
}

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
        supabase.from('events').select('*, host:profiles!host_id(*)').eq('id', id).single(),
        user
          ? supabase.from('event_registrations').select('*').eq('event_id', id).eq('guest_id', user.id).maybeSingle()
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
      .select().single()
    if (error) {
      toast.error('שגיאה בהרשמה. נסה שוב.')
    } else {
      setRegistration(data)
      toast.success('בקשתך נשלחה למארח!')
      setShowForm(false)
    }
    setRegistering(false)
  }

  const handleCancel = async () => {
    if (!registration) return
    const { error } = await supabase.from('event_registrations').update({ status: 'cancelled' }).eq('id', registration.id)
    if (!error) { setRegistration({ ...registration, status: 'cancelled' }); toast.success('הבקשה בוטלה') }
  }

  if (loading) return (
    <div className="min-h-dvh page-hero flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
  if (!event) return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 p-6">
      <p className="text-muted-foreground">האירוע לא נמצא</p>
      <button onClick={() => navigate('/home')} className="btn-primary">חזור לדף הבית</button>
    </div>
  )

  const isHost = user?.id === event.host_id
  const spotsLeft = event.max_guests - event.current_guests
  const dateObj = new Date(event.event_date + 'T00:00:00')
  const fillPct = Math.min(100, (event.current_guests / event.max_guests) * 100)

  const STATUS_INFO: Record<string, { text: string; bg: string; color: string }> = {
    pending:   { text: '⏳ הבקשה ממתינה לאישור המארח', bg: 'rgba(234,179,8,0.12)', color: '#D4A017' },
    approved:  { text: '✅ אושרת! הכתובת נשלחה במייל', bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
    rejected:  { text: '❌ הבקשה לא אושרה הפעם',        bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
    cancelled: { text: '🚫 ביטלת את הבקשה',              bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  }

  return (
    <div className="min-h-dvh bg-background pb-36">

      {/* ── Dark Hero ── */}
      <div className="page-hero pb-8">
        {/* Back button */}
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            חזור
          </button>
        </div>

        <div className="max-w-lg mx-auto px-5 relative z-10">
          {/* Type label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-4xl">{EVENT_TYPE_EMOJI[event.event_type]}</span>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(212,152,12,0.2)', color: '#F5C240', border: '1px solid rgba(212,152,12,0.3)' }}
            >
              {EVENT_TYPE_LABELS[event.event_type]}
              {event.holiday_name ? ` — ${event.holiday_name}` : ''}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-2xl text-white leading-snug mb-4">
            {event.title}
          </h1>

          {/* Date / time / city */}
          <div className="flex flex-wrap gap-3 text-sm text-white/65 mb-5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(dateObj, 'EEEE, d בMMMM', { locale: he })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {event.event_time.slice(0, 5)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {event.city}
            </span>
          </div>

          {/* Capacity bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${fillPct}%`,
                  background: fillPct >= 90 ? '#ef4444' : 'linear-gradient(90deg, #C8860A, #F5C240)',
                }}
              />
            </div>
            {spotsLeft > 0
              ? <span className="text-xs text-white/70 flex-shrink-0 flex items-center gap-1"><Users className="w-3 h-3" />{spotsLeft} מקומות</span>
              : <span className="text-xs text-red-400 flex-shrink-0">מלא</span>}
          </div>
        </div>
      </div>

      {/* ── Content cards ── */}
      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4 relative z-20">

        {/* Badges */}
        <div className="stagger-1 flex flex-wrap gap-2 pt-2">
          <span className={`badge ${KASHRUT_COLORS[event.kashrut_level]}`}>
            🍽️ {KASHRUT_LABELS[event.kashrut_level]}
          </span>
          {event.preferred_religious_levels.map(r => (
            <span key={r} className={`badge ${RELIGIOUS_COLORS[r]}`}>{RELIGIOUS_LABELS[r]}</span>
          ))}
          {(event.min_age || event.max_age) && (
            <span className="badge bg-muted text-muted-foreground">
              גילאים: {event.min_age ?? 18}–{event.max_age ?? '∞'}
            </span>
          )}
        </div>

        {/* Location card */}
        <div className="stagger-2 shulchan-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.1)' }}>
              <MapPin className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <p className="text-sm font-semibold text-foreground">מיקום</p>
          </div>
          <p className="font-medium text-foreground">
            {event.city}{event.neighborhood ? `, ${event.neighborhood}` : ''}
          </p>
          {registration?.status === 'approved' ? (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-foreground font-medium">📍 {event.address}</p>
              {event.address_notes && <p className="text-xs text-muted-foreground mt-1">{event.address_notes}</p>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              הכתובת המדויקת תישלח לאחר אישור המארח
            </p>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="stagger-2 shulchan-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">על הארוחה</p>
            <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Host card */}
        {event.host && (
          <Link to={`/profile/${event.host.id}`} className="block stagger-3">
            <div className="shulchan-card p-4 shulchan-card-hover">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">המארח</p>
              <div className="flex items-center gap-3">
                <ProfileAvatar name={event.host.display_name} avatarUrl={event.host.avatar_url} size="lg" />
                <div className="flex-1">
                  <p className="font-bold text-foreground">{event.host.display_name}</p>
                  {event.host.rating_count_host > 0 && (
                    <StarRating score={Math.round(event.host.rating_as_host)} count={event.host.rating_count_host} size="md" />
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {event.host.city && <span>📍 {event.host.city}</span>}
                    <span>🍽️ {event.host.total_hosted} ארוחות</span>
                  </div>
                  {event.host.bio && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{event.host.bio}</p>
                  )}
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </Link>
        )}

        {/* Disclaimer */}
        <div className="stagger-4 shulchan-card p-4" style={{ borderRight: '3px solid rgba(234,179,8,0.6)', background: 'rgba(234,179,8,0.05)' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              האירוח הוא בין שני אנשים פרטיים. הפלטפורמה אינה אחראית לנזקים, פציעות או גניבות.
              במקרה של בעיות — פנה למשטרה.
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 glass max-w-lg mx-auto"
        style={{ borderTop: '1px solid hsl(var(--border)/0.5)', padding: '12px 16px calc(12px + env(safe-area-inset-bottom))' }}
      >
        {isHost ? (
          <Link to="/my-events">
            <button className="w-full btn-outline py-3.5 font-semibold">נהל אירוע זה</button>
          </Link>
        ) : registration ? (
          <div className="space-y-3">
            <div
              className="rounded-2xl px-4 py-3 text-sm text-center font-medium"
              style={{ background: STATUS_INFO[registration.status]?.bg, color: STATUS_INFO[registration.status]?.color }}
            >
              {STATUS_INFO[registration.status]?.text}
            </div>
            {(registration.status === 'pending' || registration.status === 'approved') && (
              <button onClick={handleCancel} className="w-full btn-secondary py-2.5 text-destructive text-sm">
                ביטול הרשמה
              </button>
            )}
            {registration.status === 'rejected' && (
              <button onClick={() => { setRegistration(null); setShowForm(true) }} className="w-full btn-outline py-2.5 text-sm">
                שלח בקשה מחדש
              </button>
            )}
          </div>
        ) : event.status !== 'active' || spotsLeft <= 0 ? (
          <button disabled className="w-full btn-primary py-3.5 opacity-50">
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
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">ביטול</button>
              <button onClick={handleRegister} disabled={registering} className="btn-gold flex-1 py-3">
                {registering
                  ? <div className="w-4 h-4 border-2 border-amber-900/40 border-t-amber-900 rounded-full animate-spin mx-auto" />
                  : 'שלח בקשה 🙋'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => user ? setShowForm(true) : navigate('/auth')}
            className="w-full btn-gold py-4 text-base"
          >
            {user ? '🙋 אני רוצה להגיע!' : 'התחבר כדי להירשם'}
          </button>
        )}
      </div>
    </div>
  )
}
