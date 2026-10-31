import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, Camera, ChevronDown, ChevronUp, Check, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile' // keeps profile loaded in context
import type { FoodPost, FoodRequest } from '../types'
import TopBar from '../components/TopBar'
import ProfileAvatar from '../components/ProfileAvatar'

const GLASS = {
  background:     'rgba(255,255,255,0.58)',
  backdropFilter: 'blur(28px)',
  border:         '1px solid rgba(255,255,255,0.80)',
  boxShadow:      '0 8px 32px rgba(44,24,8,0.07), 0 2px 6px rgba(44,24,8,0.03), inset 0 1px 0 rgba(255,255,255,0.90)',
} as const

interface PostWithRequests extends FoodPost {
  myRequest?: FoodRequest
  requests?: FoodRequest[]
}

export default function FoodPosts() {
  const { user } = useAuth()
  useProfile(user?.id)

  const [posts, setPosts] = useState<PostWithRequests[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)

  // Create form state
  const [formTitle, setFormTitle] = useState('')
  const [formItems, setFormItems] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formNeighborhood, setFormNeighborhood] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)

  const fetchPosts = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: postsData, error } = await supabase
      .from('food_posts')
      .select('*, host:profiles!host_id(*)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // Table doesn't exist yet — show empty state silently
      if (error.code === '42P01' || (error.message && (error.message.includes('does not exist') || error.message.includes('relation')))) {
        setPosts([])
        setLoading(false)
        return
      }
      toast.error('שגיאה בטעינת המסירות')
      setLoading(false)
      return
    }

    // Fetch my requests
    const { data: myRequests } = await supabase
      .from('food_requests')
      .select('*')
      .eq('requester_id', user.id)

    // For posts I host, fetch all requests
    const myPostIds = (postsData ?? []).filter(p => p.host_id === user.id).map(p => p.id)
    let allRequests: FoodRequest[] = []
    if (myPostIds.length > 0) {
      const { data: reqData } = await supabase
        .from('food_requests')
        .select('*, requester:profiles!requester_id(*)')
        .in('post_id', myPostIds)
      allRequests = reqData ?? []
    }

    const merged: PostWithRequests[] = (postsData ?? []).map(p => ({
      ...p,
      myRequest: (myRequests ?? []).find(r => r.post_id === p.id),
      requests: allRequests.filter(r => r.post_id === p.id),
    }))

    setPosts(merged)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormImageFile(file)
    const url = URL.createObjectURL(file)
    setFormImagePreview(url)
  }

  const resetForm = () => {
    setFormTitle('')
    setFormItems('')
    setFormCity('')
    setFormNeighborhood('')
    setFormAddress('')
    setFormImageFile(null)
    setFormImagePreview(null)
  }

  const handleSubmit = async () => {
    if (!user) return
    if (!formItems.trim() || !formCity.trim() || !formNeighborhood.trim() || !formAddress.trim()) {
      toast.error('יש למלא את כל השדות הנדרשים')
      return
    }

    setSubmitting(true)

    let imageUrl: string | null = null
    if (formImageFile) {
      const path = `${user.id}/${Date.now()}_${formImageFile.name}`
      const { error: upErr } = await supabase.storage
        .from('food-images')
        .upload(path, formImageFile, { upsert: false, contentType: formImageFile.type })
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('food-images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('food_posts').insert({
      host_id: user.id,
      title: formTitle.trim() || 'מסירת אוכל',
      items: formItems.trim(),
      city: formCity.trim(),
      neighborhood: formNeighborhood.trim(),
      full_address: formAddress.trim(),
      image_url: imageUrl,
      status: 'active',
    })

    if (error) {
      toast.error('שגיאה בפרסום: ' + error.message)
    } else {
      toast.success('הפרסום נוסף בהצלחה!')
      resetForm()
      setShowCreate(false)
      await fetchPosts()
    }
    setSubmitting(false)
  }

  const handleRequest = async (postId: string) => {
    if (!user) return
    const { error } = await supabase.from('food_requests').insert({
      post_id: postId,
      requester_id: user.id,
      status: 'pending',
    })
    if (error) {
      toast.error(error.message.includes('unique') ? 'כבר שלחת בקשה' : 'שגיאה בשליחת הבקשה')
    } else {
      toast.success('הבקשה נשלחה!')
      await fetchPosts()
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('food_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
    if (error) {
      toast.error('שגיאה באישור')
    } else {
      toast.success('אושר!')
      await fetchPosts()
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('food_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
    if (error) {
      toast.error('שגיאה בדחייה')
    } else {
      toast.success('נדחה')
      await fetchPosts()
    }
  }

  const handleClosePost = async (postId: string) => {
    if (!confirm('לסגור את הפרסום?')) return
    const { error } = await supabase
      .from('food_posts')
      .update({ status: 'closed' })
      .eq('id', postId)
    if (error) {
      toast.error('שגיאה בסגירה')
    } else {
      toast.success('הפרסום נסגר')
      await fetchPosts()
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: he })
    } catch {
      return ''
    }
  }

  const getRequestBadge = (status: string) => {
    if (status === 'pending')  return { label: 'ממתין לאישור', bg: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.20)' }
    if (status === 'approved') return { label: 'אושר!', bg: 'rgba(16,185,129,0.10)', color: '#059669', border: '1px solid rgba(16,185,129,0.20)' }
    return { label: 'נדחה', bg: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.18)' }
  }

  return (
    <div
      className="relative min-h-dvh"
      style={{ background: 'linear-gradient(145deg, #FDF9F3 0%, #F8F0E6 40%, #FCF5ED 72%, #FFF9F2 100%)' }}
    >
      {/* Luminous orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <div className="absolute rounded-full" style={{
          width: 700, height: 700, top: -260, right: -260,
          background: 'radial-gradient(circle at 40% 40%, rgba(248,163,22,0.28) 0%, rgba(245,140,10,0.09) 44%, transparent 68%)',
          filter: 'blur(80px)',
        }} />
        <div className="absolute rounded-full" style={{
          width: 560, height: 560, bottom: 40, left: -220,
          background: 'radial-gradient(circle at 58% 54%, rgba(192,82,42,0.22) 0%, rgba(180,70,30,0.08) 48%, transparent 70%)',
          filter: 'blur(72px)',
        }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar
          title="מסירות אוכל"
          showBack
          right={
            <button
              onClick={() => setShowCreate(p => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ background: 'rgba(192,82,42,0.09)', border: '1px solid rgba(192,82,42,0.15)', cursor: 'pointer' }}
            >
              {showCreate
                ? <X className="w-4 h-4" style={{ color: '#C0522A' }} />
                : <Plus className="w-4 h-4" style={{ color: '#C0522A' }} />
              }
            </button>
          }
        />

        <div className="max-w-lg mx-auto px-4 pb-28 pt-4 md:max-w-2xl">

          {/* Create form */}
          {showCreate && (
            <div className="rounded-2xl p-4 mb-5 space-y-3" style={{ ...GLASS, border: '1px solid rgba(192,82,42,0.18)' }}>
              <h3 className="text-sm font-bold" style={{ color: '#1A1714' }}>פרסום מסירת אוכל</h3>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>כותרת (אופציונלי)</label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="כותרת (אופציונלי)"
                  className="shulchan-input text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>מה יש להעביר? *</label>
                <textarea
                  value={formItems}
                  onChange={e => setFormItems(e.target.value)}
                  placeholder="מה יש להעביר? תפרט..."
                  className="shulchan-input resize-none h-20 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>עיר *</label>
                  <input
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    placeholder="עיר"
                    className="shulchan-input text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>שכונה *</label>
                  <input
                    value={formNeighborhood}
                    onChange={e => setFormNeighborhood(e.target.value)}
                    placeholder="שכונה"
                    className="shulchan-input text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: '#8C7060' }}>כתובת מלאה *</label>
                <input
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="הכתובת המלאה תוצג רק לאחר אישור"
                  className="shulchan-input text-sm"
                  required
                />
                <p className="text-[10px] mt-1" style={{ color: '#8C7060' }}>הכתובת תוצג רק לאחר אישור הבקשה</p>
              </div>

              {/* Image upload */}
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {formImagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={formImagePreview}
                      alt="preview"
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }}
                    />
                    <button
                      onClick={() => { setFormImageFile(null); setFormImagePreview(null) }}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#DC2626', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(232,226,216,0.6)', color: '#8C7060', border: '1px dashed rgba(140,112,96,0.35)', cursor: 'pointer' }}
                  >
                    <Camera className="w-4 h-4" /> הוסף תמונה (אופציונלי)
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowCreate(false); resetForm() }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ ...GLASS, color: '#8C7060', cursor: 'pointer' }}
                >
                  ביטול
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #C0522A, #8C3318)', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    : 'פרסם'
                  }
                </button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  height: 120, borderRadius: 16,
                  background: 'rgba(255,255,255,0.58)',
                  border: '1px solid rgba(232,226,216,0.70)',
                  animation: 'pulse 1.6s ease-in-out infinite',
                }} />
              ))}
              <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.75} }`}</style>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ ...GLASS }}>🍲</div>
              <p className="font-bold text-base" style={{ color: '#1A1714' }}>אין מסירות אוכל כרגע</p>
              <p className="text-sm" style={{ color: '#8C7060' }}>היה הראשון לפרסם מסירת אוכל!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => {
                const isHost = post.host_id === user?.id
                const isExpanded = expandedPostId === post.id
                const myReq = post.myRequest
                const badge = myReq ? getRequestBadge(myReq.status) : null
                const approvedReq = myReq?.status === 'approved'

                return (
                  <div
                    key={post.id}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      ...GLASS,
                      opacity: post.status === 'closed' ? 0.65 : 1,
                    }}
                  >
                    {/* Card header */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {post.host && (
                          <ProfileAvatar
                            name={post.host.display_name}
                            avatarUrl={post.host.avatar_url}
                            size="sm"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold" style={{ color: '#1A1714' }}>
                              {post.host?.display_name ?? ''}
                            </span>
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(192,82,42,0.10)', color: '#C0522A', border: '1px solid rgba(192,82,42,0.15)' }}
                            >
                              מסירת אוכל
                            </span>
                            {post.status === 'closed' && (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(140,112,96,0.10)', color: '#8C7060' }}
                              >
                                נסגר
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: '#8C7060' }}>
                            {post.neighborhood}, {post.city} · {formatTime(post.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Title */}
                      {post.title && post.title !== 'מסירת אוכל' && (
                        <p className="font-bold text-sm mt-2" style={{ color: '#1A1714' }}>{post.title}</p>
                      )}

                      {/* Items description */}
                      <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#1A1714' }}>
                        {post.items.length > 120 && !isExpanded
                          ? post.items.slice(0, 120) + '...'
                          : post.items
                        }
                      </p>
                      {post.items.length > 120 && (
                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="text-xs font-medium mt-1"
                          style={{ color: '#C0522A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {isExpanded ? 'פחות' : 'עוד...'}
                        </button>
                      )}

                      {/* Image */}
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="food"
                          className="mt-2 rounded-xl w-full object-cover"
                          style={{ maxHeight: 200 }}
                        />
                      )}

                      {/* If approved: show contact info */}
                      {approvedReq && (
                        <div
                          className="mt-3 p-3 rounded-xl"
                          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.20)' }}
                        >
                          <p className="text-xs font-bold mb-1" style={{ color: '#059669' }}>פרטי איסוף</p>
                          <p className="text-sm" style={{ color: '#1A1714' }}>{post.full_address}</p>
                          {post.host?.phone && (
                            <a
                              href={`tel:${post.host.phone}`}
                              className="text-sm font-semibold mt-1 block"
                              style={{ color: '#059669' }}
                            >
                              📞 {post.host.phone}
                            </a>
                          )}
                        </div>
                      )}

                      {/* Actions row */}
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          {/* For non-host visitors */}
                          {!isHost && post.status === 'active' && !myReq && (
                            <button
                              onClick={() => handleRequest(post.id)}
                              className="text-sm font-bold px-4 py-2 rounded-xl text-white"
                              style={{ background: 'linear-gradient(135deg, #C0522A, #8C3318)', cursor: 'pointer', border: 'none' }}
                            >
                              אני רוצה לקחת
                            </button>
                          )}
                          {!isHost && myReq && badge && (
                            <span
                              className="text-xs font-bold px-3 py-1.5 rounded-xl"
                              style={{ background: badge.bg, color: badge.color, border: badge.border }}
                            >
                              {badge.label}
                            </span>
                          )}
                        </div>

                        {/* Host controls toggle */}
                        {isHost && (post.requests?.length ?? 0) > 0 && (
                          <button
                            onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                            className="flex items-center gap-1 text-xs font-semibold"
                            style={{ color: '#C0522A', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {(post.requests ?? []).filter(r => r.status === 'pending').length > 0 && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(245,158,11,0.12)', color: '#D97706' }}
                              >
                                {(post.requests ?? []).filter(r => r.status === 'pending').length} ממתינים
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}

                        {isHost && post.status === 'active' && (
                          <button
                            onClick={() => handleClosePost(post.id)}
                            className="text-xs font-medium"
                            style={{ color: '#8C7060', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            סגור פרסום
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Host expanded: requests list */}
                    {isHost && isExpanded && (post.requests?.length ?? 0) > 0 && (
                      <div
                        className="border-t px-4 pb-4 pt-3 space-y-2"
                        style={{ borderColor: 'rgba(232,226,216,0.60)' }}
                      >
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8C7060' }}>בקשות</p>
                        {(post.requests ?? []).map(req => (
                          <div key={req.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {req.requester && (
                                <ProfileAvatar
                                  name={req.requester.display_name}
                                  avatarUrl={req.requester.avatar_url}
                                  size="xs"
                                />
                              )}
                              <span className="text-sm" style={{ color: '#1A1714' }}>
                                {req.requester?.display_name ?? ''}
                              </span>
                              {req.status !== 'pending' && (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={
                                    req.status === 'approved'
                                      ? { background: 'rgba(16,185,129,0.10)', color: '#059669' }
                                      : { background: 'rgba(220,38,38,0.08)', color: '#DC2626' }
                                  }
                                >
                                  {req.status === 'approved' ? 'אושר' : 'נדחה'}
                                </span>
                              )}
                            </div>
                            {req.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRejectRequest(req.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)', cursor: 'pointer' }}
                                >
                                  <X className="w-3.5 h-3.5" style={{ color: '#DC2626' }} />
                                </button>
                                <button
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)', cursor: 'pointer' }}
                                >
                                  <Check className="w-3.5 h-3.5" style={{ color: '#059669' }} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state prompt */}
          {!loading && posts.length === 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowCreate(true)}
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #C0522A, #8C3318)', cursor: 'pointer', border: 'none' }}
              >
                <Package className="w-4 h-4 inline ml-1" />
                פרסם מסירה ראשונה
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
