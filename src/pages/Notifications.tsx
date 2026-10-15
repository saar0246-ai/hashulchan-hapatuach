import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Check, Users, CheckCircle, XCircle, Star, Bell } from 'lucide-react'
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
    <div className="min-h-dvh bg-background">
      <TopBar title="התראות" right={
        unreadCount > 0 ? (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all">
            <Check className="w-3.5 h-3.5" />
            סמן הכל כנקרא
          </button>
        ) : undefined
      } />

      <div className="page-container space-y-3">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />}
            title="אין התראות"
            description="כאן יופיעו עדכונים על ארוחות, אורחים ועוד"
          />
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full shulchan-card p-4 text-right transition-all hover:shadow-md ${
                !n.read ? 'border-primary/30 bg-primary/5' : ''
              }`}
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
            </button>
          ))
        )}
      </div>
    </div>
  )
}
