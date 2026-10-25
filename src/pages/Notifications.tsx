import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Check, Users, CheckCircle, XCircle, Star, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar'
import EmptyState from '../components/EmptyState'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 400, damping: 28 }
const GLASS = {
  background: 'rgba(255,255,255,0.94)',
  border: '1px solid rgba(255,255,255,0.80)',
  boxShadow: '0 8px 32px rgba(44,24,8,0.07), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)',
}

const ICON_COLOR: Record<string, string> = {
  new_guest_request: '#C0522A',
  request_approved:  '#059669',
  request_rejected:  '#DC2626',
  new_rating:        '#C8860A',
  event_reminder:    '#1e5fa5',
  system:            '#8C7060',
}

function NotificationIcon({ type }: { type: string }) {
  const color = ICON_COLOR[type] ?? '#8C7060'
  const cls = 'w-5 h-5'
  switch (type) {
    case 'new_guest_request': return <Users className={cls} style={{ color }} />
    case 'request_approved':  return <CheckCircle className={cls} style={{ color }} />
    case 'request_rejected':  return <XCircle className={cls} style={{ color }} />
    case 'new_rating':        return <Star className={cls} style={{ color }} />
    default:                  return <Bell className={cls} style={{ color }} />
  }
}

export default function Notifications() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(user?.id)

  return (
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
        <TopBar title="התראות" right={
          unreadCount > 0 ? (
            <motion.button
              onClick={markAllRead}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} transition={SPRING}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(192,82,42,0.09)', color: '#C0522A', border: '1px solid rgba(192,82,42,0.15)' }}>
              <Check className="w-3.5 h-3.5" /> סמן הכל כנקרא
            </motion.button>
          ) : undefined
        } />

        <div className="max-w-lg mx-auto px-4 pb-28 pt-4 space-y-2.5 md:max-w-2xl">
          {notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8" style={{ color: '#8C7060' }} strokeWidth={1.5} />}
              title="אין התראות"
              description="כאן יופיעו עדכונים על ארוחות, אורחים ועוד"
            />
          ) : (
            notifications.map((n, i) => {
              const accentColor = ICON_COLOR[n.type] ?? '#8C7060'
              return (
                <motion.button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="w-full rounded-2xl p-4 text-right"
                  style={{
                    ...GLASS,
                    ...(n.read ? {} : {
                      background: `rgba(255,255,255,0.68)`,
                      border: `1px solid ${accentColor}28`,
                      boxShadow: `0 8px 32px ${accentColor}10, 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)`,
                    }),
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, ease: EASE, delay: i * 0.05 }}
                  whileHover={{ y: -3, boxShadow: `0 20px 52px rgba(44,24,8,0.11), inset 0 1px 0 rgba(255,255,255,0.96)` }}
                  whileTap={{ scale: 0.985 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon micro-pill */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${accentColor}12`,
                        border: `1px solid ${accentColor}20`,
                      }}>
                      <NotificationIcon type={n.type} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-snug" style={{
                          color: '#1A1714',
                          fontWeight: n.read ? 500 : 700,
                          letterSpacing: '-0.01em',
                        }}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING}
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}80` }}
                          />
                        )}
                      </div>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#8C7060' }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: 'rgba(140,112,96,0.65)' }}>
                        {format(new Date(n.created_at), "d בMMM, HH:mm", { locale: he })}
                      </p>
                    </div>
                  </div>
                </motion.button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
