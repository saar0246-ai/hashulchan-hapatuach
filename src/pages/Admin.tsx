import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Calendar, Flag, Home, Shield, Search, Ban, CheckCircle,
  XCircle, Trash2, ChevronLeft, BarChart3, Edit2, X, Clock,
  TrendingUp, TrendingDown, MessageSquare, CheckSquare,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Report } from '../types'
import {
  REPORT_REASON_LABELS,
  KASHRUT_LABELS,
  RELIGIOUS_LABELS,
  EVENT_TYPE_LABELS,
  KASHRUT_COLORS,
} from '../types'
import type { KashrutLevel, ReligiousLevel, EventType } from '../types'
import ProfileAvatar from '../components/ProfileAvatar'
import LoadingSpinner from '../components/LoadingSpinner'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'analytics' | 'pending' | 'users' | 'events' | 'shabbat' | 'reports'

interface AdminUser {
  id: string; display_name: string; email: string; city: string | null
  religious_level: ReligiousLevel | null; kashrut_level: KashrutLevel | null
  gender: string | null; birthday: string | null; phone: string | null
  role: string; is_banned: boolean; onboarding_completed: boolean
  total_hosted: number; total_guested: number
  rating_as_host: number; rating_count_host: number
  created_at: string; last_sign_in_at: string | null
}

interface ShabbatEvent {
  id: string; title: string; host_name: string; city: string
  event_date: string; event_time: string; event_type: string
  max_guests: number; current_guests: number; kashrut_level: string
  guest_names: string[] | null
}

interface AdminEvent {
  id: string; title: string; event_type: string; event_date: string
  event_time: string; city: string; status: string
  max_guests: number; current_guests: number; kashrut_level: string
  host: { display_name: string; id: string } | null
}

interface Stats {
  total_users: number; total_events: number; active_events: number
  total_bookings: number; pending_reports: number; banned_users: number
}

interface AnalyticsData {
  reg_by_status: { status: string; cnt: number }[] | null
  events_by_city: { city: string; cnt: number }[] | null
  events_by_type: { event_type: string; cnt: number }[] | null
  users_last_7: number
  users_prev_7: number
  events_last_7: number
  bookings_last_7: number
  top_hosts: { display_name: string; total_hosted: number; rating_as_host: number; city: string | null }[] | null
  recent_activity: { kind: string; label: string; sub: string | null; created_at: string }[] | null
}

interface PendingRegistration {
  id: string
  status: string
  message_to_host: string | null
  created_at: string
  event: {
    id: string; title: string; event_date: string; event_time: string; city: string
    host: { id: string; display_name: string; phone: string | null } | null
  } | null
  guest: {
    id: string; display_name: string; phone: string | null
    city: string | null; kashrut_level: KashrutLevel | null; religious_level: ReligiousLevel | null
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function waLink(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '').replace(/^0/, '')
  return `https://wa.me/972${digits}`
}

function timeSince(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { locale: he, addSuffix: true })
  } catch {
    return ''
  }
}

// ─── Tab config ──────────────────────────────────────────────────────────────

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',   label: 'סקירה',       icon: BarChart3     },
  { id: 'analytics',  label: 'אנליטיקס',    icon: TrendingUp    },
  { id: 'pending',    label: 'ממתינות',      icon: Clock         },
  { id: 'users',      label: 'משתמשים',     icon: Users         },
  { id: 'events',     label: 'אירועים',     icon: Calendar      },
  { id: 'shabbat',    label: 'השבת',        icon: Home          },
  { id: 'reports',    label: 'דיווחים',     icon: Flag          },
]

// ─── Analytics bar chart (CSS only) ──────────────────────────────────────────

function HBarChart({
  items, color, maxVal,
}: {
  items: { label: string; value: number; pct?: number }[]
  color: string
  maxVal: number
}) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.label} className="space-y-0.5">
          <div className="flex justify-between text-xs">
            <span className="text-foreground font-medium">{item.label}</span>
            <span className="text-muted-foreground">
              {item.value}{item.pct !== undefined ? ` (${item.pct}%)` : ''}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: maxVal > 0 ? `${Math.min(100, (item.value / maxVal) * 100)}%` : '0%',
                background: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [shabbatEvents, setShabbatEvents] = useState<ShabbatEvent[]>([])
  const [reports, setReports] = useState<(Report & { reporter?: { display_name: string }; reported?: { display_name: string } })[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [pendingRegs, setPendingRegs] = useState<PendingRegistration[]>([])
  const [pendingError, setPendingError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'admins' | 'banned'>('all')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [promoteEmail, setPromoteEmail] = useState('')
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)
  const [editForm, setEditForm] = useState({ title: '', max_guests: '', description: '', status: '' })

  // ── Fetchers ────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    const [u, e, b, r] = await Promise.all([
      supabase.from('profiles').select('id, is_banned', { count: 'exact', head: false }),
      supabase.from('events').select('id, status', { count: 'exact', head: false }),
      supabase.from('event_registrations').select('id', { count: 'exact', head: false }),
      supabase.from('reports').select('id, status', { count: 'exact', head: false }),
    ])
    setStats({
      total_users: u.count ?? 0,
      total_events: e.count ?? 0,
      active_events: (e.data ?? []).filter((ev: { status: string }) => ev.status === 'active').length,
      total_bookings: b.count ?? 0,
      pending_reports: (r.data ?? []).filter((rp: { status: string }) => rp.status === 'pending').length,
      banned_users: (u.data ?? []).filter((us: { is_banned: boolean }) => us.is_banned).length,
    })
  }, [])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setAnalyticsError(null)
    const { data, error } = await supabase.rpc('admin_get_analytics')
    if (error) {
      setAnalyticsError(error.message)
    } else {
      setAnalytics(data as AnalyticsData)
    }
    setLoading(false)
  }, [])

  const fetchPending = useCallback(async () => {
    setLoading(true)
    setPendingError(null)
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        id, status, message_to_host, created_at,
        event:events(id, title, event_date, event_time, city,
          host:profiles!host_id(id, display_name, phone)),
        guest:profiles!guest_id(id, display_name, phone, city, kashrut_level, religious_level)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) {
      setPendingError(error.message)
    } else {
      setPendingRegs((data ?? []) as unknown as PendingRegistration[])
    }
    setLoading(false)
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_users')
    if (error) toast.error('שגיאה בטעינת משתמשים: ' + error.message)
    else setUsers(data ?? [])
    setLoading(false)
  }, [])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*, host:profiles!host_id(id, display_name)')
      .order('event_date', { ascending: false })
      .limit(100)
    setEvents(data ?? [])
    setLoading(false)
  }, [])

  const fetchShabbat = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_shabbat_events')
    if (error) toast.error('שגיאה: ' + error.message)
    else setShabbatEvents(data ?? [])
    setLoading(false)
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reporter_id(display_name), reported:profiles!reported_id(display_name)')
      .order('created_at', { ascending: false })
    setReports(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => {
    if (tab === 'analytics') fetchAnalytics()
    else if (tab === 'pending') fetchPending()
    else if (tab === 'users') fetchUsers()
    else if (tab === 'events') fetchEvents()
    else if (tab === 'shabbat') fetchShabbat()
    else if (tab === 'reports') fetchReports()
  }, [tab, fetchAnalytics, fetchPending, fetchUsers, fetchEvents, fetchShabbat, fetchReports])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const banUser = async (userId: string, ban: boolean) => {
    const { error } = await supabase.rpc('admin_ban_user', { target_id: userId, ban_state: ban })
    if (error) toast.error('שגיאה')
    else { toast.success(ban ? 'משתמש הושעה' : 'ההשעיה בוטלה'); fetchUsers() }
  }

  const makeAdmin = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId)
    if (error) toast.error('שגיאה')
    else { toast.success('הרשאות אדמין ניתנו'); fetchUsers() }
  }

  const removeAdmin = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ role: 'user' }).eq('id', userId)
    if (error) toast.error('שגיאה')
    else { toast.success('הרשאות אדמין הוסרו'); fetchUsers() }
  }

  const cancelEvent = async (eventId: string) => {
    const { error } = await supabase.rpc('admin_cancel_event', { target_event_id: eventId })
    if (error) toast.error('שגיאה')
    else { toast.success('האירוע בוטל'); fetchEvents() }
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`למחוק לצמיתות את המשתמש "${userName}"? פעולה זו אינה הפיכה.`)) return
    const { error } = await supabase.rpc('admin_delete_user', { target_id: userId })
    if (error) {
      const { error: banErr } = await supabase.rpc('admin_ban_user', { target_id: userId, ban_state: true })
      if (banErr) toast.error('שגיאה במחיקה')
      else toast.success('המשתמש הושעה (נדרש RPC למחיקה מלאה)')
    } else {
      toast.success('המשתמש נמחק')
      fetchUsers()
    }
  }

  const makeAdminByEmail = async () => {
    if (!promoteEmail.trim()) { toast.error('יש להזין כתובת מייל'); return }
    const match = users.find(u => u.email?.toLowerCase() === promoteEmail.trim().toLowerCase())
    if (!match) {
      toast.error('לא נמצא משתמש עם מייל זה — יש לוודא שהמשתמש נרשם לאתר')
      return
    }
    await makeAdmin(match.id)
    setPromoteEmail('')
  }

  const openEditEvent = (ev: AdminEvent) => {
    setEditingEvent(ev)
    setEditForm({ title: ev.title, max_guests: String(ev.max_guests), description: '', status: ev.status })
  }

  const saveEditEvent = async () => {
    if (!editingEvent) return
    const { error } = await supabase.from('events').update({
      title: editForm.title.trim() || editingEvent.title,
      max_guests: Number(editForm.max_guests) || editingEvent.max_guests,
      status: editForm.status || editingEvent.status,
    }).eq('id', editingEvent.id)
    if (error) toast.error('שגיאה בשמירה')
    else { toast.success('האירוע עודכן'); setEditingEvent(null); fetchEvents() }
  }

  const resolveReport = async (reportId: string, status: string) => {
    const { error } = await supabase.rpc('admin_resolve_report', {
      report_id: reportId,
      new_status: status,
      notes: adminNotes || null,
    })
    if (error) toast.error('שגיאה')
    else { toast.success('הדיווח עודכן'); setSelectedReport(null); setAdminNotes(''); fetchReports() }
  }

  const approveReg = async (regId: string) => {
    const { error } = await supabase.rpc('admin_approve_registration', { reg_id: regId })
    if (error) {
      toast.error('שגיאה: ' + error.message + ' — יש להפעיל RPC בסופאבייס (supabase/admin_setup.sql)')
    } else {
      toast.success('ההזמנה אושרה ✓')
      fetchPending()
    }
  }

  const rejectReg = async (regId: string) => {
    const { error } = await supabase.rpc('admin_reject_registration', { reg_id: regId })
    if (error) {
      toast.error('שגיאה: ' + error.message + ' — יש להפעיל RPC בסופאבייס (supabase/admin_setup.sql)')
    } else {
      toast.success('ההזמנה נדחתה')
      fetchPending()
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filteredUsers = users.filter(u => {
    const matchSearch = !search ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      userFilter === 'all' ? true :
      userFilter === 'admins' ? u.role === 'admin' :
      u.is_banned
    return matchSearch && matchFilter
  })

  // ── Pending count (for tab badge) ────────────────────────────────────────────
  const pendingCount = pendingRegs.length

  // ════════════════════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-dvh bg-background" dir="rtl">

      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-30 glass"
        style={{ borderBottom: '1px solid hsl(var(--border)/0.6)', padding: '12px 16px' }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
            <span className="font-display font-bold text-base text-foreground">לוח ניהול</span>
          </div>
          <Link to="/home" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            חזור לאתר <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-[53px] z-20 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto flex overflow-x-auto no-scrollbar">
          {TAB_CONFIG.map(t => {
            const Icon = t.icon
            const badge =
              t.id === 'reports' && stats?.pending_reports ? stats.pending_reports :
              t.id === 'pending' && pendingCount > 0 ? pendingCount :
              null
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {badge ? (
                  <span className="w-4 h-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ════════════════════════════════ Overview ════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-foreground">סקירת פלטפורמה</h2>

            {!stats ? <LoadingSpinner /> : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'משתמשים רשומים', value: stats.total_users,    icon: '👥', color: '#3B82F6' },
                  { label: 'אירועים פעילים',  value: stats.active_events,  icon: '🍽️', color: '#10B981' },
                  { label: 'הזמנות כולל',     value: stats.total_bookings, icon: '📋', color: '#8B5CF6' },
                  { label: 'דיווחים פתוחים',  value: stats.pending_reports, icon: '⚠️', color: '#F59E0B' },
                  { label: 'מושעים',           value: stats.banned_users,   icon: '🚫', color: '#EF4444' },
                  { label: 'אירועים סה"כ',    value: stats.total_events,   icon: '📅', color: '#6B7280' },
                ].map(s => (
                  <div key={s.label} className="shulchan-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-2xl font-black text-foreground">{s.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick nav */}
            <div className="shulchan-card p-4">
              <p className="text-sm font-semibold text-foreground mb-3">🔗 ניווט מהיר</p>
              <div className="flex flex-wrap gap-2">
                {TAB_CONFIG.filter(t => t.id !== 'overview').map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Founders block */}
            <div className="shulchan-card p-4 space-y-3">
              <p className="font-semibold text-foreground text-sm">🛡️ מייסדי הפלטפורמה</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'צחי', role: 'מייסד' },
                  { name: 'תאיר', role: 'מייסד' },
                  { name: 'טל', role: 'מייסד' },
                ].map(f => (
                  <div key={f.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-lg">👑</span>
                    <div>
                      <p className="text-sm font-bold text-amber-900">{f.name}</p>
                      <p className="text-[10px] text-amber-700">{f.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promote by email */}
            <div className="shulchan-card p-4 space-y-3">
              <p className="font-semibold text-foreground text-sm">📧 הענקת הרשאות אדמין לפי מייל</p>
              <p className="text-xs text-muted-foreground">המשתמש חייב להיות רשום באתר</p>
              <div className="flex gap-2">
                <input
                  value={promoteEmail}
                  onChange={e => setPromoteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="shulchan-input flex-1 text-sm"
                  dir="ltr"
                  onKeyDown={e => e.key === 'Enter' && makeAdminByEmail()}
                />
                <button
                  onClick={makeAdminByEmail}
                  className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-semibold text-sm hover:bg-amber-200 transition-all flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />הפוך לאדמין
                </button>
              </div>
            </div>

            <div className="shulchan-card p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground text-sm mb-2">📋 הרשאות ניהול</p>
              <p>• השעיית/ביטול השעיית משתמשים ומחיקתם</p>
              <p>• עריכה וביטול אירועים</p>
              <p>• ניהול דיווחים מהמשתמשים</p>
              <p>• אישור/דחיית הזמנות ממתינות</p>
              <p>• צפייה בכל ארוחות השבת הקרובות + רשימת אורחים</p>
              <p>• הענקת הרשאות אדמין למשתמשים אחרים</p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════ Analytics ════════════════════════════════ */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">אנליטיקס</h2>
              <button onClick={fetchAnalytics} className="text-xs text-primary">רענן</button>
            </div>

            {loading && <LoadingSpinner />}

            {analyticsError && (
              <div className="shulchan-card p-5 border-l-4 border-amber-400 bg-amber-50 space-y-2">
                <p className="font-semibold text-amber-800 text-sm">⚠️ יש להפעיל RPC בסופאבייס</p>
                <p className="text-xs text-amber-700">
                  הפונקציה <code className="bg-amber-100 px-1 rounded">admin_get_analytics</code> לא קיימת עדיין.
                  הפעל את הקובץ <code className="bg-amber-100 px-1 rounded">supabase/admin_setup.sql</code> ב-Supabase SQL Editor.
                </p>
                <p className="text-xs text-muted-foreground mt-1">שגיאה: {analyticsError}</p>
              </div>
            )}

            {!loading && analytics && (() => {
              // ── Growth cards ──
              const regByStatus = analytics.reg_by_status ?? []
              const pendingCnt = regByStatus.find(r => r.status === 'pending')?.cnt ?? 0
              const totalReg   = regByStatus.reduce((s, r) => s + r.cnt, 0)

              const usersDelta  = analytics.users_prev_7 > 0
                ? Math.round(((analytics.users_last_7 - analytics.users_prev_7) / analytics.users_prev_7) * 100)
                : null

              const growthCards = [
                {
                  label: 'משתמשים חדשים השבוע',
                  value: analytics.users_last_7,
                  delta: usersDelta,
                  icon: '👥',
                },
                {
                  label: 'ארוחות חדשות השבוע',
                  value: analytics.events_last_7,
                  delta: null,
                  icon: '🍽️',
                },
                {
                  label: 'הזמנות השבוע',
                  value: analytics.bookings_last_7,
                  delta: null,
                  icon: '📋',
                },
                {
                  label: 'הזמנות ממתינות',
                  value: pendingCnt,
                  delta: null,
                  icon: '⏳',
                },
              ]

              // ── Registration by status ──
              const statusLabels: Record<string, { label: string; color: string }> = {
                pending:   { label: 'ממתין',  color: '#C8860A' },
                approved:  { label: 'מאושר', color: '#10B981' },
                rejected:  { label: 'נדחה',   color: '#EF4444' },
                cancelled: { label: 'בוטל',   color: '#9CA3AF' },
              }
              const regItems = Object.entries(statusLabels).map(([key, meta]) => {
                const cnt = regByStatus.find(r => r.status === key)?.cnt ?? 0
                const pct = totalReg > 0 ? Math.round((cnt / totalReg) * 100) : 0
                return { label: meta.label, value: cnt, pct, color: meta.color }
              })
              const maxReg = Math.max(...regItems.map(r => r.value), 1)

              // ── Events by city ──
              const cities = analytics.events_by_city ?? []
              const maxCity = Math.max(...cities.map(c => c.cnt), 1)

              // ── Events by type ──
              const byType = analytics.events_by_type ?? []
              const eventTypeKeys: EventType[] = ['shabbat_dinner', 'shabbat_lunch', 'holiday', 'weekday']

              // ── Top hosts ──
              const topHosts = analytics.top_hosts ?? []

              return (
                <>
                  {/* Growth cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {growthCards.map(card => (
                      <div key={card.label} className="shulchan-card p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{card.icon}</span>
                          <span className="text-2xl font-black text-foreground">{card.value}</span>
                          {card.delta !== null && (
                            <span className={`text-xs font-bold flex items-center gap-0.5 ${card.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {card.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {Math.abs(card.delta)}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">{card.label}</p>
                        {card.label === 'משתמשים חדשים השבוע' && analytics.users_prev_7 > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            שבוע קודם: {analytics.users_prev_7}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Registration by status */}
                  <div className="shulchan-card p-5 space-y-4">
                    <p className="font-semibold text-foreground text-sm">📊 הזמנות לפי סטטוס</p>
                    <div className="space-y-3">
                      {regItems.map(item => (
                        <div key={item.label} className="space-y-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-foreground">{item.label}</span>
                            <span className="text-muted-foreground">{item.value} ({item.pct}%)</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: maxReg > 0 ? `${(item.value / maxReg) * 100}%` : '0%',
                                background: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Events by city */}
                  <div className="shulchan-card p-5 space-y-4">
                    <p className="font-semibold text-foreground text-sm">🏙️ ארוחות לפי עיר (פעילות)</p>
                    {cities.length === 0 ? (
                      <p className="text-xs text-muted-foreground">אין נתונים</p>
                    ) : (
                      <HBarChart
                        items={cities.map(c => ({ label: c.city, value: c.cnt }))}
                        color="#C0522A"
                        maxVal={maxCity}
                      />
                    )}
                  </div>

                  {/* Events by type */}
                  <div className="shulchan-card p-5 space-y-4">
                    <p className="font-semibold text-foreground text-sm">🍷 ארוחות לפי סוג</p>
                    <div className="flex flex-wrap gap-2">
                      {eventTypeKeys.map(key => {
                        const cnt = byType.find(t => t.event_type === key)?.cnt ?? 0
                        return (
                          <div
                            key={key}
                            className="flex flex-col items-center px-4 py-3 rounded-xl bg-muted"
                            style={{ minWidth: 80 }}
                          >
                            <span className="text-2xl font-black text-foreground">{cnt}</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5 text-center">
                              {EVENT_TYPE_LABELS[key]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Top hosts */}
                  {topHosts.length > 0 && (
                    <div className="shulchan-card p-5 space-y-3">
                      <p className="font-semibold text-foreground text-sm">🏆 מארחים מובילים</p>
                      <div className="space-y-2">
                        {topHosts.map((h, i) => (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                              style={{ background: i === 0 ? '#C8860A' : i === 1 ? '#9CA3AF' : i === 2 ? '#C0522A' : '#E5E7EB', color: i < 3 ? '#fff' : '#374151' }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{h.display_name}</p>
                              <p className="text-[11px] text-muted-foreground">{h.city || '—'}</p>
                            </div>
                            <div className="text-left flex-shrink-0">
                              <p className="text-sm font-bold text-foreground">{h.total_hosted}</p>
                              <p className="text-[10px] text-muted-foreground">ארוחות</p>
                            </div>
                            {h.rating_as_host > 0 && (
                              <div className="text-left flex-shrink-0">
                                <p className="text-sm font-bold text-amber-600">★ {h.rating_as_host.toFixed(1)}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* ════════════════════════════════ Pending ════════════════════════════════ */}
        {tab === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">
                הזמנות ממתינות
                {pendingCount > 0 && (
                  <span className="mr-2 text-sm font-normal text-muted-foreground">({pendingCount})</span>
                )}
              </h2>
              <button onClick={fetchPending} className="text-xs text-primary">רענן</button>
            </div>

            {loading && <LoadingSpinner />}

            {pendingError && (
              <div className="shulchan-card p-5 border-l-4 border-red-400 bg-red-50 space-y-2">
                <p className="font-semibold text-red-800 text-sm">⚠️ שגיאה בטעינת הזמנות ממתינות</p>
                <p className="text-xs text-red-700">
                  ייתכן שמדיניות RLS מונעת גישה. ודא שלאדמין יש הרשאה לקרוא את <code className="bg-red-100 px-1 rounded">event_registrations</code>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">שגיאה: {pendingError}</p>
              </div>
            )}

            {!loading && !pendingError && pendingRegs.length === 0 && (
              <div className="text-center py-14">
                <CheckSquare className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                <p className="text-sm text-muted-foreground">אין הזמנות ממתינות כרגע</p>
              </div>
            )}

            {!loading && !pendingError && pendingRegs.length > 0 && (
              <div className="space-y-3">
                {pendingRegs.map(reg => {
                  const wa = waLink(reg.guest?.phone)
                  const hostWa = waLink(reg.event?.host?.phone)
                  return (
                    <div key={reg.id} className="shulchan-card p-4 space-y-3"
                      style={{ borderRight: '3px solid #C8860A' }}>

                      {/* Event info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">
                            {reg.event?.title || '—'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {reg.event?.city || '—'} ·{' '}
                            {reg.event?.event_date
                              ? format(new Date(reg.event.event_date + 'T00:00:00'), 'EEEE d/M/yy', { locale: he })
                              : '—'}{' '}
                            {reg.event?.event_time?.slice(0, 5)}
                          </p>
                          {reg.event?.host && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <p className="text-xs text-muted-foreground">
                                מארח: <span className="text-foreground font-medium">{reg.event.host.display_name}</span>
                              </p>
                              {hostWa && (
                                <a
                                  href={hostWa}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium"
                                >
                                  WA
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-left flex-shrink-0">
                          <span className="text-[10px] text-muted-foreground">{timeSince(reg.created_at)}</span>
                        </div>
                      </div>

                      {/* Guest info */}
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/60">
                        <ProfileAvatar name={reg.guest?.display_name || '?'} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">{reg.guest?.display_name || '—'}</p>
                            {reg.guest?.kashrut_level && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${KASHRUT_COLORS[reg.guest.kashrut_level]}`}>
                                {KASHRUT_LABELS[reg.guest.kashrut_level]}
                              </span>
                            )}
                            {reg.guest?.religious_level && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {RELIGIOUS_LABELS[reg.guest.religious_level]}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{reg.guest?.city || '—'}</p>
                        </div>
                        <div className="flex-shrink-0 flex gap-1">
                          {reg.guest?.phone && (
                            <span className="text-[10px] text-muted-foreground" dir="ltr">{reg.guest.phone}</span>
                          )}
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Message to host */}
                      {reg.message_to_host && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40">
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground">{reg.message_to_host}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-1 border-t border-border/40">
                        <button
                          onClick={() => approveReg(reg.id)}
                          className="flex-1 text-xs py-2 rounded-xl bg-emerald-100 text-emerald-700 font-semibold hover:bg-emerald-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />אשר
                        </button>
                        <button
                          onClick={() => rejectReg(reg.id)}
                          className="flex-1 text-xs py-2 rounded-xl bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />דחה
                        </button>
                        <Link
                          to={`/profile/${reg.guest?.id}`}
                          className="px-3 text-xs py-2 rounded-xl bg-muted text-foreground font-medium flex items-center gap-1"
                        >
                          פרופיל
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════ Users ════════════════════════════════ */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">ניהול משתמשים</h2>
              <button onClick={fetchUsers} className="text-xs text-primary">רענן</button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="חפש שם או אימייל..."
                className="shulchan-input pr-10 text-sm"
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-2">
              {([
                { key: 'all', label: 'הכל' },
                { key: 'admins', label: 'רק אדמינים' },
                { key: 'banned', label: 'מושעים' },
              ] as { key: typeof userFilter; label: string }[]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setUserFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    userFilter === f.key
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="mr-auto text-xs text-muted-foreground self-center">{filteredUsers.length} משתמשים</span>
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="space-y-2">
                {filteredUsers.map(u => {
                  const wa = waLink(u.phone)
                  return (
                    <div
                      key={u.id}
                      className="shulchan-card p-4 space-y-3"
                      style={u.is_banned ? { borderRight: '3px solid #EF4444', opacity: 0.75 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <ProfileAvatar name={u.display_name || '?'} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground text-sm">{u.display_name || '—'}</p>
                            {u.role === 'admin' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">ADMIN</span>
                            )}
                            {u.is_banned && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">מושעה</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {u.kashrut_level && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${KASHRUT_COLORS[u.kashrut_level]}`}>
                                {KASHRUT_LABELS[u.kashrut_level]}
                              </span>
                            )}
                            {u.religious_level && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {RELIGIOUS_LABELS[u.religious_level]}
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {u.city || '—'} · 🏠{u.total_hosted} 🍽️{u.total_guested}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground text-left flex-shrink-0 space-y-0.5">
                          <div>{u.created_at ? format(new Date(u.created_at), 'd/M/yy') : '—'}</div>
                          {u.last_sign_in_at && (
                            <div>כניסה: {format(new Date(u.last_sign_in_at), 'd/M/yy')}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-border/50 flex-wrap">
                        <Link to={`/profile/${u.id}`} className="flex-1 text-center text-xs py-1.5 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-all">
                          צפה בפרופיל
                        </Link>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1"
                          >
                            WhatsApp
                          </a>
                        )}
                        {u.id !== user?.id && (
                          <>
                            <button
                              onClick={() => banUser(u.id, !u.is_banned)}
                              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                                u.is_banned
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {u.is_banned
                                ? <><CheckCircle className="w-3.5 h-3.5" />בטל השעיה</>
                                : <><Ban className="w-3.5 h-3.5" />השעה</>}
                            </button>
                            {u.role !== 'admin' ? (
                              <button
                                onClick={() => makeAdmin(u.id)}
                                className="px-3 text-xs py-1.5 rounded-lg bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 transition-all flex items-center gap-1"
                              >
                                <Shield className="w-3.5 h-3.5" />אדמין
                              </button>
                            ) : (
                              <button
                                onClick={() => { if (confirm('להסיר הרשאות אדמין?')) removeAdmin(u.id) }}
                                className="px-3 text-xs py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 font-medium hover:bg-amber-100 transition-all flex items-center gap-1"
                              >
                                <Shield className="w-3.5 h-3.5" />הסר
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(u.id, u.display_name)}
                              className="px-3 text-xs py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 font-medium hover:bg-red-100 transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />מחק
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredUsers.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center py-8">לא נמצאו משתמשים</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════ Events ════════════════════════════════ */}
        {tab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">ניהול אירועים</h2>
              <button onClick={fetchEvents} className="text-xs text-primary">רענן</button>
            </div>
            {loading ? <LoadingSpinner /> : (
              <div className="space-y-2">
                {events.map(ev => (
                  <div
                    key={ev.id}
                    className="shulchan-card p-4"
                    style={ev.status !== 'active' ? { opacity: 0.6 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-foreground text-sm">{ev.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            ev.status === 'active'    ? 'bg-emerald-100 text-emerald-700' :
                            ev.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{ev.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          מארח: {ev.host?.display_name || '—'} · {ev.city}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(ev.event_date + 'T00:00:00'), 'EEEE d/M/yy', { locale: he })} {ev.event_time?.slice(0, 5)}
                          · {ev.current_guests}/{ev.max_guests} אורחים
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {KASHRUT_LABELS[ev.kashrut_level as KashrutLevel] || ev.kashrut_level}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <Link
                          to={`/events/${ev.id}`}
                          className="text-xs px-2.5 py-1 rounded-lg bg-muted text-foreground font-medium text-center"
                        >
                          צפה
                        </Link>
                        <button
                          onClick={() => openEditEvent(ev)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />ערוך
                        </button>
                        {ev.status === 'active' && (
                          <button
                            onClick={() => { if (confirm('לבטל את האירוע?')) cancelEvent(ev.id) }}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-medium flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />בטל
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {events.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center py-8">אין אירועים</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════ Shabbat ════════════════════════════════ */}
        {tab === 'shabbat' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">🍽️ ארוחות השבת הקרובות</h2>
              <button onClick={fetchShabbat} className="text-xs text-primary">רענן</button>
            </div>
            <p className="text-xs text-muted-foreground">14 הימים הקרובים — ארוחות שישי ושבת</p>
            {loading ? <LoadingSpinner /> : shabbatEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">אין ארוחות שבת קרובות</p>
            ) : (
              <div className="space-y-3">
                {shabbatEvents.map(ev => (
                  <div key={ev.id} className="shulchan-card p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{ev.event_type === 'shabbat_dinner' ? '🌙' : '☀️'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-foreground text-sm">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(ev.event_date + 'T00:00:00'), 'EEEE d/M', { locale: he })} · {ev.event_time?.slice(0, 5)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          מארח: <span className="font-medium text-foreground">{ev.host_name}</span> · {ev.city}
                          · {KASHRUT_LABELS[ev.kashrut_level as KashrutLevel] || ev.kashrut_level}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-right flex-shrink-0">
                        <span style={{ color: ev.current_guests >= ev.max_guests ? '#EF4444' : '#10B981' }}>
                          {ev.current_guests}/{ev.max_guests}
                        </span>
                        <div className="text-muted-foreground font-normal">אורחים</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (ev.current_guests / ev.max_guests) * 100)}%`,
                          background: ev.current_guests >= ev.max_guests ? '#EF4444' : 'linear-gradient(90deg, #C8860A, #F5C240)',
                        }}
                      />
                    </div>
                    {ev.guest_names && ev.guest_names.length > 0 ? (
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">אורחים מאושרים:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ev.guest_names.map((name, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">אין אורחים מאושרים עדיין</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════ Reports ════════════════════════════════ */}
        {tab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">ניהול דיווחים</h2>
              <button onClick={fetchReports} className="text-xs text-primary">רענן</button>
            </div>
            {loading ? <LoadingSpinner /> : reports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">אין דיווחים</p>
            ) : (
              <div className="space-y-3">
                {reports.map(rep => (
                  <div
                    key={rep.id}
                    className="shulchan-card p-4 space-y-3"
                    style={{
                      borderRight: `3px solid ${
                        rep.status === 'pending' ? '#F59E0B' :
                        rep.status === 'resolved' ? '#10B981' :
                        '#9CA3AF'
                      }`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            rep.status === 'pending'  ? 'bg-amber-100 text-amber-800' :
                            rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{rep.status}</span>
                          <span className="text-xs font-semibold text-destructive">
                            {REPORT_REASON_LABELS[rep.reason]}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          <span className="text-muted-foreground">מדווח:</span>{' '}
                          <strong>{(rep.reported as unknown as { display_name: string })?.display_name || '—'}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          דיווח על ידי: {(rep.reporter as unknown as { display_name: string })?.display_name || '—'} ·{' '}
                          {format(new Date(rep.created_at), 'd/M/yy HH:mm')}
                        </p>
                        {rep.details && (
                          <p className="text-xs text-foreground mt-1.5 p-2 rounded-lg bg-muted">{rep.details}</p>
                        )}
                        {rep.admin_notes && (
                          <p className="text-xs text-amber-700 mt-1">הערות: {rep.admin_notes}</p>
                        )}
                      </div>
                    </div>

                    {rep.status === 'pending' && (
                      selectedReport === rep.id ? (
                        <div className="space-y-2 pt-2 border-t border-border/50">
                          <textarea
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                            placeholder="הערות אדמין (אופציונלי)..."
                            className="shulchan-input resize-none h-16 text-xs"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => resolveReport(rep.id, 'resolved')}
                              className="text-xs py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-medium flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />פתרון
                            </button>
                            <button
                              onClick={() => resolveReport(rep.id, 'dismissed')}
                              className="text-xs py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium flex items-center justify-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />דחה
                            </button>
                            <button
                              onClick={() => setSelectedReport(null)}
                              className="text-xs py-1.5 rounded-lg bg-muted text-foreground font-medium"
                            >
                              ביטול
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2 border-t border-border/50">
                          <button
                            onClick={() => setSelectedReport(rep.id)}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-primary/10 text-primary font-medium"
                          >
                            טפל בדיווח
                          </button>
                          <button
                            onClick={() => {
                              const userId = rep.reported_id
                              if (userId && confirm('להשעות את המשתמש?')) {
                                supabase.rpc('admin_ban_user', { target_id: userId, ban_state: true })
                                  .then(({ error }) => {
                                    if (error) toast.error('שגיאה')
                                    else { toast.success('משתמש הושעה'); resolveReport(rep.id, 'resolved') }
                                  })
                              }
                            }}
                            className="px-3 text-xs py-1.5 rounded-lg bg-red-100 text-red-700 font-medium flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" />השעה
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════ Edit Event Modal ════════════════════════════════ */}
      {editingEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditingEvent(null) }}
        >
          <div className="bg-background rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-base">עריכת אירוע</h3>
              <button onClick={() => setEditingEvent(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">כותרת</label>
                <input
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="shulchan-input"
                  placeholder={editingEvent.title}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">מקסימום אורחים</label>
                <input
                  type="number"
                  value={editForm.max_guests}
                  onChange={e => setEditForm(f => ({ ...f, max_guests: e.target.value }))}
                  className="shulchan-input"
                  min="1" max="50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">סטטוס</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="shulchan-input"
                >
                  <option value="active">פעיל</option>
                  <option value="cancelled">מבוטל</option>
                  <option value="completed">הושלם</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={saveEditEvent}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-all"
              >
                שמור שינויים
              </button>
              <button
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2.5 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
