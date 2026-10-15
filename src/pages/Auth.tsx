import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, CheckCircle, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import BrandLogo from '../components/BrandLogo'

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

  if (mode === 'verify') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-8" style={{ background: '#FDFBF7' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
          background: 'rgba(192,82,42,0.1)',
          border: '2px solid rgba(192,82,42,0.3)',
        }}>
          <CheckCircle className="w-9 h-9" style={{ color: 'hsl(var(--primary))' }} />
        </div>
        <div>
          <h1 className="font-display font-black text-3xl text-foreground mb-3">בדוק את המייל</h1>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            שלחנו קישור אימות ל-<span className="text-foreground font-medium">{email}</span>.
            לחץ על הקישור להפעלת החשבון.
          </p>
        </div>
        <button onClick={() => setMode('login')} className="btn-gold px-10 py-3.5 text-base">
          עבור לכניסה
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#FDFBF7' }}>

      <div className="px-5 pt-5 pb-2">
        <Link
          to="/landing"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          חזור
        </Link>
      </div>

      <div className="flex flex-col items-center pt-8 pb-8 px-6">
        <BrandLogo size="lg" />
      </div>

      <div className="flex-1 mx-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-6 space-y-5"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E2D8',
            boxShadow: '0 4px 24px rgba(44,24,8,0.06)',
          }}
        >
          <div className="text-center mb-2">
            <h2 className="font-bold text-xl text-foreground">
              {mode === 'login' ? 'ברוך הבא בחזרה' : 'הצטרף לשולחן'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'login' ? 'התחבר לחשבון שלך' : 'צור חשבון חינמי'}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">
              אימייל
            </label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="shulchan-input w-full pr-10"
                dir="ltr"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wide">
              סיסמה
            </label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'לפחות 8 תווים' : '••••••••'}
                className="shulchan-input w-full pr-10 pl-10"
                dir="ltr"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div
                onClick={() => setAgreed(!agreed)}
                className="w-5 h-5 flex-shrink-0 rounded-md mt-0.5 flex items-center justify-center transition-all"
                style={{
                  background: agreed ? 'hsl(var(--primary))' : 'transparent',
                  border: agreed ? 'none' : '1.5px solid #E8E2D8',
                }}
              >
                {agreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed">
                קראתי ואני מסכים ל
                <Link to="/terms" className="text-primary underline mx-1 hover:opacity-80">תנאי השימוש</Link>
                ול
                <Link to="/privacy" className="text-primary underline mx-1 hover:opacity-80">מדיניות הפרטיות</Link>
              </span>
            </label>
          )}

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

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? 'אין לך חשבון עדיין?' : 'כבר יש לך חשבון?'}
            {' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary font-semibold hover:opacity-80 transition-opacity"
            >
              {mode === 'login' ? 'הצטרף' : 'כניסה'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
