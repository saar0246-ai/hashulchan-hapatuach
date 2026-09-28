import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch once when userId changes
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

  // Realtime subscription — separate effect, no fetchProfile dependency
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        payload => {
          if (payload.eventType === 'DELETE') {
            setProfile(null)
          } else {
            setProfile(payload.new as Profile)
          }
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
