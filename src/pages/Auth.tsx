import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/home')
    })
  }, [navigate])

  const handleRegister = async () => {
    if (!agreed) { toast.error('יש לאשר את תנאי השימוש'); return }
    if (password.length < 8) { toast.error('סיסמה חייבת לפחות 8 תווים'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
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
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">בדוק את האימייל שלך</h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            שלחנו קישור אימות לכתובת <strong>{email}</strong>.
            לחץ על הקישור כדי להפעיל את החשבון.
          </p>
        </div>
        <button
          onClick={() => setMode('login')}
          className="btn-outline px-8"
        >
          עבור לכניסה
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link to="/landing" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm">חזור</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🕯️</div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {mode === 'login' ? 'ברוך הבא בחזרה' : 'הצטרף לשולחן'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === 'login' ? 'התחבר לחשבון שלך' : 'צור חשבון חינמי'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">כתובת אימייל</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="shulchan-input pr-10"
                dir="ltr"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">סיסמה</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'לפחות 8 תווים' : '••••••••'}
                className="shulchan-input pr-10 pl-10"
                dir="ltr"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 flex-shrink-0 rounded-md border-2 mt-0.5 flex items-center justify-center transition-all ${
                  agreed ? 'bg-primary border-primary' : 'border-border'
                }`}
              >
                {agreed && <CheckCircle className="w-3 h-3 text-primary-foreground fill-current" />}
              </div>
              <span className="text-sm text-muted-foreground">
                קראתי ואני מסכים ל
                <Link to="/terms" className="text-primary underline mx-1">תנאי השימוש</Link>
                ול
                <Link to="/privacy" className="text-primary underline mx-1">מדיניות הפרטיות</Link>
              </span>
            </label>
          )}

          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading || !email || !password}
            className="w-full btn-primary py-4 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                אנא המתן...
              </span>
            ) : mode === 'login' ? 'כניסה' : 'הרשמה'}
          </button>
        </div>

        {/* Toggle mode */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'אין לך חשבון עדיין?' : 'כבר יש לך חשבון?'}
            {' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'login' ? 'הצטרף' : 'כניסה'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
