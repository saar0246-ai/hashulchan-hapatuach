import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Notification } from '../types'

// ─── Context ─────────────────────────────────────────────────────────────────

interface NotificationsCtx {
  notifications: Notification[]
  unreadCount: number
  error: string | null
  markAllRead: () => Promise<void>
  markRead: (id: string) => Promise<void>
}

const NotificationsContext = createContext<NotificationsCtx>({
  notifications: [],
  unreadCount: 0,
  error: null,
  markAllRead: async () => {},
  markRead: async () => {},
})

// ─── Provider (mount once in App, wraps all routes) ──────────────────────────

export function NotificationsProvider({ userId, children }: { userId: string | null | undefined; children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setError(null)
      return
    }

    let cancelled = false

    const fetchNotifications = async () => {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (cancelled) return
      if (fetchError) { setError(fetchError.message); return }
      setError(null)
      setNotifications(data ?? [])
      setUnreadCount((data ?? []).filter(n => !n.read).length)
    }

    fetchNotifications()

    // Single realtime channel for this user — created fresh each time userId changes
    const channelName = `notif_${userId}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        if (cancelled) return
        setNotifications(prev => [payload.new as Notification, ...prev])
        setUnreadCount(c => c + 1)
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [userId])

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
  }, [])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, error, markAllRead, markRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

// ─── Hook (used by BottomNav, Notifications page, etc.) ──────────────────────

export function useNotifications() {
  return useContext(NotificationsContext)
}
