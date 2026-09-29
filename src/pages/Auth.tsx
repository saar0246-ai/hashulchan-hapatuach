import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, CheckCircle, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  // Navigate away as soon as a session exists (covers email-confirm redirect + immediate signups)
  useEffect(() => {
    if (!authLoading && user) navigate('/home', { replace: true })
  }, [user, authLoading, navigate])

  const handleRegister = async () => {
    if (!agreed) { toast.error('יש לאשר את תנאי השימוש'); return }
    if (password.length < 8) { toast.error('סיסמה חייבת לפחות 8 תווים'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    })
    if (error) {
      toast.error(error.message === 'User already registered' ? 'המייל כבר רשום. נסה להתחבר.' : error.message)
    } else {
      setMode('verify')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'מייל או סיסמה שגויים' : error.message)
    } else if (data.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.session.user.id)
        .single()
      navigate(profile?.onboarding_completed ? '/home' : '/onboarding')
    }
    setLoading(false)
  }

  /* ── Verify screen ── */
  if (mode === 'verify') {
    return (
      <div className="min-h-dvh page-hero flex flex-col items-center justify-center px-6 text-center gap-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, rgba(212,152,12,0.25), rgba(212,152,12,0.1))',
          border: '2px solid rgba(212,152,12,0.5)',
        }}>
          <CheckCircle className="w-9 h-9" style={{ color: '#F5C240' }} />
        </div>
        <div>
          <h1 className="font-display font-black text-3xl text-white mb-3">בדוק את המייל</h1>
          <p className="text-white/60 text-sm max-w-xs leading-relaxed">
            שלחנו קישור אימות ל-<span className="text-white font-medium">{email}</span>.
            לחץ על הקישור להפעלת החשבון.
          </p>
        </div>
        <button onClick={() => setMode('login')} className="btn-gold px-10 py-3.5 text-base">
          עבור לכניסה
        </button>
      </div>
    )
  }

  /* ── Login / Register ── */
  return (
    <div className="min-h-dvh page-hero flex flex-col">

      {/* Back */}
      <div className="px-5 pt-5 pb-2">
        <Link
          to="/landing"
          className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          חזור
        </Link>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center pt-6 pb-8 px-6">
        <div className="text-5xl mb-4">🕯️</div>
        <h1 className="font-display font-black text-2xl text-gold-gradient mb-1">
          Open Table
        </h1>
        <p className="text-white/50 text-xs tracking-wide">השולחן הפתוח</p>
      </div>

      {/* Card form */}
      <div className="flex-1 mx-4 mb-6">
        <div
          className="rounded-3xl p-6 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="text-center mb-2">
            <h2 className="font-bold text-xl text-white">
              {mode === 'login' ? 'ברוך הבא בחזרה' : 'הצטרף לשולחן'}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              {mode === 'login' ? 'התחבר לחשבון שלך' : 'צור חשבון חינמי'}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wide">
              אימייל
            </label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="shulchan-input-dark w-full pr-10"
                dir="ltr"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wide">
              סיסמה
            </label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'לפחות 8 תווים' : '••••••••'}
                className="shulchan-input-dark w-full pr-10 pl-10"
                dir="ltr"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms */}
          {mode === 'register' && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div
                onClick={() => setAgreed(!agreed)}
                className="w-5 h-5 flex-shrink-0 rounded-md mt-0.5 flex items-center justify-center transition-all"
                style={{
                  background: agreed ? 'linear-gradient(135deg, #C8860A, #F0B428)' : 'rgba(255,255,255,0.1)',
                  border: agreed ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                }}
              >
                {agreed && <CheckCircle className="w-3.5 h-3.5 text-amber-900" />}
              </div>
              <span className="text-xs text-white/55 leading-relaxed">
                קראתי ואני מסכים ל
                <Link to="/terms" className="text-yellow-400/80 underline mx-1 hover:text-yellow-300">תנאי השימוש</Link>
                ול
                <Link to="/privacy" className="text-yellow-400/80 underline mx-1 hover:text-yellow-300">מדיניות הפרטיות</Link>
              </span>
            </label>
          )}

          {/* CTA */}
          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading || !email || !password}
            className="w-full btn-gold py-4 text-base mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-amber-900/40 border-t-amber-900 rounded-full animate-spin" />
                אנא המתן...
              </span>
            ) : mode === 'login' ? 'כניסה לחשבון' : 'הצטרף עכשיו — חינם'}
          </button>

          {/* Toggle */}
          <p className="text-center text-sm text-white/45">
            {mode === 'login' ? 'אין לך חשבון עדיין?' : 'כבר יש לך חשבון?'}
            {' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-yellow-400/80 font-semibold hover:text-yellow-300 transition-colors"
            >
              {mode === 'login' ? 'הצטרף' : 'כניסה'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
