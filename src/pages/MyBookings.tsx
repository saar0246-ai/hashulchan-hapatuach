import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Star, Phone, ChevronLeft, UtensilsCrossed } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { EventRegistration } from '../types'
import TopBar from '../components/TopBar'
import StarRating from '../components/StarRating'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 400, damping: 28 }
const GLASS = {
  background: 'rgba(255,255,255,0.58)',
  backdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.80)',
  boxShadow: '0 8px 32px rgba(44,24,8,0.07), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)',
}

const STATUS_CONFIG = {
  pending:   { label: 'ממתין',  border: '#F59E0B', bg: 'rgba(245,158,11,0.09)',   text: '#D97706' },
  approved:  { label: 'מאושר', border: '#10B981', bg: 'rgba(16,185,129,0.09)',   text: '#059669' },
  rejected:  { label: 'נדחה',  border: '#EF4444', bg: 'rgba(239,68,68,0.09)',    text: '#DC2626' },
  cancelled: { label: 'בוטל',  border: '#9CA3AF', bg: 'rgba(156,163,175,0.09)',  text: '#6B7280' },
} as const

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ ...GLASS, animation: 'mybookings-sk 1.6s ease-in-out infinite' }}>
      <div style={{ height: 40, background: 'rgba(232,222,210,0.5)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded-full w-3/4" style={{ background: 'rgba(232,226,216,0.6)' }} />
        <div className="h-2.5 rounded-full w-1/2" style={{ background: 'rgba(240,235,228,0.5)' }} />
      </div>
    </div>
  )
}

export default function MyBookings() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading]             = useState(true)
  const [ratingModal, setRatingModal]     = useState<{ eventId: string; hostId: string } | null>(null)
  const [ratingScore, setRatingScore]     = useState(5)
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
      toast.success('תודה על הדירוג!')
      setRatingModal(null)
      setRatingComment('')
      setRatingScore(5)
    }
    setRatingLoading(false)
  }

  return (
    <div className="relative min-h-dvh"
      style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}>

      {/* Luminous orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <style>{`
          @keyframes mybookings-orb1 { 0%,100%{transform:translate(0,0)scale(1)} 38%{transform:translate(60px,-56px)scale(1.14)} 66%{transform:translate(-24px,34px)scale(0.9)} }
          @keyframes mybookings-orb2 { 0%,100%{transform:translate(0,0)scale(1)} 38%{transform:translate(-44px,60px)scale(0.89)} 66%{transform:translate(52px,-36px)scale(1.12)} }
          @keyframes mybookings-sk { 0%,100%{opacity:.5} 50%{opacity:1} }
          @keyframes mybookings-card-in { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
          .mybookings-card { transition: transform 0.18s ease; }
          .mybookings-card:hover { transform: translateY(-3px); }
        `}</style>
        <div className="absolute rounded-full" style={{
          width: 700, height: 700, top: -260, right: -260,
          background: 'radial-gradient(circle at 40% 40%, rgba(248,163,22,0.34) 0%, rgba(245,140,10,0.12) 44%, transparent 68%)',
          filter: 'blur(80px)',
          animation: 'mybookings-orb1 26s ease-in-out infinite',
        }} />
        <div className="absolute rounded-full" style={{
          width: 560, height: 560, bottom: 40, left: -220,
          background: 'radial-gradient(circle at 58% 54%, rgba(192,82,42,0.30) 0%, rgba(180,70,30,0.10) 48%, transparent 70%)',
          filter: 'blur(72px)',
          animation: 'mybookings-orb2 32s ease-in-out infinite',
        }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar title="ההזמנות שלי" />

        <div className="max-w-lg mx-auto px-4 pb-28 pt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : registrations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex flex-col items-center justify-center text-center py-16 px-6"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ ...GLASS }}>
                <UtensilsCrossed className="w-8 h-8" style={{ color: '#8C7060' }} strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1A1714', letterSpacing: '-0.015em' }}>
                עוד לא נרשמת לארוחה
              </h3>
              <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: '#8C7060' }}>
                מצא ארוחה קרובה אליך
              </p>
              <Link to="/home">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }} transition={SPRING}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#C0522A,#8C3318)', boxShadow: '0 4px 16px rgba(192,82,42,0.28)' }}>
                  גלה ארוחות
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg, idx) => {
                const event = reg.event
                if (!event) return null
                const cfg    = STATUS_CONFIG[reg.status]
                const dateStr = format(new Date(event.event_date + 'T00:00:00'), "EE, d בMMM", { locale: he })

                return (
                  <div
                    key={reg.id}
                    className="overflow-hidden rounded-2xl mybookings-card"
                    style={{ ...GLASS, borderRight: `3px solid ${cfg.border}`, animation: `mybookings-card-in ${0.2 + idx * 0.07}s cubic-bezier(0.22,1,0.36,1) both` }}
                  >
                    {/* Status band */}
                    <div className="px-4 py-2.5 flex items-center justify-between"
                      style={{ background: cfg.bg, borderBottom: '1px solid rgba(255,255,255,0.45)' }}>
                      <span className="text-xs font-bold" style={{ color: cfg.text }}>{cfg.label}</span>
                      <span className="text-[10px]" style={{ color: '#8C7060' }}>
                        {format(new Date(reg.created_at), "d בMMM, HH:mm", { locale: he })}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <p className="font-bold text-sm leading-tight" style={{ color: '#1A1714', letterSpacing: '-0.012em' }}>
                          {event.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: '#8C7060' }}>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.city}</span>
                        </div>
                      </div>

                      {reg.status === 'approved' && event.host && (
                        <div className="rounded-xl p-3 space-y-1.5"
                          style={{
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.20)',
                            backdropFilter: 'blur(10px)',
                          }}>
                          <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: '#059669' }}>
                            <MapPin className="w-3 h-3" /> פרטי המארח
                          </p>
                          <p className="text-sm font-medium" style={{ color: '#1A1714' }}>{event.address}</p>
                          {event.address_notes && (
                            <p className="text-xs" style={{ color: '#8C7060' }}>{event.address_notes}</p>
                          )}
                          {event.host.phone && (
                            <a href={`tel:${event.host.phone}`} className="flex items-center gap-1.5 text-sm font-semibold"
                              style={{ color: '#059669' }}>
                              <Phone className="w-3.5 h-3.5" />{event.host.phone}
                            </a>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <Link to={`/events/${event.id}`}
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: '#8C7060' }}>
                          פרטי האירוע<ChevronLeft className="w-3 h-3" />
                        </Link>
                        {canRate(reg) && event.host && (
                          <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
                            onClick={() => setRatingModal({ eventId: event.id, hostId: event.host_id })}
                            className="flex items-center gap-1.5 text-xs font-bold"
                            style={{ color: '#C8860A' }}>
                            <Star className="w-3.5 h-3.5 fill-current" /> דרג את הארוחה
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rating bottom sheet */}
      <AnimatePresence>
        {ratingModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(20,12,6,0.72)' }}
            onClick={() => setRatingModal(null)}
          >
            <div
              className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-5"
              style={{
                background: 'rgba(253,249,243,0.95)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 -20px 64px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.96)',
                border: '1px solid rgba(255,255,255,0.88)',
                animation: 'sheet-slide-up 0.35s cubic-bezier(0.22,1,0.36,1) both',
              }}
              onClick={e => e.stopPropagation()}
            >
              <style>{`@keyframes sheet-slide-up { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
              <div className="w-10 h-1 rounded-full mx-auto" style={{ background: 'rgba(120,108,99,0.28)' }} />
              <h3 className="font-display font-black text-xl text-center"
                style={{ color: '#1A1714', letterSpacing: '-0.022em' }}>
                דרג את הארוחה
              </h3>
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
              <motion.button
                onClick={handleRate} disabled={ratingLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }} transition={SPRING}
                className="w-full py-4 font-bold text-base text-white rounded-2xl"
                style={{ background: 'linear-gradient(135deg,#C8860A,#9A6005)', boxShadow: '0 4px 18px rgba(200,134,10,0.30)' }}>
                {ratingLoading
                  ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                  : 'שלח דירוג'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
