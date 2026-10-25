import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface AppStats {
  events:  number
  members: number
  cities:  number
}

export function useStats() {
  const [stats, setStats] = useState<AppStats>({ events: 0, members: 0, cities: 0 })

  useEffect(() => {
    const load = async () => {
      const [evRes, profRes] = await Promise.all([
        supabase.from('events').select('city', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])
      const citiesCount = new Set((evRes.data ?? []).map(e => e.city)).size
      setStats({
        events:  evRes.count  ?? 0,
        members: profRes.count ?? 0,
        cities:  citiesCount,
      })
    }
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [])

  return stats
}
