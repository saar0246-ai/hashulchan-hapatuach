import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Flag, Home, Shield, Search, Ban, CheckCircle, XCircle, Trash2, ChevronLeft, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Report } from '../types'
import { REPORT_REASON_LABELS, KASHRUT_LABELS } from '../types'
import ProfileAvatar from '../components/ProfileAvatar'
import LoadingSpinner from '../components/LoadingSpinner'

type Tab = 'overview' | 'users' | 'events' | 'shabbat' | 'reports'

interface AdminUser {
  id: string; display_name: string; email: string; city: string | null
  religious_level: string | null; kashrut_level: string | null; gender: string | null
  birthday: string | null; phone: string | null; role: string; is_banned: boolean
  onboarding_completed: boolean; total_hosted: number; total_guested: number
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

const TAB_CONFIG = [
  { id: 'overview' as Tab, label: 'סקירה',    icon: BarChart3  },
  { id: 'users'    as Tab, label: 'משתמשים',  icon: Users      },
  { id: 'events'   as Tab, label: 'אירועים',  icon: Calendar   },
  { id: 'shabbat'  as Tab, label: 'השבת',     icon: Home       },
  { id: 'reports'  as Tab, label: 'דיווחים',  icon: Flag       },
]

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [shabbatEvents, setShabbatEvents] = useState<ShabbatEvent[]>([])
  const [reports, setReports] = useState<(Report & { reporter?: { display_name: string }; reported?: { display_name: string } })[]>([])
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

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
    if (tab === 'users') fetchUsers()
    else if (tab === 'events') fetchEvents()
    else if (tab === 'shabbat') fetchShabbat()
    else if (tab === 'reports') fetchReports()
  }, [tab, fetchUsers, fetchEvents, fetchShabbat, fetchReports])

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

  const cancelEvent = async (eventId: string) => {
    const { error } = await supabase.rpc('admin_cancel_event', { target_event_id: eventId })
    if (error) toast.error('שגיאה')
    else { toast.success('האירוע בוטל'); fetchEvents() }
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

  const filteredUsers = users.filter(u =>
    !search || u.display_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-dvh bg-background" dir="rtl">
      {/* Top bar */}
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

      {/* Tabs */}
      <div className="sticky top-[53px] z-20 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto flex overflow-x-auto no-scrollbar">
          {TAB_CONFIG.map(t => {
            const Icon = t.icon
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
                {t.id === 'reports' && stats?.pending_reports ? (
                  <span className="w-4 h-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center">
                    {stats.pending_reports}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-foreground">סקירת פלטפורמה</h2>
            {!stats ? <LoadingSpinner /> : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'משתמשים רשומים', value: stats.total_users, icon: '👥', color: '#3B82F6' },
                  { label: 'אירועים פעילים', value: stats.active_events, icon: '🍽️', color: '#10B981' },
                  { label: 'הזמנות כולל', value: stats.total_bookings, icon: '📋', color: '#8B5CF6' },
                  { label: 'דיווחים פתוחים', value: stats.pending_reports, icon: '⚠️', color: '#F59E0B' },
                  { label: 'משתמשים מושעים', value: stats.banned_users, icon: '🚫', color: '#EF4444' },
                  { label: 'אירועים סה"כ', value: stats.total_events, icon: '📅', color: '#6B7280' },
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

            <div className="shulchan-card p-4">
              <p className="text-sm font-semibold text-foreground mb-2">🔗 ניווט מהיר</p>
              <div className="flex flex-wrap gap-2">
                {TAB_CONFIG.slice(1).map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-all">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="shulchan-card p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground text-sm mb-2">🛡️ הרשאות אדמין</p>
              <p>• השעיית/ביטול השעיית משתמשים</p>
              <p>• ביטול אירועים</p>
              <p>• ניהול דיווחים מהמשתמשים</p>
              <p>• צפייה בכל הארוחות השבת הקרובה + רשימת אורחים</p>
              <p>• הענקת הרשאות אדמין למשתמשים אחרים</p>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">ניהול משתמשים</h2>
              <button onClick={fetchUsers} className="text-xs text-primary">רענן</button>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="חפש שם או אימייל..."
                className="shulchan-input pr-10 text-sm"
              />
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="space-y-2">
                {filteredUsers.map(u => (
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
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {u.city || '—'} · {u.religious_level || '—'} · 🏠{u.total_hosted} 🍽️{u.total_guested}
                        </p>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-left flex-shrink-0">
                        {u.created_at ? format(new Date(u.created_at), 'd/M/yy') : '—'}
                        {u.last_sign_in_at && (
                          <div>כניסה: {format(new Date(u.last_sign_in_at), 'd/M/yy')}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-border/50">
                      <Link to={`/profile/${u.id}`} className="flex-1 text-center text-xs py-1.5 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-all">
                        צפה בפרופיל
                      </Link>
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
                            {u.is_banned ? <><CheckCircle className="w-3.5 h-3.5" />בטל השעיה</> : <><Ban className="w-3.5 h-3.5" />השעה</>}
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => makeAdmin(u.id)}
                              className="px-3 text-xs py-1.5 rounded-lg bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 transition-all flex items-center gap-1"
                            >
                              <Shield className="w-3.5 h-3.5" />אדמין
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center py-8">לא נמצאו משתמשים</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Events ── */}
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
                            ev.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            ev.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
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
                          {KASHRUT_LABELS[ev.kashrut_level as keyof typeof KASHRUT_LABELS] || ev.kashrut_level}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <Link
                          to={`/events/${ev.id}`}
                          className="text-xs px-2.5 py-1 rounded-lg bg-muted text-foreground font-medium text-center"
                        >
                          צפה
                        </Link>
                        {ev.status === 'active' && (
                          <button
                            onClick={() => {
                              if (confirm('לבטל את האירוע?')) cancelEvent(ev.id)
                            }}
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

        {/* ── Shabbat ── */}
        {tab === 'shabbat' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-bold text-xl text-foreground flex-1">🕯️ ארוחות השבת הקרובות</h2>
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
                      <span className="text-2xl">{ev.event_type === 'shabbat_dinner' ? '🕯️' : '☀️'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-foreground text-sm">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(ev.event_date + 'T00:00:00'), 'EEEE d/M', { locale: he })} · {ev.event_time?.slice(0, 5)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          מארח: <span className="font-medium text-foreground">{ev.host_name}</span> · {ev.city}
                          · {KASHRUT_LABELS[ev.kashrut_level as keyof typeof KASHRUT_LABELS] || ev.kashrut_level}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-right flex-shrink-0">
                        <span style={{ color: ev.current_guests >= ev.max_guests ? '#EF4444' : '#10B981' }}>
                          {ev.current_guests}/{ev.max_guests}
                        </span>
                        <div className="text-muted-foreground font-normal">אורחים</div>
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (ev.current_guests / ev.max_guests) * 100)}%`,
                          background: ev.current_guests >= ev.max_guests ? '#EF4444' : 'linear-gradient(90deg, #C8860A, #F5C240)',
                        }}
                      />
                    </div>

                    {/* Guest list */}
                    {ev.guest_names && ev.guest_names.length > 0 && (
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
                    )}
                    {(!ev.guest_names || ev.guest_names.length === 0) && (
                      <p className="text-xs text-muted-foreground">אין אורחים מאושרים עדיין</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Reports ── */}
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
                      borderRight: `3px solid ${rep.status === 'pending' ? '#F59E0B' : rep.status === 'resolved' ? '#10B981' : '#9CA3AF'}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            rep.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{rep.status}</span>
                          <span className="text-xs font-semibold text-destructive">
                            {REPORT_REASON_LABELS[rep.reason]}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          <span className="text-muted-foreground">מדווח:</span>{' '}
                          <strong>{(rep.reported as { display_name: string })?.display_name || '—'}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          דיווח על ידי: {(rep.reporter as { display_name: string })?.display_name || '—'} ·{' '}
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
                      <>
                        {selectedReport === rep.id ? (
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
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
