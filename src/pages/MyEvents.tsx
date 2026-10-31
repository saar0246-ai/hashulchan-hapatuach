import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, ChevronLeft, Clock, Users, Star, ArrowRight, Pencil, Check, X } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Event, EventRegistration, KashrutLevel } from '../types'
import { EVENT_TYPE_LABELS, KASHRUT_LABELS } from '../types'
import TopBar from '../components/TopBar'
import GuestCard from '../components/GuestCard'
import EmptyState from '../components/EmptyState'
import StarRating from '../components/StarRating'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 400, damping: 28 }
const GLASS = {
  background: 'rgba(255,255,255,0.58)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.80)',
  boxShadow: '0 8px 32px rgba(44,24,8,0.07), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)',
}

function SkeletonCard() {
  return (
    <motion.div className="rounded-2xl overflow-hidden p-4 space-y-2" style={{ ...GLASS }}
      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
      <div className="h-3.5 rounded-full w-2/3" style={{ background: 'rgba(232,226,216,0.7)' }} />
      <div className="h-2.5 rounded-full w-1/2" style={{ background: 'rgba(240,235,228,0.6)' }} />
      <div className="h-2 rounded-full w-1/3" style={{ background: 'rgba(245,240,234,0.5)' }} />
    </motion.div>
  )
}

export default function MyEvents() {
  const { user } = useAuth()
  const [events, setEvents]                   = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent]     = useState<Event | null>(null)
  const [registrations, setRegistrations]     = useState<EventRegistration[]>([])
  const [loading, setLoading]                 = useState(true)
  const [actionLoading, setActionLoading]     = useState(false)
  const [guestRatingModal, setGuestRatingModal] = useState<{ eventId: string; guestId: string; guestName: string } | null>(null)
  const [guestRatingScore, setGuestRatingScore] = useState(5)
  const [guestRatingComment, setGuestRatingComment] = useState('')
  const [guestRatingLoading, setGuestRatingLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    max_guests: 0,
    event_date: '',
    event_time: '',
    kashrut_level: '' as KashrutLevel,
  })

  const fetchEvents = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('events').select('*')
      .eq('host_id', user.id).order('event_date', { ascending: false })
    setEvents(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const fetchRegistrations = useCallback(async (eventId: string) => {
    const { data } = await supabase.from('event_registrations')
      .select('*, guest:profiles!guest_id(*)')
      .eq('event_id', eventId).order('created_at', { ascending: false })
    setRegistrations(data ?? [])
  }, [])

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    fetchRegistrations(event.id)
  }

  const handleApprove = async (registrationId: string) => {
    setActionLoading(true)
    const { error } = await supabase.from('event_registrations')
      .update({ status: 'approved', responded_at: new Date().toISOString() })
      .eq('id', registrationId)
    if (error) {
      toast.error('שגיאה באישור האורח')
    } else {
      setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status: 'approved' } : r))
      await supabase.functions.invoke('send-notification-email', { body: { type: 'guest_approved', registration_id: registrationId } })
      if (selectedEvent) {
        await supabase.from('events').update({ current_guests: selectedEvent.current_guests + 1 }).eq('id', selectedEvent.id)
        setSelectedEvent(e => e ? { ...e, current_guests: e.current_guests + 1 } : e)
      }
      toast.success('האורח אושר! נשלח לו מייל עם הכתובת.')
    }
    setActionLoading(false)
  }

  const handleReject = async (registrationId: string) => {
    setActionLoading(true)
    const { error } = await supabase.from('event_registrations')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', registrationId)
    if (error) {
      toast.error('שגיאה בדחיית האורח')
    } else {
      setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status: 'rejected' } : r))
      await supabase.functions.invoke('send-notification-email', { body: { type: 'guest_rejected', registration_id: registrationId } })
      toast.success('הבקשה נדחתה.')
    }
    setActionLoading(false)
  }

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('האם לבטל את האירוע? פעולה זו לא ניתנת לביטול.')) return
    const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', eventId)
    if (!error) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'cancelled' } : e))
      if (selectedEvent?.id === eventId) setSelectedEvent(e => e ? { ...e, status: 'cancelled' } : e)
      toast.success('האירוע בוטל')
    }
  }

  const startEditEvent = (event: Event) => {
    setEditForm({
      title: event.title,
      description: event.description ?? '',
      max_guests: event.max_guests,
      event_date: event.event_date,
      event_time: event.event_time.slice(0, 5),
      kashrut_level: event.kashrut_level,
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedEvent) return
    setEditSaving(true)
    const { error } = await supabase.from('events').update({
      title: editForm.title.trim(),
      description: editForm.description.trim() || null,
      max_guests: editForm.max_guests,
      event_date: editForm.event_date,
      event_time: editForm.event_time,
      kashrut_level: editForm.kashrut_level,
    }).eq('id', selectedEvent.id)
    if (error) {
      toast.error('שגיאה בשמירה: ' + error.message)
    } else {
      toast.success('האירוע עודכן!')
      await fetchEvents()
      // Update selectedEvent locally
      setSelectedEvent(e => e ? {
        ...e,
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        max_guests: editForm.max_guests,
        event_date: editForm.event_date,
        event_time: editForm.event_time,
        kashrut_level: editForm.kashrut_level,
      } : e)
      setIsEditing(false)
    }
    setEditSaving(false)
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
      event_id: guestRatingModal.eventId, rater_id: user.id, rated_id: guestRatingModal.guestId,
      role: 'as_guest', score: guestRatingScore, comment: guestRatingComment.trim() || null,
    })
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'כבר דירגת אורח זה' : 'שגיאה בשמירת הדירוג')
    } else {
      toast.success('תודה על הדירוג!')
      setGuestRatingModal(null)
      setGuestRatingComment('')
      setGuestRatingScore(5)
    }
    setGuestRatingLoading(false)
  }

  const pendingCount  = registrations.filter(r => r.status === 'pending').length
  const approvedCount = registrations.filter(r => r.status === 'approved').length

  const statusColor = { active: '#059669', full: '#D97706', cancelled: '#DC2626', completed: '#8C7060' }
  const statusLabel = { active: 'פעיל', full: 'מלא', cancelled: 'בוטל', completed: 'הסתיים' }

  return (
    <>
      <div className="relative min-h-dvh"
        style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}>

        {/* Luminous orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
          <motion.div className="absolute rounded-full"
            style={{ width: 700, height: 700, top: -260, right: -260,
              background: 'radial-gradient(circle at 40% 40%, rgba(248,163,22,0.34) 0%, rgba(245,140,10,0.12) 44%, transparent 68%)',
              filter: 'blur(80px)' }}
            animate={{ x: [0, 60, -24, 0], y: [0, -56, 34, 0], scale: [1, 1.14, 0.90, 1] }}
            transition={{ repeat: Infinity, duration: 26, ease: 'easeInOut' }}
          />
          <motion.div className="absolute rounded-full"
            style={{ width: 560, height: 560, bottom: 40, left: -220,
              background: 'radial-gradient(circle at 58% 54%, rgba(192,82,42,0.30) 0%, rgba(180,70,30,0.10) 48%, transparent 70%)',
              filter: 'blur(72px)' }}
            animate={{ x: [0, -44, 52, 0], y: [0, 60, -36, 0], scale: [1, 0.89, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 32, ease: 'easeInOut', delay: 5 }}
          />
        </div>

        <div className="relative" style={{ zIndex: 1 }}>
          <TopBar title="הארוחות שלי" />

          <div className="max-w-lg mx-auto px-4 pb-28 pt-4 space-y-4 md:max-w-2xl">
            <AnimatePresence mode="wait">
              {!selectedEvent ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold" style={{ color: '#1A1714', letterSpacing: '-0.012em' }}>
                      הארוחות שפרסמתי
                    </h2>
                    <Link to="/create-event">
                      <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} transition={SPRING}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                        style={{ background: 'rgba(192,82,42,0.10)', color: '#C0522A', border: '1px solid rgba(192,82,42,0.16)' }}>
                        <CalendarPlus className="w-3.5 h-3.5" /> חדשה
                      </motion.button>
                    </Link>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                  ) : events.length === 0 ? (
                    <EmptyState
                      icon={<CalendarPlus className="w-8 h-8" style={{ color: '#8C7060' }} strokeWidth={1.5} />}
                      title="עוד לא פרסמת ארוחה"
                      description="פתח את ביתך לאורחים חדשים!"
                      action={
                        <Link to="/create-event">
                          <motion.button
                            whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(143,66,34,0.38)' }}
                            whileTap={{ scale: 0.97 }} transition={SPRING}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl"
                            style={{ background: 'linear-gradient(135deg,#C0522A,#8C3318)', boxShadow: '0 4px 16px rgba(192,82,42,0.28)' }}>
                            <CalendarPlus className="w-4 h-4" /> פרסם ארוחה ראשונה
                          </motion.button>
                        </Link>
                      }
                    />
                  ) : (
                    <motion.div className="space-y-3"
                      initial="hidden" animate="show"
                      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}>
                      {events.map(event => {
                        const dateStr = format(new Date(event.event_date + 'T00:00:00'), 'd בMMM', { locale: he })
                        const sColor  = statusColor[event.status as keyof typeof statusColor] ?? '#8C7060'
                        const sLabel  = statusLabel[event.status as keyof typeof statusLabel] ?? event.status
                        return (
                          <motion.button
                            key={event.id}
                            onClick={() => handleSelectEvent(event)}
                            className="w-full text-right rounded-2xl p-4"
                            style={{ ...GLASS }}
                            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
                            whileHover={{ y: -3, boxShadow: '0 20px 52px rgba(44,24,8,0.11), inset 0 1px 0 rgba(255,255,255,0.96)' }}
                            whileTap={{ scale: 0.985 }}
                            transition={SPRING}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-snug" style={{ color: '#1A1714', letterSpacing: '-0.01em' }}>
                                  {event.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: '#8C7060' }}>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{dateStr} · {event.event_time.slice(0, 5)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />{event.current_guests}/{event.max_guests}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(232,226,216,0.70)', color: '#8C7060' }}>
                                    {KASHRUT_LABELS[event.kashrut_level]}
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(232,226,216,0.70)', color: '#8C7060' }}>
                                    {EVENT_TYPE_LABELS[event.event_type]}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                                <span className="text-xs font-bold" style={{ color: sColor }}>{sLabel}</span>
                                <ChevronLeft className="w-4 h-4" style={{ color: '#8C7060' }} />
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="detail"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.38, ease: EASE }}>

                  {/* Back */}
                  <motion.button
                    onClick={() => { setSelectedEvent(null); setIsEditing(false) }}
                    className="flex items-center gap-1.5 text-sm font-medium mb-4"
                    style={{ color: '#8C7060' }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                  >
                    <ArrowRight className="w-4 h-4" /> כל הארוחות
                  </motion.button>

                  {/* Event header card */}
                  <div className="rounded-2xl p-4 space-y-3 mb-4" style={{ ...GLASS }}>
                    <h2 className="font-display font-bold text-lg" style={{ color: '#1A1714', letterSpacing: '-0.02em' }}>
                      {selectedEvent.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm" style={{ color: '#8C7060' }}>
                      <span>{format(new Date(selectedEvent.event_date + 'T00:00:00'), 'd בMMM yyyy', { locale: he })}</span>
                      <span>{selectedEvent.event_time.slice(0, 5)}</span>
                    </div>

                    {/* Capacity bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(232,226,216,0.7)' }}>
                        <div className="h-full rounded-full"
                          style={{
                            width: `${(selectedEvent.current_guests / selectedEvent.max_guests) * 100}%`,
                            background: 'linear-gradient(90deg, #C0522A, #E8854A)',
                          }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#8C7060' }}>
                        {selectedEvent.current_guests}/{selectedEvent.max_guests}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.20)' }}>
                        {pendingCount} ממתינים
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.10)', color: '#059669', border: '1px solid rgba(16,185,129,0.20)' }}>
                        {approvedCount} מאושרים
                      </span>
                    </div>

                    {selectedEvent.status === 'active' && (
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleCancelEvent(selectedEvent.id)}
                          className="text-xs font-medium" style={{ color: '#DC2626' }}>
                          ביטול האירוע
                        </button>
                        <button
                          onClick={() => startEditEvent(selectedEvent)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: 'rgba(192,82,42,0.09)', color: '#C0522A', border: '1px solid rgba(192,82,42,0.15)' }}>
                          <Pencil className="w-3 h-3" /> ערוך
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline edit form */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        key="edit-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl p-4 space-y-3 mb-4" style={{ ...GLASS, border: '1px solid rgba(192,82,42,0.18)' }}>
                          <h3 className="text-sm font-bold" style={{ color: '#1A1714' }}>עריכת אירוע</h3>

                          <div>
                            <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>כותרת</label>
                            <input
                              value={editForm.title}
                              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                              className="shulchan-input text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>תיאור</label>
                            <textarea
                              value={editForm.description}
                              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                              className="shulchan-input resize-none h-20 text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>תאריך</label>
                              <input
                                type="date"
                                value={editForm.event_date}
                                onChange={e => setEditForm(f => ({ ...f, event_date: e.target.value }))}
                                className="shulchan-input text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>שעה</label>
                              <input
                                type="time"
                                value={editForm.event_time}
                                onChange={e => setEditForm(f => ({ ...f, event_time: e.target.value }))}
                                className="shulchan-input text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>
                              מקסימום אורחים (מינימום: {selectedEvent.current_guests})
                            </label>
                            <input
                              type="number"
                              min={selectedEvent.current_guests}
                              value={editForm.max_guests}
                              onChange={e => setEditForm(f => ({ ...f, max_guests: Math.max(selectedEvent!.current_guests, parseInt(e.target.value) || 1) }))}
                              className="shulchan-input text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>כשרות</label>
                            <select
                              value={editForm.kashrut_level}
                              onChange={e => setEditForm(f => ({ ...f, kashrut_level: e.target.value as KashrutLevel }))}
                              className="shulchan-input text-sm"
                            >
                              <option value="mehadrin">מהדרין</option>
                              <option value="kosher">כשר</option>
                              <option value="traditional">מסורתי</option>
                              <option value="none">לא כשר</option>
                            </select>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
                              style={{ ...GLASS, color: '#8C7060' }}>
                              <X className="w-3.5 h-3.5" /> ביטול
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              disabled={editSaving}
                              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                              style={{ background: 'linear-gradient(135deg, #C0522A, #8C3318)' }}>
                              {editSaving
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><Check className="w-3.5 h-3.5" /> שמור</>
                              }
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Guests */}
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8C7060' }}>אורחים</h3>
                  {registrations.length === 0 ? (
                    <EmptyState
                      icon={<Users className="w-8 h-8" style={{ color: '#8C7060' }} strokeWidth={1.5} />}
                      title="אין אורחים עדיין"
                      description="ברגע שמישהו יירשם תקבל התראה"
                    />
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
                            <motion.button
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
                              onClick={() => setGuestRatingModal({ eventId: selectedEvent!.id, guestId: reg.guest_id, guestName: reg.guest!.display_name })}
                              className="mt-1.5 mr-2 flex items-center gap-1.5 text-xs font-bold"
                              style={{ color: '#C8860A' }}>
                              <Star className="w-3.5 h-3.5 fill-current" /> דרג את {reg.guest.display_name}
                            </motion.button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Rate guest bottom sheet */}
      <AnimatePresence>
        {guestRatingModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(20,12,6,0.72)', backdropFilter: 'blur(4px)' }}
            onClick={() => setGuestRatingModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-5"
              style={{
                background: 'rgba(253,249,243,0.95)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                boxShadow: '0 -20px 64px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.96)',
                border: '1px solid rgba(255,255,255,0.88)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full mx-auto" style={{ background: 'rgba(120,108,99,0.28)' }} />
              <h3 className="font-display font-black text-xl text-center"
                style={{ color: '#1A1714', letterSpacing: '-0.022em' }}>
                דרג את {guestRatingModal.guestName}
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
              <motion.button
                onClick={handleRateGuest} disabled={guestRatingLoading}
                whileHover={{ scale: 1.02, boxShadow: '0 12px 36px rgba(143,66,34,0.42)' }}
                whileTap={{ scale: 0.98 }} transition={SPRING}
                className="w-full py-4 font-bold text-base text-white rounded-2xl"
                style={{ background: 'linear-gradient(135deg,#C8860A,#9A6005)', boxShadow: '0 4px 18px rgba(200,134,10,0.30)' }}>
                {guestRatingLoading
                  ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                  : 'שלח דירוג'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
