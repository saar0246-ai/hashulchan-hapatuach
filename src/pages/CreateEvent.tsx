import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { KashrutLevel, ReligiousLevel, EventType } from '../types'
import { KASHRUT_LABELS, RELIGIOUS_LABELS, EVENT_TYPE_LABELS } from '../types'
import TopBar from '../components/TopBar'

const CITIES = ['ירושלים', 'תל אביב', 'חיפה', 'ראשון לציון', 'פתח תקוה', 'אשדוד', 'נתניה', 'באר שבע', 'בני ברק', 'בת ים', 'רחובות', 'רמת גן', 'אחרת']

export default function CreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    event_type: 'shabbat_dinner' as EventType,
    holiday_name: '',
    event_date: '',
    event_time: '19:30',
    city: '',
    neighborhood: '',
    address: '',
    address_notes: '',
    max_guests: '6',
    kashrut_level: 'kosher' as KashrutLevel,
    preferred_religious_levels: [] as ReligiousLevel[],
    min_age: '',
    max_age: '',
    description: '',
  })

  const update = (field: string, value: string | string[]) =>
    setForm(f => ({ ...f, [field]: value }))

  const toggleReligious = (r: ReligiousLevel) => {
    const current = form.preferred_religious_levels
    update('preferred_religious_levels',
      current.includes(r) ? current.filter(x => x !== r) : [...current, r]
    )
  }

  const handleSubmit = async () => {
    if (!user) return
    if (!form.title || !form.event_date || !form.city || !form.address) {
      toast.error('יש למלא את כל השדות החובה')
      return
    }
    if (new Date(form.event_date) < new Date(Date.now() - 86400000)) {
      toast.error('תאריך האירוע לא יכול להיות בעבר')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('events').insert({
      host_id: user.id,
      title: form.title.trim(),
      event_type: form.event_type,
      holiday_name: form.event_type === 'holiday' ? form.holiday_name.trim() || null : null,
      event_date: form.event_date,
      event_time: form.event_time,
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || null,
      address: form.address.trim(),
      address_notes: form.address_notes.trim() || null,
      max_guests: Number(form.max_guests),
      kashrut_level: form.kashrut_level,
      preferred_religious_levels: form.preferred_religious_levels,
      min_age: form.min_age ? Number(form.min_age) : null,
      max_age: form.max_age ? Number(form.max_age) : null,
      description: form.description.trim() || null,
      status: 'active',
      current_guests: 0,
    }).select().single()

    if (error) {
      toast.error('שגיאה ביצירת האירוע')
    } else {
      toast.success('הארוחה פורסמה!')
      navigate(`/events/${data.id}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar title="פרסם ארוחה" showBack />

      <div className="page-container space-y-6">
        {/* Event type */}
        <div className="stagger-1">
          <label className="text-sm font-semibold text-foreground mb-2 block">סוג הארוחה *</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => update('event_type', t)}
                className={`p-3 rounded-xl text-sm font-medium border-2 transition-all text-right ${
                  form.event_type === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {t === 'shabbat_dinner' ? '🕯️' : t === 'shabbat_lunch' ? '☀️' : t === 'holiday' ? '🎉' : '🍽️'}{' '}
                {EVENT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {form.event_type === 'holiday' && (
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">שם החג</label>
            <input value={form.holiday_name} onChange={e => update('holiday_name', e.target.value)}
              placeholder="פסח, ראש השנה, שבועות..." className="shulchan-input" />
          </div>
        )}

        {/* Title */}
        <div className="stagger-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">כותרת הארוחה *</label>
          <input value={form.title} onChange={e => update('title', e.target.value)}
            placeholder="ארוחת שישי חמה בסלון, כולם מוזמנים!" className="shulchan-input" maxLength={80} />
        </div>

        {/* Date + time */}
        <div className="stagger-2 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">תאריך *</label>
            <input type="date" value={form.event_date} onChange={e => update('event_date', e.target.value)}
              className="shulchan-input" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">שעה *</label>
            <input type="time" value={form.event_time} onChange={e => update('event_time', e.target.value)}
              className="shulchan-input" />
          </div>
        </div>

        {/* Location */}
        <div className="stagger-3 space-y-3">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">עיר *</label>
            <select value={form.city} onChange={e => update('city', e.target.value)} className="shulchan-input">
              <option value="">בחר עיר...</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">שכונה</label>
            <input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)}
              placeholder="שכונה (אופציונלי)" className="shulchan-input" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">כתובת מלאה *</label>
            <input value={form.address} onChange={e => update('address', e.target.value)}
              placeholder="רחוב הרצל 5, דירה 3" className="shulchan-input" />
            <div className="flex items-center gap-1 mt-1">
              <Info className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">תוצג רק לאורחים מאושרים</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">הערות לכתובת</label>
            <input value={form.address_notes} onChange={e => update('address_notes', e.target.value)}
              placeholder="כניסה מהחצר, קומה 2..." className="shulchan-input" />
          </div>
        </div>

        {/* Max guests */}
        <div className="stagger-3">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">מספר אורחים מקסימלי *</label>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => update('max_guests', String(Math.max(1, Number(form.max_guests) - 1)))}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl font-bold active:scale-90 transition-all">
              −
            </button>
            <span className="text-2xl font-bold text-foreground w-8 text-center">{form.max_guests}</span>
            <button type="button"
              onClick={() => update('max_guests', String(Math.min(30, Number(form.max_guests) + 1)))}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl font-bold active:scale-90 transition-all">
              +
            </button>
          </div>
        </div>

        {/* Kashrut */}
        <div className="stagger-4">
          <label className="text-sm font-semibold text-foreground mb-2 block">רמת כשרות האוכל *</label>
          <div className="grid grid-cols-2 gap-2">
            {(['mehadrin', 'kosher', 'traditional', 'none'] as KashrutLevel[]).map(k => (
              <button key={k} type="button"
                onClick={() => update('kashrut_level', k)}
                className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.kashrut_level === k
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                {KASHRUT_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        {/* Religious preferences */}
        <div className="stagger-4">
          <label className="text-sm font-semibold text-foreground mb-1 block">העדפת אורחים (ריק = כולם)</label>
          <p className="text-xs text-muted-foreground mb-2">בחר את הרקע הדתי של האורחים המועדפים</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(RELIGIOUS_LABELS) as ReligiousLevel[]).map(r => (
              <button key={r} type="button"
                onClick={() => toggleReligious(r)}
                className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.preferred_religious_levels.includes(r)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                {RELIGIOUS_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Age range */}
        <div className="stagger-5 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">גיל מינימלי</label>
            <input type="number" value={form.min_age} onChange={e => update('min_age', e.target.value)}
              placeholder="18" className="shulchan-input" min="18" max="120" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">גיל מקסימלי</label>
            <input type="number" value={form.max_age} onChange={e => update('max_age', e.target.value)}
              placeholder="ללא הגבלה" className="shulchan-input" min="18" max="120" />
          </div>
        </div>

        {/* Description */}
        <div className="stagger-5">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">תיאור הארוחה</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            placeholder="ספר על הארוחה — מה מגישים, האווירה, מה מצפה לאורחים..."
            className="shulchan-input resize-none h-28" maxLength={500} />
          <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500</p>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2">
          {loading
            ? <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            : <><CalendarPlus className="w-5 h-5" /> פרסם את הארוחה!</>
          }
        </button>
      </div>
    </div>
  )
}
