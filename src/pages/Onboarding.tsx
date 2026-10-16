import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Camera, X } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { KashrutLevel, ReligiousLevel, Gender } from '../types'
import { KASHRUT_LABELS, RELIGIOUS_LABELS } from '../types'

const TOTAL_STEPS = 7

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

const toggleArr = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',   label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'other',  label: 'אחר' },
]

const activeBtn = {
  background: 'rgba(192,82,42,0.10)',
  border: '2px solid #C0522A',
  color: '#C0522A',
}
const inactiveBtn = {
  background: 'rgba(255,255,255,0.50)',
  border: '1.5px solid rgba(232,226,216,0.70)',
  color: '#1A1714',
}

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    display_name: '',
    birthday: '',
    gender: '' as Gender | '',
    city: '',
    neighborhood: '',
    kashrut_level: '' as KashrutLevel | '',
    religious_level: '' as ReligiousLevel | '',
    guest_kashrut_prefs: [] as KashrutLevel[],
    phone: '',
    bio: '',
    agreed_terms: false,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const update = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }))

  const computeAge = (birthday: string) => {
    if (!birthday) return 0
    const today = new Date()
    const bday = new Date(birthday + 'T00:00:00')
    let age = today.getFullYear() - bday.getFullYear()
    const m = today.getMonth() - bday.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--
    return age
  }

  const canNext = () => {
    if (step === 1) return form.display_name.trim().length >= 2 && computeAge(form.birthday) >= 18 && !!form.gender
    if (step === 2) return form.city.trim().length >= 2
    if (step === 3) return !!form.kashrut_level && !!form.religious_level && form.phone.trim().length >= 9
    if (step === 7) return form.agreed_terms
    return true
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('התמונה גדולה מדי — מקסימום 5MB'); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = e => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleFinish = async () => {
    if (!user) return
    setLoading(true)

    let avatarUrl: string | null = null
    if (avatarFile) {
      const { data: up, error: upErr } = await supabase.storage
        .from('avatars')
        .upload(user.id, avatarFile, { upsert: true, contentType: avatarFile.type })
      if (!upErr && up) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(user.id)
        avatarUrl = urlData.publicUrl
      }
    }

    const upsertPayload: Record<string, unknown> = {
      id: user.id,
      display_name: form.display_name.trim(),
      birthday: form.birthday || null,
      gender: form.gender || null,
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || null,
      kashrut_level: form.kashrut_level || null,
      religious_level: form.religious_level || null,
      phone: form.phone.trim(),
      bio: form.bio.trim() || null,
      onboarding_completed: true,
      role: 'user',
      is_banned: false,
      verified: false,
      rating_as_host: 0, rating_count_host: 0,
      rating_as_guest: 0, rating_count_guest: 0,
      total_hosted: 0, total_guested: 0,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      guest_kashrut_prefs: form.guest_kashrut_prefs.length > 0 ? form.guest_kashrut_prefs : null,
    }

    let { error } = await supabase
      .from('profiles')
      .upsert(upsertPayload, { onConflict: 'id' })

    if (error && error.message?.includes('guest_kashrut_prefs')) {
      const { guest_kashrut_prefs: _drop, ...withoutNew } = upsertPayload
      const fallback = await supabase.from('profiles').upsert(withoutNew, { onConflict: 'id' })
      error = fallback.error
    }

    if (error) {
      toast.error('שגיאה בשמירת הפרופיל: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('ברוך הבא לשולחן הפתוח! 🎉')
    await new Promise(r => setTimeout(r, 400))
    navigate('/home', { replace: true })
    setLoading(false)
  }

  return (
    <div className="relative min-h-dvh flex flex-col max-w-md mx-auto"
      style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}>

      {/* Luminous orbs */}
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

      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        {/* Progress bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#1A1714' }}>שלב {step} מתוך {TOTAL_STEPS}</span>
            <span className="text-sm" style={{ color: '#8C7060' }}>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(232,226,216,0.60)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #C0522A, #E8854A)' }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
        </div>

        <div className="flex-1 px-6 pb-8 overflow-y-auto">

          {/* ── Step 1: Basic info ── */}
          {step === 1 && (
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#1A1714', letterSpacing: '-0.018em' }}>ספר לנו עליך</h2>
                <p className="text-sm mt-1" style={{ color: '#8C7060' }}>פרטים בסיסיים לפרופיל שלך</p>
              </div>
              <div className="rounded-2xl p-4 space-y-4" style={{ ...GLASS }}>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>שם להצגה *</label>
                  <input value={form.display_name} onChange={e => update('display_name', e.target.value)}
                    placeholder="ישראל ישראלי" className="shulchan-input" maxLength={40} />
                  <p className="text-xs mt-1" style={{ color: '#8C7060' }}>השם שיראו מארחים ואורחים</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>תאריך לידה *</label>
                  <input type="date" value={form.birthday} onChange={e => update('birthday', e.target.value)}
                    className="shulchan-input"
                    max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] })()}
                    min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 120); return d.toISOString().split('T')[0] })()}
                  />
                  <p className="text-xs mt-1" style={{ color: '#8C7060' }}>חייב להיות מעל 18</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#1A1714' }}>מגדר *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDER_OPTIONS.map(g => (
                      <button key={g.value} type="button" onClick={() => update('gender', g.value)}
                        className="p-3 rounded-xl text-sm font-medium transition-all"
                        style={form.gender === g.value ? activeBtn : inactiveBtn}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Location ── */}
          {step === 2 && (
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#1A1714', letterSpacing: '-0.018em' }}>איפה אתה גר?</h2>
                <p className="text-sm mt-1" style={{ color: '#8C7060' }}>יעזור למצוא אירועים קרובים אליך</p>
              </div>
              <div className="rounded-2xl p-4 space-y-4" style={{ ...GLASS }}>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>עיר *</label>
                  <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="ירושלים" className="shulchan-input" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>שכונה (אופציונלי)</label>
                  <input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)}
                    placeholder="קטמון, טלביה..." className="shulchan-input" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Table settings ── */}
          {step === 3 && (
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#1A1714', letterSpacing: '-0.018em' }}>הגדרות שולחן</h2>
                <p className="text-sm mt-1" style={{ color: '#8C7060' }}>כדי להתאים אותך לארוחות המתאימות</p>
              </div>
              <div className="rounded-2xl p-4 space-y-4" style={{ ...GLASS }}>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#1A1714' }}>רמת כשרות שלי *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => (
                      <button key={k} type="button" onClick={() => update('kashrut_level', k)}
                        className="p-3 rounded-xl text-sm font-medium transition-all"
                        style={form.kashrut_level === k ? activeBtn : inactiveBtn}>
                        {KASHRUT_LABELS[k]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#1A1714' }}>השתייכות דתית *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(RELIGIOUS_LABELS) as ReligiousLevel[]).map(r => (
                      <button key={r} type="button" onClick={() => update('religious_level', r)}
                        className="p-3 rounded-xl text-sm font-medium transition-all text-right"
                        style={form.religious_level === r ? activeBtn : inactiveBtn}>
                        {RELIGIOUS_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>מספר טלפון *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="050-0000000" className="shulchan-input" dir="ltr" />
                  <p className="text-xs mt-1" style={{ color: '#8C7060' }}>יועבר רק לאורחים שאישרת</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Attendance preferences ── */}
          {step === 4 && (
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#1A1714', letterSpacing: '-0.018em' }}>העדפות השתתפות</h2>
                <p className="text-sm mt-1" style={{ color: '#8C7060' }}>באילו סוגי ארוחות תרצה להשתתף?</p>
              </div>
              <div className="rounded-2xl p-4 space-y-3" style={{ ...GLASS }}>
                <label className="text-sm font-medium block" style={{ color: '#1A1714' }}>
                  רמות כשרות שמתאימות לי כאורח (ניתן לבחור כמה)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => (
                    <button key={k} type="button"
                      onClick={() => setForm(f => ({ ...f, guest_kashrut_prefs: toggleArr(f.guest_kashrut_prefs, k) }))}
                      className="p-3 rounded-xl text-sm font-medium transition-all"
                      style={form.guest_kashrut_prefs.includes(k) ? activeBtn : inactiveBtn}>
                      {KASHRUT_LABELS[k]}
                    </button>
                  ))}
                </div>
                <p className="text-xs" style={{ color: '#8C7060' }}>לא חובה — ניתן לשנות בהגדרות הפרופיל</p>
              </div>
              <div className="rounded-2xl p-4"
                style={{ ...GLASS, background: 'rgba(192,82,42,0.06)', border: '1px solid rgba(192,82,42,0.14)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#1A1714' }}>מה זה עושה?</p>
                <p className="text-xs leading-relaxed" style={{ color: '#8C7060' }}>
                  דף הבית יציג אוטומטית רק ארוחות ברמות הכשרות שבחרת. אפשר תמיד לסנן ידנית.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Bio ── */}
          {step === 5 && (
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#1A1714', letterSpacing: '-0.018em' }}>קצת עלייך</h2>
                <p className="text-sm mt-1" style={{ color: '#8C7060' }}>ספר לאורחים ומארחים מי אתה</p>
              </div>
              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>ביוגרפיה קצרה (אופציונלי)</label>
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
                  placeholder="שמי ישראל, אוהב לארח ולהכיר אנשים חדשים. מבשל פסטה מעולה ויש לי שולחן לשמונה..."
                  className="shulchan-input resize-none h-28" maxLength={300} />
                <p className="text-xs mt-1" style={{ color: '#8C7060' }}>{form.bio.length}/300</p>
              </div>
              <div className="rounded-2xl p-4"
                style={{ ...GLASS, background: 'rgba(192,82,42,0.06)', border: '1px solid rgba(192,82,42,0.14)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#1A1714' }}>טיפ</p>
                <p className="text-xs" style={{ color: '#8C7060' }}>
                  מארחים שמוסיפים ביוגרפיה מקבלים 3 פעמים יותר אורחים
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 6: Photo ── */}
          {step === 6 && (
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#1A1714', letterSpacing: '-0.018em' }}>תמונת פרופיל</h2>
                <p className="text-sm mt-1" style={{ color: '#8C7060' }}>תמונה יוצרת אמון ומגדילה את הסיכוי לאישור</p>
              </div>

              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  {avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="preview"
                        className="w-28 h-28 rounded-full object-cover"
                        style={{ boxShadow: '0 0 0 4px rgba(192,82,42,0.20)' }} />
                      <button
                        onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="w-28 h-28 rounded-full flex items-center justify-center font-bold text-4xl"
                      style={{ background: 'rgba(192,82,42,0.12)', border: '2px solid rgba(192,82,42,0.20)' }}>
                      {form.display_name.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />
                <motion.button type="button" onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl"
                  style={{ ...GLASS, color: '#C0522A' }}>
                  <Camera className="w-4 h-4" />
                  {avatarPreview ? 'החלף תמונה' : 'בחר תמונה'}
                </motion.button>
              </div>

              <div className="rounded-2xl p-4"
                style={{ ...GLASS, background: 'rgba(192,82,42,0.06)', border: '1px solid rgba(192,82,42,0.14)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#1A1714' }}>טיפ</p>
                <p className="text-xs leading-relaxed" style={{ color: '#8C7060' }}>
                  פרופילים עם תמונה מקבלים 5 פעמים יותר אישורים ממארחים. אפשר לדלג ולהוסיף תמונה מאוחר יותר מהפרופיל.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 7: Terms ── */}
          {step === 7 && (
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#1A1714', letterSpacing: '-0.018em' }}>כמעט שם!</h2>
                <p className="text-sm mt-1" style={{ color: '#8C7060' }}>אשר את תנאי השימוש כדי להצטרף</p>
              </div>

              <div className="rounded-2xl p-4 space-y-3 max-h-64 overflow-y-auto text-sm" style={{ ...GLASS, color: '#8C7060' }}>
                <p className="font-semibold" style={{ color: '#1A1714' }}>תנאי שימוש עיקריים</p>
                <p>• הפלטפורמה חינמית לחלוטין — לא גובים תשלום ממארחים או אורחים.</p>
                <p>• כל הפגישות הן בין אנשים פרטיים ועל אחריותם המלאה.</p>
                <p>• <strong style={{ color: '#1A1714' }}>אחריות המארח:</strong> המארח אחראי בלעדית לאירוח, לבטיחות הכנת האוכל ולסביבה תקינה.</p>
                <p>• <strong style={{ color: '#1A1714' }}>אחריות האורח:</strong> האורח אחראי להתנהגותו. גרימת נזק — פניה למשטרה.</p>
                <p>• הפלטפורמה אינה אחראית לנזקי גוף, נזקי רכוש, גניבה, פציעה או כל נזק אחר.</p>
                <p>• אסור לפרסם מידע שקרי. הפרה = מחיקת חשבון מיידית.</p>
                <p>• שני הצדדים מתחייבים להתנהג בכבוד הדדי.</p>
                <p>• <a href="/terms" style={{ color: '#C0522A' }} className="underline">לתקנון המלא לחץ כאן</a></p>
              </div>

              <motion.label
                className="flex items-start gap-3 cursor-pointer rounded-2xl p-4"
                style={{ ...GLASS, border: form.agreed_terms ? '1.5px solid #C0522A' : '1px solid rgba(255,255,255,0.80)' }}
                whileHover={{ y: -1 }} transition={SPRING}>
                <div
                  onClick={() => update('agreed_terms', !form.agreed_terms)}
                  className="w-6 h-6 flex-shrink-0 rounded-lg mt-0.5 flex items-center justify-center transition-all"
                  style={form.agreed_terms ? {
                    background: '#C0522A', border: 'none',
                  } : {
                    border: '1.5px solid rgba(140,112,96,0.40)', background: 'transparent',
                  }}>
                  {form.agreed_terms && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1A1714' }}>קראתי ומאשר את התנאים</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8C7060' }}>אני מבין שהפלטפורמה אינה אחראית לנזקים כלשהם</p>
                </div>
              </motion.label>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-8 pt-4 flex gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.60)' }}>
          {step > 1 && (
            <motion.button onClick={() => setStep(s => s - 1)}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={SPRING}
              className="px-4 rounded-2xl flex items-center justify-center"
              style={{ ...GLASS }}>
              <ChevronRight className="w-4 h-4" style={{ color: '#8C7060' }} />
            </motion.button>
          )}
          <motion.button
            onClick={step < TOTAL_STEPS ? () => setStep(s => s + 1) : handleFinish}
            disabled={!canNext() || loading}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 36px rgba(143,66,34,0.42)' }}
            whileTap={{ scale: 0.98 }} transition={SPRING}
            className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #C0522A, #8C3318)', boxShadow: '0 4px 16px rgba(192,82,42,0.28)' }}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : step < TOTAL_STEPS ? (
              <>המשך <ChevronLeft className="w-4 h-4" /></>
            ) : (
              <>בוא נתחיל! <Check className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
