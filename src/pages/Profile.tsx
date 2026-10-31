import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, ChevronLeft, Edit2, Check, X, Camera, Home as HomeIcon, FileText, Lock, Shield, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import type { KashrutLevel, ReligiousLevel, Gender } from '../types'
import { KASHRUT_LABELS, RELIGIOUS_LABELS, GENDER_LABELS, KASHRUT_COLORS, RELIGIOUS_COLORS } from '../types'
import TopBar from '../components/TopBar'
import ProfileAvatar from '../components/ProfileAvatar'
import StarRating from '../components/StarRating'
import CropModal from '../components/CropModal'

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

export default function Profile() {
  const { user, signOut } = useAuth()
  const { profile, loading, refetch } = useProfile(user?.id)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
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
  })

  const toggleKashrut = (k: KashrutLevel) =>
    setForm(f => ({
      ...f,
      guest_kashrut_prefs: f.guest_kashrut_prefs.includes(k)
        ? f.guest_kashrut_prefs.filter(v => v !== k)
        : [...f.guest_kashrut_prefs, k],
    }))

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
      gender: profile.gender ?? '',
      city: profile.city ?? '',
      neighborhood: profile.neighborhood ?? '',
      kashrut_level: profile.kashrut_level ?? '',
      religious_level: profile.religious_level ?? '',
      guest_kashrut_prefs: profile.guest_kashrut_prefs ?? [],
      phone: profile.phone ?? '',
      bio: profile.bio ?? '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const basePayload = {
      display_name: form.display_name.trim(),
      birthday: form.birthday || null,
      gender: form.gender || null,
      city: form.city.trim() || null,
      neighborhood: form.neighborhood.trim() || null,
      kashrut_level: form.kashrut_level || null,
      religious_level: form.religious_level || null,
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
    }

    let { error } = await supabase.from('profiles').update({
      ...basePayload,
      guest_kashrut_prefs: form.guest_kashrut_prefs.length > 0 ? form.guest_kashrut_prefs : null,
    }).eq('id', user.id)

    if (error && error.message?.includes('guest_kashrut_prefs')) {
      const fallback = await supabase.from('profiles').update(basePayload).eq('id', user.id)
      error = fallback.error
    }

    if (error) {
      toast.error('שגיאה בשמירה: ' + error.message)
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 10 * 1024 * 1024) { toast.error('התמונה גדולה מדי — מקסימום 10MB'); return }
    // Reset input so same file can be re-selected after cancel
    e.target.value = ''
    setCropFile(file)
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!user) return
    setCropFile(null)
    setAvatarUploading(true)
    const { data: up, error: upErr } = await supabase.storage
      .from('avatars')
      .upload(user.id, blob, { upsert: true, contentType: 'image/jpeg' })
    if (upErr || !up) { toast.error('שגיאה בהעלאת התמונה'); setAvatarUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(user.id)
    const { error } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
    if (error) { toast.error('שגיאה בשמירת התמונה') } else { await refetch(); toast.success('תמונה עודכנה!') }
    setAvatarUploading(false)
  }

  if (loading) return (
    <div className="min-h-dvh" style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}>
      <TopBar />
      <div className="flex items-center justify-center pt-24">
        <div className="w-10 h-10 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" />
      </div>
    </div>
  )
  if (!profile) return null

  return (
    <>
    {cropFile && (
      <CropModal
        file={cropFile}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropFile(null)}
      />
    )}
    <div className="relative min-h-dvh"
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

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar title="הפרופיל שלי" right={
          !editing ? (
            <motion.button
              onClick={startEdit}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ background: 'rgba(192,82,42,0.09)', border: '1px solid rgba(192,82,42,0.15)' }}>
              <Edit2 className="w-4 h-4" style={{ color: '#C0522A' }} />
            </motion.button>
          ) : null
        } />

        <div className="max-w-lg mx-auto px-4 pb-28 pt-4 space-y-4">
          {/* Avatar + stats */}
          <motion.div
            className="flex flex-col items-center pt-2 gap-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: EASE }}>
            <div className="relative">
              <ProfileAvatar name={profile.display_name} avatarUrl={profile.avatar_url} size="xl" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #C8860A, #F0B428)' }}>
                {avatarUploading
                  ? <div className="w-3.5 h-3.5 border-2 border-amber-900/40 border-t-amber-900 rounded-full animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-amber-900" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="text-center">
              <h1 className="font-display font-bold text-xl" style={{ color: '#1A1714' }}>{profile.display_name}</h1>
              <p className="text-sm mt-0.5" style={{ color: '#8C7060' }}>
                {profile.city}{profile.neighborhood ? `, ${profile.neighborhood}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="rounded-2xl p-3 text-center" style={{ ...GLASS }}>
                <p className="text-lg font-bold" style={{ color: '#1A1714' }}>{profile.total_hosted}</p>
                <p className="text-xs" style={{ color: '#8C7060' }}>ארוחות אירחתי</p>
                {profile.rating_count_host > 0 && (
                  <StarRating score={Math.round(profile.rating_as_host)} count={profile.rating_count_host} />
                )}
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ ...GLASS }}>
                <p className="text-lg font-bold" style={{ color: '#1A1714' }}>{profile.total_guested}</p>
                <p className="text-xs" style={{ color: '#8C7060' }}>ביקרתי</p>
                {profile.rating_count_guest > 0 && (
                  <StarRating score={Math.round(profile.rating_as_guest)} count={profile.rating_count_guest} />
                )}
              </div>
            </div>
          </motion.div>

          {/* View mode */}
          {!editing ? (
            <div className="space-y-3">
              <motion.div className="rounded-2xl p-4 space-y-3" style={{ ...GLASS }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: EASE, delay: 0.06 }}>
                <h3 className="text-sm font-semibold" style={{ color: '#8C7060' }}>פרטים אישיים</h3>
                {[
                  { label: 'גיל', value: profile.birthday ? `${computeAge(profile.birthday)} שנים` : null },
                  { label: 'מגדר', value: profile.gender ? GENDER_LABELS[profile.gender] : null },
                  { label: 'טלפון', value: profile.phone },
                  { label: 'מייל', value: user?.email },
                ].map(({ label, value }) => value && (
                  <div key={label} className="flex items-center justify-between py-1"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.60)' }}>
                    <span className="text-sm" style={{ color: '#8C7060' }}>{label}</span>
                    <span className="text-sm font-medium" style={{ color: '#1A1714' }}>{value}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div className="rounded-2xl p-4 space-y-3" style={{ ...GLASS }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: EASE, delay: 0.10 }}>
                <h3 className="text-sm font-semibold" style={{ color: '#8C7060' }}>הגדרות שולחן</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.kashrut_level && (
                    <span className={`badge ${KASHRUT_COLORS[profile.kashrut_level]}`}>{KASHRUT_LABELS[profile.kashrut_level]}</span>
                  )}
                  {profile.religious_level && (
                    <span className={`badge ${RELIGIOUS_COLORS[profile.religious_level]}`}>{RELIGIOUS_LABELS[profile.religious_level]}</span>
                  )}
                </div>
                {profile.guest_kashrut_prefs && profile.guest_kashrut_prefs.length > 0 && (
                  <div>
                    <p className="text-xs mb-1.5" style={{ color: '#8C7060' }}>כאורח — מוכן להשתתף ב:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.guest_kashrut_prefs.map(k => (
                        <span key={k} className={`badge text-xs ${KASHRUT_COLORS[k]}`}>{KASHRUT_LABELS[k]}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {profile.bio && (
                <motion.div className="rounded-2xl p-4" style={{ ...GLASS }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, ease: EASE, delay: 0.14 }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#8C7060' }}>עלי</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#1A1714' }}>{profile.bio}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                {[
                  { to: '/my-events', icon: <HomeIcon className="w-4 h-4" />, label: 'הארוחות שפרסמתי' },
                  { to: '/terms', icon: <FileText className="w-4 h-4" />, label: 'תנאי שימוש' },
                  { to: '/privacy', icon: <Lock className="w-4 h-4" />, label: 'מדיניות פרטיות' },
                  { to: '/accessibility', icon: <Eye className="w-4 h-4" />, label: 'הצהרת נגישות' },
                ].map(({ to, icon, label }) => (
                  <Link key={to} to={to}>
                    <motion.div
                      className="rounded-2xl p-4 flex items-center justify-between"
                      style={{ ...GLASS }}
                      whileHover={{ y: -2, boxShadow: '0 20px 52px rgba(44,24,8,0.11), inset 0 1px 0 rgba(255,255,255,0.96)' }}
                      whileTap={{ scale: 0.985 }} transition={SPRING}>
                      <span className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1A1714' }}>
                        <span style={{ color: '#8C7060' }}>{icon}</span>{label}
                      </span>
                      <ChevronLeft className="w-4 h-4" style={{ color: '#8C7060' }} />
                    </motion.div>
                  </Link>
                ))}

                {profile.role === 'admin' && (
                  <Link to="/admin">
                    <motion.div
                      className="rounded-2xl p-4 flex items-center justify-between"
                      style={{ ...GLASS, borderRight: '3px solid #C0522A' }}
                      whileHover={{ y: -2, boxShadow: '0 20px 52px rgba(44,24,8,0.11)' }}
                      whileTap={{ scale: 0.985 }} transition={SPRING}>
                      <span className="flex items-center gap-2 text-sm font-bold" style={{ color: '#C0522A' }}>
                        <Shield className="w-4 h-4" />לוח ניהול אדמין
                      </span>
                      <ChevronLeft className="w-4 h-4" style={{ color: '#C0522A' }} />
                    </motion.div>
                  </Link>
                )}

                <motion.button
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={SPRING}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium"
                  style={{ border: '1.5px solid rgba(220,38,38,0.30)', color: '#DC2626', background: 'rgba(220,38,38,0.05)' }}>
                  <LogOut className="w-4 h-4" />
                  יציאה מהחשבון
                </motion.button>
              </div>
            </div>
          ) : (
            /* Edit mode */
            <div className="space-y-4">
              {[
                {
                  label: 'שם להצגה',
                  content: (
                    <input value={form.display_name}
                      onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                      className="shulchan-input" />
                  )
                },
                {
                  label: 'תאריך לידה',
                  content: (
                    <input type="date" value={form.birthday}
                      onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                      className="shulchan-input"
                      max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] })()}
                      min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 120); return d.toISOString().split('T')[0] })()}
                    />
                  )
                },
              ].map(({ label, content }) => (
                <div key={label} className="rounded-2xl p-4" style={{ ...GLASS }}>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>{label}</label>
                  {content}
                </div>
              ))}

              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#1A1714' }}>מגדר</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as Gender[]).map(g => (
                    <button key={g} type="button"
                      onClick={() => setForm(f => ({ ...f, gender: f.gender === g ? '' : g }))}
                      className="p-2.5 rounded-xl text-sm font-medium transition-all"
                      style={form.gender === g ? {
                        background: 'rgba(192,82,42,0.10)', border: '2px solid #C0522A', color: '#C0522A',
                      } : {
                        background: 'rgba(255,255,255,0.50)', border: '1.5px solid rgba(232,226,216,0.70)', color: '#1A1714',
                      }}>
                      {GENDER_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>עיר</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="shulchan-input" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>שכונה</label>
                    <input value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className="shulchan-input" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#1A1714' }}>כשרות</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => (
                    <button key={k} type="button"
                      onClick={() => setForm(f => ({ ...f, kashrut_level: f.kashrut_level === k ? '' : k }))}
                      className="p-2.5 rounded-xl text-sm font-medium transition-all"
                      style={form.kashrut_level === k ? {
                        background: 'rgba(192,82,42,0.10)', border: '2px solid #C0522A', color: '#C0522A',
                      } : {
                        background: 'rgba(255,255,255,0.50)', border: '1.5px solid rgba(232,226,216,0.70)', color: '#1A1714',
                      }}>
                      {KASHRUT_LABELS[k]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#1A1714' }}>
                  כשרות לאירוח — אני מוכן לאכול
                  <span className="text-xs font-normal mr-1" style={{ color: '#8C7060' }}>(ניתן לבחור כמה)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => (
                    <button key={k} type="button" onClick={() => toggleKashrut(k)}
                      className="p-2.5 rounded-xl text-sm font-medium transition-all"
                      style={form.guest_kashrut_prefs.includes(k) ? {
                        background: 'rgba(192,82,42,0.10)', border: '2px solid #C0522A', color: '#C0522A',
                      } : {
                        background: 'rgba(255,255,255,0.50)', border: '1.5px solid rgba(232,226,216,0.70)', color: '#1A1714',
                      }}>
                      {KASHRUT_LABELS[k]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#1A1714' }}>השתייכות דתית</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(RELIGIOUS_LABELS) as ReligiousLevel[]).map(r => (
                    <button key={r} type="button"
                      onClick={() => setForm(f => ({ ...f, religious_level: f.religious_level === r ? '' : r }))}
                      className="p-2.5 rounded-xl text-sm font-medium transition-all"
                      style={form.religious_level === r ? {
                        background: 'rgba(192,82,42,0.10)', border: '2px solid #C0522A', color: '#C0522A',
                      } : {
                        background: 'rgba(255,255,255,0.50)', border: '1.5px solid rgba(232,226,216,0.70)', color: '#1A1714',
                      }}>
                      {RELIGIOUS_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>טלפון</label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="shulchan-input" dir="ltr" />
              </div>

              <div className="rounded-2xl p-4" style={{ ...GLASS }}>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: '#1A1714' }}>ביוגרפיה</label>
                <textarea value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="shulchan-input resize-none h-24" maxLength={300} />
              </div>

              <div className="flex gap-3">
                <motion.button onClick={() => setEditing(false)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                  className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-medium"
                  style={{ ...GLASS, color: '#8C7060' }}>
                  <X className="w-4 h-4" /> ביטול
                </motion.button>
                <motion.button onClick={handleSave} disabled={saving}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 36px rgba(143,66,34,0.42)' }}
                  whileTap={{ scale: 0.97 }} transition={SPRING}
                  className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #C0522A, #8C3318)', boxShadow: '0 4px 16px rgba(192,82,42,0.28)' }}>
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> שמור</>}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
