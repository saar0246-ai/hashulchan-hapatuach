import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { KashrutLevel, ReligiousLevel } from '../types'
import { KASHRUT_LABELS, RELIGIOUS_LABELS } from '../types'

const TOTAL_STEPS = 5

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    display_name: '',
    birthday: '',
    city: '',
    neighborhood: '',
    kashrut_level: '' as KashrutLevel | '',
    religious_level: '' as ReligiousLevel | '',
    phone: '',
    bio: '',
    agreed_terms: false,
  })

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
    if (step === 1) return form.display_name.trim().length >= 2 && computeAge(form.birthday) >= 18
    if (step === 2) return form.city.trim().length >= 2
    if (step === 3) return !!form.kashrut_level && !!form.religious_level && form.phone.trim().length >= 9
    if (step === 4) return true
    if (step === 5) return form.agreed_terms
    return false
  }

  const handleFinish = async () => {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      display_name: form.display_name.trim(),
      birthday: form.birthday || null,
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || null,
      kashrut_level: form.kashrut_level || null,
      religious_level: form.religious_level || null,
      phone: form.phone.trim(),
      bio: form.bio.trim() || null,
      onboarding_completed: true,
    }).eq('id', user.id)

    if (error) {
      toast.error('שגיאה בשמירת הפרופיל: ' + error.message)
    } else {
      toast.success('ברוך הבא לשולחן הפתוח!')
      navigate('/home')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col max-w-md mx-auto">
      {/* Progress bar */}
      <div className="px-6 pt-safe-top pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">שלב {step} מתוך {TOTAL_STEPS}</span>
          <span className="text-sm text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">ספר לנו עליך</h2>
              <p className="text-muted-foreground text-sm mt-1">פרטים בסיסיים לפרופיל שלך</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">שם להצגה *</label>
              <input
                value={form.display_name}
                onChange={e => update('display_name', e.target.value)}
                placeholder="ישראל ישראלי"
                className="shulchan-input"
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground mt-1">השם שיראו מארחים ואורחים</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">תאריך לידה *</label>
              <input
                type="date"
                value={form.birthday}
                onChange={e => update('birthday', e.target.value)}
                className="shulchan-input"
                max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] })()}
                min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 120); return d.toISOString().split('T')[0] })()}
              />
              <p className="text-xs text-muted-foreground mt-1">חייב להיות מעל 18</p>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">איפה אתה גר?</h2>
              <p className="text-muted-foreground text-sm mt-1">יעזור למצוא אירועים קרובים אליך</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">עיר *</label>
              <input
                value={form.city}
                onChange={e => update('city', e.target.value)}
                placeholder="ירושלים"
                className="shulchan-input"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">שכונה (אופציונלי)</label>
              <input
                value={form.neighborhood}
                onChange={e => update('neighborhood', e.target.value)}
                placeholder="קטמון, טלביה..."
                className="shulchan-input"
              />
            </div>
          </div>
        )}

        {/* Step 3: Identity */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">הגדרות שולחן</h2>
              <p className="text-muted-foreground text-sm mt-1">כדי להתאים אותך לארוחות המתאימות</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">רמת כשרות שלי *</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => update('kashrut_level', k)}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.kashrut_level === k
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    {KASHRUT_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">השתייכות דתית *</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(RELIGIOUS_LABELS) as ReligiousLevel[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => update('religious_level', r)}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.religious_level === r
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    {RELIGIOUS_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">מספר טלפון *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="050-0000000"
                className="shulchan-input"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">יועבר רק לאורחים שאישרת</p>
            </div>
          </div>
        )}

        {/* Step 4: Bio */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">קצת עלייך</h2>
              <p className="text-muted-foreground text-sm mt-1">ספר לאורחים ומארחים מי אתה</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">ביוגרפיה קצרה (אופציונלי)</label>
              <textarea
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                placeholder="שמי ישראל, אוהב לארח ולהכיר אנשים חדשים. מבשל פסטה מעולה ויש לי שולחן לשמונה..."
                className="shulchan-input resize-none h-28"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/300</p>
            </div>
            <div className="shulchan-card p-4 bg-primary/5 border-primary/20">
              <p className="text-sm text-foreground font-medium mb-1">💡 טיפ</p>
              <p className="text-xs text-muted-foreground">
                מארחים שמוסיפים ביוגרפיה מקבלים 3 פעמים יותר אורחים
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Terms */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">כמעט שם!</h2>
              <p className="text-muted-foreground text-sm mt-1">אשר את תנאי השימוש כדי להצטרף</p>
            </div>

            <div className="shulchan-card p-4 space-y-3 max-h-64 overflow-y-auto text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">תנאי שימוש עיקריים</p>
              <p>• הפלטפורמה חינמית לחלוטין — לא גובים תשלום ממארחים או אורחים.</p>
              <p>• כל הפגישות הן בין אנשים פרטיים ועל אחריותם המלאה.</p>
              <p>• <strong>אחריות המארח:</strong> המארח אחראי בלעדית לאירוח, לבטיחות הכנת האוכל ולסביבה תקינה.</p>
              <p>• <strong>אחריות האורח:</strong> האורח אחראי להתנהגותו. גרימת נזק — פניה למשטרה.</p>
              <p>• הפלטפורמה אינה אחראית לנזקי גוף, נזקי רכוש, גניבה, פציעה או כל נזק אחר.</p>
              <p>• אסור לפרסם מידע שקרי. הפרה = מחיקת חשבון מיידית.</p>
              <p>• שני הצדדים מתחייבים להתנהג בכבוד הדדי.</p>
              <p>• <a href="/terms" className="text-primary underline">לתקנון המלא לחץ כאן</a></p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer shulchan-card p-4 border-2 border-border hover:border-primary/50 transition-all">
              <div
                onClick={() => update('agreed_terms', !form.agreed_terms)}
                className={`w-6 h-6 flex-shrink-0 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-all ${
                  form.agreed_terms ? 'bg-primary border-primary' : 'border-border'
                }`}
              >
                {form.agreed_terms && <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">קראתי ומאשר את התנאים</p>
                <p className="text-xs text-muted-foreground mt-0.5">אני מבין שהפלטפורמה אינה אחראית לנזקים כלשהם</p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 pt-4 flex gap-3 border-t border-border/60">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="btn-secondary px-4 flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={step < TOTAL_STEPS ? () => setStep(s => s + 1) : handleFinish}
          disabled={!canNext() || loading}
          className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : step < TOTAL_STEPS ? (
            <>המשך <ChevronLeft className="w-4 h-4" /></>
          ) : (
            <>בוא נתחיל! <Check className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}
