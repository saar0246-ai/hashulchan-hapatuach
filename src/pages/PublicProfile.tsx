import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Profile, Rating } from '../types'
import { KASHRUT_LABELS, KASHRUT_COLORS, RELIGIOUS_LABELS, RELIGIOUS_COLORS } from '../types'
import TopBar from '../components/TopBar'
import ProfileAvatar from '../components/ProfileAvatar'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('ratings').select('*, rater:profiles!rater_id(display_name, avatar_url)').eq('rated_id', id).order('created_at', { ascending: false }).limit(20),
    ]).then(([{ data: p }, { data: r }]) => {
      if (!p) { navigate('/home'); return }
      setProfile(p)
      setRatings(r ?? [])
      setLoading(false)
    })
  }, [id, navigate])

  if (loading) return <div className="min-h-dvh bg-background"><TopBar showBack /><LoadingSpinner /></div>
  if (!profile) return null

  const hostRatings = ratings.filter(r => r.role === 'as_host')
  const guestRatings = ratings.filter(r => r.role === 'as_guest')

  return (
    <div className="min-h-dvh bg-background">
      <TopBar showBack title="פרופיל" />

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
            {profile.age && <p className="text-xs text-muted-foreground mt-0.5">{profile.age} שנים</p>}
          </div>

          {/* Stats */}
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
                        <p className="text-xs font-medium text-foreground">{(r.rater as any)?.display_name}</p>
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
                        <p className="text-xs font-medium text-foreground">{(r.rater as any)?.display_name}</p>
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
    </div>
  )
}
