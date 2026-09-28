import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data ?? null)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchProfile()

    if (!userId) return

    const channel = supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      }, payload => {
        if (payload.eventType === 'DELETE') {
          setProfile(null)
        } else {
          setProfile(payload.new as Profile)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchProfile])

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
