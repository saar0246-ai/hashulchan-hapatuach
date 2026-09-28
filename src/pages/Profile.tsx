import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, ChevronLeft, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { KashrutLevel, ReligiousLevel } from '../types'
import { KASHRUT_LABELS, RELIGIOUS_LABELS, KASHRUT_COLORS, RELIGIOUS_COLORS } from '../types'
import TopBar from '../components/TopBar'
import ProfileAvatar from '../components/ProfileAvatar'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { profile, loading, refetch } = useProfile(user?.id)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    display_name: '',
    birthday: '',
    city: '',
    neighborhood: '',
    kashrut_level: '' as KashrutLevel | '',
    religious_level: '' as ReligiousLevel | '',
    phone: '',
    bio: '',
  })

  const computeAge = (birthday: string) => {
    if (!birthday) return 0
    const today = new Date()
    const bday = new Date(birthday + 'T00:00:00')
    let age = today.getFullYear() - bday.getFullYear()
    const m = today.getMonth() - bday.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--
    return age
  }

  const startEdit = () => {
    if (!profile) return
    setForm({
      display_name: profile.display_name ?? '',
      birthday: profile.birthday ?? '',
      city: profile.city ?? '',
      neighborhood: profile.neighborhood ?? '',
      kashrut_level: profile.kashrut_level ?? '',
      religious_level: profile.religious_level ?? '',
      phone: profile.phone ?? '',
      bio: profile.bio ?? '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      display_name: form.display_name.trim(),
      birthday: form.birthday || null,
      city: form.city.trim() || null,
      neighborhood: form.neighborhood.trim() || null,
      kashrut_level: form.kashrut_level || null,
      religious_level: form.religious_level || null,
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
    }).eq('id', user.id)

    if (error) {
      toast.error('שגיאה בשמירה')
    } else {
      await refetch()
      setEditing(false)
      toast.success('פרופיל עודכן!')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/landing')
  }

  if (loading) return <div className="min-h-dvh bg-background"><TopBar /><LoadingSpinner /></div>
  if (!profile) return null

  return (
    <div className="min-h-dvh bg-background">
      <TopBar title="הפרופיל שלי" right={
        !editing ? (
          <button onClick={startEdit} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-all">
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : null
      } />

      <div className="page-container space-y-5">
        {/* Avatar + stats */}
        <div className="stagger-1 flex flex-col items-center pt-2 gap-3">
          <ProfileAvatar name={profile.display_name} avatarUrl={profile.avatar_url} size="xl" />
          <div className="text-center">
            <h1 className="font-display font-bold text-xl text-foreground">{profile.display_name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {profile.city}{profile.neighborhood ? `, ${profile.neighborhood}` : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="shulchan-card p-3 text-center">
              <p className="text-lg font-bold text-foreground">{profile.total_hosted}</p>
              <p className="text-xs text-muted-foreground">ארוחות אירחתי</p>
              {profile.rating_count_host > 0 && (
                <StarRating score={Math.round(profile.rating_as_host)} count={profile.rating_count_host} />
              )}
            </div>
            <div className="shulchan-card p-3 text-center">
              <p className="text-lg font-bold text-foreground">{profile.total_guested}</p>
              <p className="text-xs text-muted-foreground">ביקרתי</p>
              {profile.rating_count_guest > 0 && (
                <StarRating score={Math.round(profile.rating_as_guest)} count={profile.rating_count_guest} />
              )}
            </div>
          </div>
        </div>

        {/* View mode */}
        {!editing ? (
          <div className="stagger-2 space-y-4">
            <div className="shulchan-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">פרטים אישיים</h3>
              {[
                { label: 'גיל', value: profile.birthday ? `${computeAge(profile.birthday)} שנים` : null },
                { label: 'טלפון', value: profile.phone },
                { label: 'מייל', value: user?.email },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>

            <div className="shulchan-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">הגדרות שולחן</h3>
              <div className="flex flex-wrap gap-2">
                {profile.kashrut_level && (
                  <span className={`badge ${KASHRUT_COLORS[profile.kashrut_level]}`}>
                    🍽️ {KASHRUT_LABELS[profile.kashrut_level]}
                  </span>
                )}
                {profile.religious_level && (
                  <span className={`badge ${RELIGIOUS_COLORS[profile.religious_level]}`}>
                    {RELIGIOUS_LABELS[profile.religious_level]}
                  </span>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="shulchan-card p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">עלי</h3>
                <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="space-y-2">
              <Link to="/my-events">
                <button className="w-full shulchan-card p-4 flex items-center justify-between hover:shadow-md active:scale-[0.99] transition-all">
                  <span className="text-sm font-medium text-foreground">🏠 הארוחות שפרסמתי</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>
              <Link to="/terms">
                <button className="w-full shulchan-card p-4 flex items-center justify-between hover:shadow-md active:scale-[0.99] transition-all">
                  <span className="text-sm font-medium text-foreground">📜 תנאי שימוש</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>
              <Link to="/privacy">
                <button className="w-full shulchan-card p-4 flex items-center justify-between hover:shadow-md active:scale-[0.99] transition-all">
                  <span className="text-sm font-medium text-foreground">🔒 מדיניות פרטיות</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>
              <Link to="/accessibility">
                <button className="w-full shulchan-card p-4 flex items-center justify-between hover:shadow-md active:scale-[0.99] transition-all">
                  <span className="text-sm font-medium text-foreground">♿ הצהרת נגישות</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              </Link>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              יציאה מהחשבון
            </button>
          </div>
        ) : (
          /* Edit mode */
          <div className="stagger-2 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">שם להצגה</label>
              <input value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                className="shulchan-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">תאריך לידה</label>
              <input
                type="date"
                value={form.birthday}
                onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                className="shulchan-input"
                max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] })()}
                min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 120); return d.toISOString().split('T')[0] })()}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">עיר</label>
                <input value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="shulchan-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">שכונה</label>
                <input value={form.neighborhood}
                  onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                  className="shulchan-input" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">כשרות</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => (
                  <button key={k} type="button"
                    onClick={() => setForm(f => ({ ...f, kashrut_level: f.kashrut_level === k ? '' : k }))}
                    className={`p-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.kashrut_level === k ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground'
                    }`}>
                    {KASHRUT_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">השתייכות דתית</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(RELIGIOUS_LABELS) as ReligiousLevel[]).map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm(f => ({ ...f, religious_level: f.religious_level === r ? '' : r }))}
                    className={`p-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.religious_level === r ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground'
                    }`}>
                    {RELIGIOUS_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">טלפון</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="shulchan-input" dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">ביוגרפיה</label>
              <textarea value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className="shulchan-input resize-none h-24" maxLength={300} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> ביטול
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> שמור</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
