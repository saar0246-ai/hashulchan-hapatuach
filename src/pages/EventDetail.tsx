import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Users, Calendar, Clock, ChevronLeft, AlertTriangle, ArrowRight, Moon, Sun, Star, Utensils, CheckCircle, XCircle, Ban, Hourglass } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
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

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]

const EVENT_TYPE_ICON: Record<string, LucideIcon> = {
  shabbat_dinner: Moon,
  shabbat_lunch:  Sun,
  holiday:        Star,
  weekday:        Utensils,
}

const EVENT_TYPE_GRADIENT: Record<string, string> = {
  shabbat_dinner: 'linear-gradient(135deg, #C0522A 0%, #8C3318 100%)',
  shabbat_lunch:  'linear-gradient(135deg, #B87A10 0%, #7A5200 100%)',
  holiday:        'linear-gradient(135deg, #4A8C3A 0%, #2C5422 100%)',
  weekday:        'linear-gradient(135deg, #8C6240 0%, #5C3A20 100%)',
}

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 } as const,
  animate:    { opacity: 1, y: 0 } as const,
  transition: { duration: 0.42, ease: EASE, delay },
})

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE, delay: i * 0.08 },
  }),
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
    <div className="min-h-dvh flex items-center justify-center" style={{ background: '#FDFBF7' }}>
      <LoadingSpinner />
    </div>
  )
  if (!event) return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6" style={{ background: '#FDFBF7' }}>
      <p className="text-muted-foreground">האירוע לא נמצא</p>
      <button onClick={() => navigate('/home')} className="btn-primary">חזור לדף הבית</button>
    </div>
  )

  const isHost = user?.id === event.host_id
  const spotsLeft = event.max_guests - event.current_guests
  const dateObj = new Date(event.event_date + 'T00:00:00')
  const fillPct = Math.min(100, (event.current_guests / event.max_guests) * 100)

  const STATUS_INFO: Record<string, { text: string; bg: string; color: string; Icon: LucideIcon }> = {
    pending:   { text: 'הבקשה ממתינה לאישור המארח', bg: 'rgba(234,179,8,0.12)',   color: '#D4A017', Icon: Hourglass },
    approved:  { text: 'אושרת! הכתובת נשלחה במייל',  bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', Icon: CheckCircle },
    rejected:  { text: 'הבקשה לא אושרה הפעם',         bg: 'rgba(239,68,68,0.12)',  color: '#dc2626', Icon: XCircle },
    cancelled: { text: 'ביטלת את הבקשה',              bg: 'rgba(107,114,128,0.12)', color: '#6b7280', Icon: Ban },
  }

  const TypeIcon = EVENT_TYPE_ICON[event.event_type] ?? Utensils

  return (
    <div className="min-h-dvh pb-36" style={{ background: '#FDFBF7' }}>

      <div style={{ background: EVENT_TYPE_GRADIENT[event.event_type] ?? EVENT_TYPE_GRADIENT.weekday }} className="pb-8">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 transition-colors text-sm"
            style={{ color: 'rgba(255,255,255,0.60)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}
          >
            <ArrowRight className="w-4 h-4" />
            חזור
          </button>
        </div>

        <div className="max-w-lg mx-auto px-5 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <TypeIcon className="w-6 h-6 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.80)' }} strokeWidth={1.75} />
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(212,152,12,0.2)', color: '#F5C240', border: '1px solid rgba(212,152,12,0.3)' }}
            >
              {EVENT_TYPE_LABELS[event.event_type]}
              {event.holiday_name ? ` — ${event.holiday_name}` : ''}
            </span>
          </div>

          <h1 className="font-display font-black text-2xl text-white leading-snug mb-4">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-3 text-sm mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
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
              ? <span className="text-xs flex-shrink-0 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.70)' }}><Users className="w-3 h-3" />{spotsLeft} מקומות</span>
              : <span className="text-xs text-red-400 flex-shrink-0">מלא</span>}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4 relative z-20">

        <motion.div {...fadeUp(0.05)} className="flex flex-wrap gap-2 pt-2">
          <span className={`badge ${KASHRUT_COLORS[event.kashrut_level]}`}>
            {KASHRUT_LABELS[event.kashrut_level]}
          </span>
          {event.preferred_religious_levels.map(r => (
            <span key={r} className={`badge ${RELIGIOUS_COLORS[r]}`}>{RELIGIOUS_LABELS[r]}</span>
          ))}
          {(event.min_age || event.max_age) && (
            <span className="badge bg-muted text-muted-foreground">
              גילאים: {event.min_age ?? 18}–{event.max_age ?? '∞'}
            </span>
          )}
        </motion.div>

        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="shulchan-card p-4">
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
              <p className="text-sm text-foreground font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 inline-block ml-1" /> {event.address}
              </p>
              {event.address_notes && <p className="text-xs text-muted-foreground mt-1">{event.address_notes}</p>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              הכתובת המדויקת תישלח לאחר אישור המארח
            </p>
          )}
        </motion.div>

        {event.description && (
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="shulchan-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">על הארוחה</p>
            <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
          </motion.div>
        )}

        {event.host && (
          <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
            <Link to={`/profile/${event.host.id}`} className="block">
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
                      {event.host.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 inline-block ml-1" /> {event.host.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 inline-block ml-1" /> {event.host.total_hosted} ארוחות
                      </span>
                    </div>
                    {event.host.bio && (
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{event.host.bio}</p>
                    )}
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="shulchan-card p-4" style={{ borderRight: '3px solid rgba(234,179,8,0.6)', background: 'rgba(234,179,8,0.05)' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              האירוח הוא בין שני אנשים פרטיים. הפלטפורמה אינה אחראית לנזקים, פציעות או גניבות.
              במקרה של בעיות — פנה למשטרה.
            </p>
          </div>
        </motion.div>
      </div>

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
              className="rounded-2xl px-4 py-3 text-sm text-center font-medium flex items-center justify-center gap-2"
              style={{ background: STATUS_INFO[registration.status]?.bg, color: STATUS_INFO[registration.status]?.color }}
            >
              {(() => {
                const info = STATUS_INFO[registration.status]
                if (!info) return null
                const StatusIcon = info.Icon
                return (
                  <>
                    <StatusIcon className="w-4 h-4 flex-shrink-0" />
                    {info.text}
                  </>
                )
              })()}
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
                  : <><Users className="w-4 h-4 inline-block ml-1" /> שלח בקשה</>}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => user ? setShowForm(true) : navigate('/auth')}
            className="w-full btn-gold py-4 text-base"
          >
            {user ? <><Users className="w-4 h-4 inline-block ml-1" /> אני רוצה להגיע!</> : 'התחבר כדי להירשם'}
          </button>
        )}
      </div>
    </div>
  )
}
