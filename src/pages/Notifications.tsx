import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Check, Users, CheckCircle, XCircle, Star, Bell } from 'lucide-react'
import TopBar from '../components/TopBar'
import EmptyState from '../components/EmptyState'
import { Component, type ReactNode } from 'react'

class NotificationsErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  state = { hasError: false, errorMsg: '' }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message ?? String(error) }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 100%)' }}>
          <Bell className="w-10 h-10" style={{ color: '#C0522A', opacity: 0.5 }} strokeWidth={1.5} />
          <p style={{ fontWeight: 700, fontSize: 16, color: '#1A1714' }}>שגיאה בהתראות</p>
          <p style={{ fontSize: 11, color: '#8C7060', wordBreak: 'break-all', maxWidth: 320, direction: 'ltr', textAlign: 'left' }}>
            {this.state.errorMsg}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', borderRadius: 12, background: '#C0522A', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
          >
            נסה שוב
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

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

// rgba triplets for each accent
const ICON_RGB: Record<string, string> = {
  new_guest_request: '192,82,42',
  request_approved:  '5,150,105',
  request_rejected:  '220,38,38',
  new_rating:        '200,134,10',
  event_reminder:    '30,95,165',
  system:            '140,112,96',
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

function safeFormat(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return format(d, "d בMMM, HH:mm", { locale: he })
  } catch {
    return ''
  }
}

function NotificationsInner() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(user?.id)

  return (
    <div className="relative min-h-dvh"
      style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}>

      {/* CSS keyframes for animations */}
      <style>{`
        @keyframes notif-orb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          38% { transform: translate(60px,-56px) scale(1.14); }
          66% { transform: translate(-24px,34px) scale(0.9); }
        }
        @keyframes notif-orb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          38% { transform: translate(-44px,60px) scale(0.89); }
          66% { transform: translate(52px,-36px) scale(1.12); }
        }
        @keyframes notif-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-mark-btn:hover {
          background: rgba(192,82,42,0.14) !important;
        }
      `}</style>

      {/* Luminous orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <div className="absolute rounded-full"
          style={{
            width: 700, height: 700, top: -260, right: -260,
            background: 'radial-gradient(circle at 40% 40%, rgba(248,163,22,0.34) 0%, rgba(245,140,10,0.12) 44%, transparent 68%)',
            filter: 'blur(80px)',
            animation: 'notif-orb1 26s ease-in-out infinite',
          }}
        />
        <div className="absolute rounded-full"
          style={{
            width: 560, height: 560, bottom: 40, left: -220,
            background: 'radial-gradient(circle at 58% 54%, rgba(192,82,42,0.30) 0%, rgba(180,70,30,0.10) 48%, transparent 70%)',
            filter: 'blur(72px)',
            animation: 'notif-orb2 32s ease-in-out 5s infinite',
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar title="התראות" showBack right={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="notif-mark-btn flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(192,82,42,0.09)', color: '#C0522A', border: '1px solid rgba(192,82,42,0.15)', cursor: 'pointer', transition: 'background 0.15s' }}>
              <Check className="w-3.5 h-3.5" /> סמן הכל כנקרא
            </button>
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
              const accentRgb   = ICON_RGB[n.type]   ?? '140,112,96'
              const delay = Math.min(i * 0.05, 0.25)
              return (
                <div
                  key={n.id}
                  style={{
                    opacity: 0,
                    animation: `notif-card-in 0.38s ease forwards`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <button
                    onClick={() => markRead(n.id)}
                    className="w-full rounded-2xl p-4 text-right"
                    style={{
                      ...GLASS,
                      ...(n.read ? {} : {
                        background: 'rgba(255,255,255,0.68)',
                        border: `1px solid rgba(${accentRgb},0.16)`,
                        boxShadow: `0 8px 32px rgba(${accentRgb},0.06), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)`,
                      }),
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `rgba(${accentRgb},0.07)`,
                          border: `1px solid rgba(${accentRgb},0.13)`,
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
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 inline-block"
                              style={{ background: accentColor }}
                            />
                          )}
                        </div>
                        <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#8C7060' }}>
                          {n.message}
                        </p>
                        {safeFormat(n.created_at) && (
                          <p className="text-[10px] mt-1" style={{ color: 'rgba(140,112,96,0.65)' }}>
                            {safeFormat(n.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function Notifications() {
  return (
    <NotificationsErrorBoundary>
      <NotificationsInner />
    </NotificationsErrorBoundary>
  )
}
