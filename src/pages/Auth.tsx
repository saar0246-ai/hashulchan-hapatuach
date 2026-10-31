import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, CheckCircle, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import BrandLogo from '../components/BrandLogo'

type BezierEase = [number, number, number, number]
const EASE: BezierEase = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 400, damping: 28 }
const GLASS = {
  background: 'rgba(255,255,255,0.58)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.80)',
  boxShadow: '0 8px 32px rgba(44,24,8,0.07), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)',
}

function Orbs() {
  return (
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
  )
}

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
      <div className="relative min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-6"
        style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}>
        <Orbs />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
          className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(192,82,42,0.12)', border: '2px solid rgba(192,82,42,0.30)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <CheckCircle className="w-9 h-9" style={{ color: '#C0522A' }} />
        </motion.div>
        <motion.div className="relative z-10"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}>
          <h1 className="font-display font-black text-3xl mb-3" style={{ color: '#1A1714', letterSpacing: '-0.022em' }}>
            בדוק את המייל
          </h1>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#8C7060' }}>
            שלחנו קישור אימות ל-<span style={{ color: '#1A1714', fontWeight: 600 }}>{email}</span>.
            לחץ על הקישור להפעלת החשבון.
          </p>
        </motion.div>

        {/* WhatsApp community invite — only for new registrants */}
        <motion.div
          className="relative z-10 w-full max-w-xs rounded-2xl p-4 text-center"
          style={{ ...GLASS, border: '1px solid rgba(37,211,102,0.30)' }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.25 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span style={{ fontSize: 22 }}>💬</span>
            <p className="font-bold text-sm" style={{ color: '#1A1714' }}>הצטרף לקבוצת הוואטסאפ</p>
          </div>
          <p className="text-xs mb-3 leading-relaxed" style={{ color: '#8C7060' }}>
            עדכונים, הזדמנויות וקהילה — כל מה שקורה בשולחן הפתוח
          </p>
          <a
            href="https://chat.whatsapp.com/J45vgvDnJhtCOUgKvpmZk8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C4E)', boxShadow: '0 4px 14px rgba(37,211,102,0.30)' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.929 1.4 5.6L0 24l6.6-1.373A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.374l-.36-.213-3.727.977.994-3.633-.234-.374A9.772 9.772 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            הצטרף עכשיו
          </a>
        </motion.div>

        <motion.button
          onClick={() => setMode('login')}
          whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(143,66,34,0.38)' }}
          whileTap={{ scale: 0.97 }} transition={SPRING}
          className="relative z-10 px-10 py-3.5 text-base font-bold text-white rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #C8860A, #9A6005)', boxShadow: '0 4px 18px rgba(200,134,10,0.28)' }}>
          עבור לכניסה
        </motion.button>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh flex flex-col"
      style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}>
      <Orbs />

      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        <div className="px-5 pt-5 pb-2">
          <Link to="/landing" className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-70 text-sm"
            style={{ color: '#8C7060' }}>
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
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-3xl p-6 space-y-5"
            style={{ ...GLASS }}
          >
            <div className="text-center mb-2">
              <h2 className="font-display font-bold text-xl" style={{ color: '#1A1714', letterSpacing: '-0.015em' }}>
                {mode === 'login' ? 'ברוך הבא בחזרה' : 'הצטרף לשולחן'}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#8C7060' }}>
                {mode === 'login' ? 'התחבר לחשבון שלך' : 'צור חשבון חינמי'}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block uppercase tracking-wide" style={{ color: '#8C7060' }}>
                אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8C7060' }} />
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
              <label className="text-xs font-semibold mb-2 block uppercase tracking-wide" style={{ color: '#8C7060' }}>
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8C7060' }} />
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
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: '#8C7060' }}
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
                    background: agreed ? '#C0522A' : 'transparent',
                    border: agreed ? 'none' : '1.5px solid rgba(140,112,96,0.40)',
                  }}
                >
                  {agreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-xs leading-relaxed" style={{ color: '#8C7060' }}>
                  קראתי ואני מסכים ל
                  <Link to="/terms" className="underline mx-1 hover:opacity-80" style={{ color: '#C0522A' }}>תנאי השימוש</Link>
                  ול
                  <Link to="/privacy" className="underline mx-1 hover:opacity-80" style={{ color: '#C0522A' }}>מדיניות הפרטיות</Link>
                </span>
              </label>
            )}

            <motion.button
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading || !email || !password}
              whileHover={{ scale: 1.02, boxShadow: '0 12px 36px rgba(143,66,34,0.42)' }}
              whileTap={{ scale: 0.98 }} transition={SPRING}
              className="w-full py-4 text-base font-bold text-white rounded-2xl mt-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C8860A, #9A6005)', boxShadow: '0 4px 18px rgba(200,134,10,0.28)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  אנא המתן...
                </span>
              ) : mode === 'login' ? 'כניסה לחשבון' : 'הצטרף עכשיו — חינם'}
            </motion.button>

            <p className="text-center text-sm" style={{ color: '#8C7060' }}>
              {mode === 'login' ? 'אין לך חשבון עדיין?' : 'כבר יש לך חשבון?'}
              {' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#C0522A' }}
              >
                {mode === 'login' ? 'הצטרף' : 'כניסה'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
