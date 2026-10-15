import { useEffect } from 'react'

// Light mode only — dark mode disabled site-wide
export function useTheme() {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('shulchan-theme')
  }, [])

  return { theme: 'light' as const, toggle: () => {} }
}
