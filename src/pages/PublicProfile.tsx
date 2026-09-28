import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Profile, Rating, ReportReason } from '../types'
import { KASHRUT_LABELS, KASHRUT_COLORS, RELIGIOUS_LABELS, RELIGIOUS_COLORS, REPORT_REASON_LABELS } from '../types'
import TopBar from '../components/TopBar'
import ProfileAvatar from '../components/ProfileAvatar'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState<ReportReason | ''>('')
  const [reportDetails, setReportDetails] = useState('')
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('ratings').select('*, rater:profiles!rater_id(display_name, avatar_url)')
        .eq('rated_id', id).order('created_at', { ascending: false }).limit(20),
    ]).then(([{ data: p }, { data: r }]) => {
      if (!p) { navigate('/home'); return }
      setProfile(p)
      setRatings(r ?? [])
      setLoading(false)
    })
  }, [id, navigate])

  const handleReport = async () => {
    if (!user || !id || !reportReason) return
    setReporting(true)
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id: id,
      reason: reportReason,
      details: reportDetails.trim() || null,
    })
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'כבר דיווחת על משתמש זה' : 'שגיאה בשליחת הדיווח')
    } else {
      toast.success('הדיווח נשלח לבדיקת הצוות')
      setShowReport(false)
      setReportReason('')
      setReportDetails('')
    }
    setReporting(false)
  }

  const computeAge = (birthday: string) => {
    const today = new Date()
    const bday = new Date(birthday + 'T00:00:00')
    let age = today.getFullYear() - bday.getFullYear()
    const m = today.getMonth() - bday.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--
    return age
  }

  if (loading) return <div className="min-h-dvh bg-background"><TopBar showBack /><LoadingSpinner /></div>
  if (!profile) return null

  const hostRatings = ratings.filter(r => r.role === 'as_host')
  const guestRatings = ratings.filter(r => r.role === 'as_guest')
  const isOwnProfile = user?.id === id

  return (
    <div className="min-h-dvh bg-background pb-8">
      <TopBar showBack title="פרופיל" right={
        !isOwnProfile && user ? (
          <button
            onClick={() => setShowReport(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-all"
            title="דווח על משתמש"
          >
            <Flag className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : null
      } />

      <div className="page-container space-y-5">
        {/* Hero */}
        <div className="stagger-1 flex flex-col items-center pt-2 gap-3">
          <ProfileAvatar name={profile.display_name} avatarUrl={profile.avatar_url} size="xl" />
          <div className="text-center">
            <h1 className="font-display font-bold text-xl text-foreground">{profile.display_name}</h1>
            {(profile.city || profile.neighborhood) && (
              <p className="text-sm text-muted-foreground">
                📍 {profile.city}{profile.neighborhood ? `, ${profile.neighborhood}` : ''}
              </p>
            )}
            {profile.birthday && (
              <p className="text-xs text-muted-foreground mt-0.5">{computeAge(profile.birthday)} שנים</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="shulchan-card p-3 text-center">
              <p className="text-lg font-bold text-foreground">{profile.total_hosted}</p>
              <p className="text-xs text-muted-foreground">ארוחות כמארח</p>
              {profile.rating_count_host > 0 && (
                <StarRating score={Math.round(profile.rating_as_host)} count={profile.rating_count_host} />
              )}
            </div>
            <div className="shulchan-card p-3 text-center">
              <p className="text-lg font-bold text-foreground">{profile.total_guested}</p>
              <p className="text-xs text-muted-foreground">ביקורים כאורח</p>
              {profile.rating_count_guest > 0 && (
                <StarRating score={Math.round(profile.rating_as_guest)} count={profile.rating_count_guest} />
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="stagger-2 flex flex-wrap gap-2">
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

        {/* Bio */}
        {profile.bio && (
          <div className="stagger-3 shulchan-card p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">עלי</h3>
            <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Ratings */}
        {(hostRatings.length > 0 || guestRatings.length > 0) && (
          <div className="stagger-4 space-y-4">
            {hostRatings.length > 0 && (
              <div>
                <h3 className="section-title mb-3">ביקורות כמארח</h3>
                <div className="space-y-2">
                  {hostRatings.map(r => (
                    <div key={r.id} className="shulchan-card p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">{(r.rater as { display_name: string })?.display_name}</p>
                        <StarRating score={r.score} />
                      </div>
                      {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                      <p className="text-[10px] text-muted-foreground/60">
                        {format(new Date(r.created_at), "d בMMM yyyy", { locale: he })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {guestRatings.length > 0 && (
              <div>
                <h3 className="section-title mb-3">ביקורות כאורח</h3>
                <div className="space-y-2">
                  {guestRatings.map(r => (
                    <div key={r.id} className="shulchan-card p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">{(r.rater as { display_name: string })?.display_name}</p>
                        <StarRating score={r.score} />
                      </div>
                      {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                      <p className="text-[10px] text-muted-foreground/60">
                        {format(new Date(r.created_at), "d בMMM yyyy", { locale: he })}
                      </p>
                    </div>
                  ))}
                </div>
          </div>
            )}
          </div>
        )}
      </div>

      {/* Report modal */}
      {showReport && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowReport(false)}
        >
          <div
            className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-5"
            style={{ background: 'hsl(var(--card))', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto" />
            <h3 className="font-display font-black text-lg text-foreground text-center">דיווח על משתמש</h3>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">סיבת הדיווח *</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(REPORT_REASON_LABELS) as ReportReason[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`p-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      reportReason === r
                        ? 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-border bg-card text-foreground'
                    }`}
                  >
                    {REPORT_REASON_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="פרט את הבעיה (אופציונלי)..."
                className="shulchan-input resize-none h-20 text-sm"
                maxLength={500}
              />
            </div>

            <button
              onClick={handleReport}
              disabled={!reportReason || reporting}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)' }}
            >
              {reporting
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                : 'שלח דיווח'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
