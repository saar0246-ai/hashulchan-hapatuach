import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  // Unique per-instance channel name so multiple useProfile calls never clash
  const instanceId = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data ?? null)
        setLoading(false)
      })
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const channelName = `profile:${userId}:${instanceId.current}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        payload => {
          if (payload.eventType === 'DELETE') setProfile(null)
          else setProfile(payload.new as Profile)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const refetch = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data ?? null)
  }, [userId])

  return { profile, loading, refetch }
}
