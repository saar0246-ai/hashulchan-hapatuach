import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useProfile } from './hooks/useProfile'
import BottomNav from './components/BottomNav'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'
import MyEvents from './pages/MyEvents'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Notifications from './pages/Notifications'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Accessibility from './pages/Accessibility'

function ThemeInit() {
  useTheme()
  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user?.id)
  const location = useLocation()

  if (loading || profileLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🕯️</span>
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/landing" state={{ from: location }} replace />
  if ((!profile || !profile.onboarding_completed) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/accessibility" element={<Accessibility />} />

        {/* Auth required */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  )
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? '/home' : '/landing'} replace />
}

function NotFound() {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="text-6xl">🍽️</div>
      <h1 className="font-display font-bold text-2xl text-foreground">העמוד לא נמצא</h1>
      <p className="text-muted-foreground text-sm">נראה שהתועית מהשולחן...</p>
      <a href="/home" className="btn-primary px-6 py-2.5 text-sm">חזור לדף הבית</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <AppRoutes />
    </BrowserRouter>
  )
}
