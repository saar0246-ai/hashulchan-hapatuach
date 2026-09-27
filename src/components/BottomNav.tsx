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
    { to: '/home', icon: Home, label: 'גלה' },
    { to: '/my-bookings', icon: BookOpen, label: 'הזמנותיי' },
    { to: '/create-event', icon: CalendarPlus, label: 'פרסם' },
    { to: '/notifications', icon: Bell, label: 'התראות', badge: unreadCount },
    { to: '/profile', icon: User, label: 'פרופיל' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 h-16">
        {tabs.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-primary/15 scale-110' : ''
                }`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                  {badge != null && badge > 0 && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
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
