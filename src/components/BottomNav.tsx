import { NavLink, useLocation } from 'react-router-dom'
import { Home, CalendarPlus, BookOpen, Bell, User } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../hooks/useAuth'

const HIDDEN_ON = ['/auth', '/onboarding', '/landing', '/terms', '/privacy', '/accessibility']

export default function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()
  const { unreadCount } = useNotifications(user?.id)

  if (HIDDEN_ON.some(p => location.pathname.startsWith(p))) return null

  const tabs = [
    { to: '/home',          icon: Home,         label: 'גלה' },
    { to: '/my-bookings',   icon: BookOpen,      label: 'הזמנות' },
    { to: '/create-event',  icon: CalendarPlus,  label: 'פרסם' },
    { to: '/notifications', icon: Bell,          label: 'התראות', badge: unreadCount },
    { to: '/profile',       icon: User,          label: 'פרופיל' },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]"
      style={{
        background: 'hsl(var(--card) / 0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid hsl(var(--border) / 0.5)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-[60px] px-2">
        {tabs.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-all duration-200 rounded-xl ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active pill background */}
                {isActive && (
                  <div
                    className="absolute inset-x-1 inset-y-1.5 rounded-xl"
                    style={{ background: 'hsl(var(--primary) / 0.1)' }}
                  />
                )}
                <div className="relative flex items-center justify-center w-7 h-7">
                  <Icon
                    className="w-[19px] h-[19px] transition-all duration-200"
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  {badge != null && badge > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 min-w-[16px] h-4 px-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-medium z-10 transition-all ${isActive ? 'font-bold' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
