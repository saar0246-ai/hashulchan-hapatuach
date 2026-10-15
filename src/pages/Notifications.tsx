import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Check, Users, CheckCircle, XCircle, Star, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar'
import EmptyState from '../components/EmptyState'

function NotificationIcon({ type }: { type: string }) {
  const iconClass = 'w-5 h-5'
  switch (type) {
    case 'new_guest_request': return <Users className={iconClass} />
    case 'request_approved':  return <CheckCircle className={iconClass} style={{ color: '#059669' }} />
    case 'request_rejected':  return <XCircle className={iconClass} style={{ color: '#DC2626' }} />
    case 'new_rating':        return <Star className={iconClass} style={{ color: '#C8860A' }} />
    case 'event_reminder':
    case 'system':
    default:                  return <Bell className={iconClass} />
  }
}

export default function Notifications() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(user?.id)

  return (
    <div className="relative min-h-dvh" style={{ background: '#FDFBF7' }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <div className="ambient-blob absolute rounded-full" style={{
          width: 600, height: 600, top: -150, right: -200,
          background: 'radial-gradient(circle at center, rgba(245,158,11,0.18) 0%, transparent 65%)',
          filter: 'blur(50px)', animation: 'blob-drift-1 22s ease-in-out infinite',
        }} />
        <div className="ambient-blob absolute rounded-full" style={{
          width: 500, height: 500, bottom: 50, left: -150,
          background: 'radial-gradient(circle at center, rgba(200,90,50,0.14) 0%, transparent 65%)',
          filter: 'blur(45px)', animation: 'blob-drift-2 28s ease-in-out infinite',
        }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar title="התראות" right={
          unreadCount > 0 ? (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all">
              <Check className="w-3.5 h-3.5" />
              סמן הכל כנקרא
            </button>
          ) : undefined
        } />

        <div className="max-w-lg mx-auto px-4 pb-28 pt-4 space-y-3 md:max-w-2xl">
          {notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />}
              title="אין התראות"
              description="כאן יופיעו עדכונים על ארוחות, אורחים ועוד"
            />
          ) : (
            notifications.map((n, i) => (
              <motion.button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full shulchan-card p-4 text-right ${!n.read ? 'border-primary/30 bg-primary/5' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.05 }}
                whileHover={{ y: -2, boxShadow: '0 10px 28px rgba(44,24,8,0.06)' }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-muted-foreground"
                    style={{ background: 'hsl(var(--muted))' }}
                  >
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.read ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                        {n.title}
                      </p>
                      {!n.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {format(new Date(n.created_at), "d בMMM, HH:mm", { locale: he })}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
