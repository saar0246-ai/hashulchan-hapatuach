import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, PlusCircle, Users, MapPin, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [search, setSearch]       = useState('')
  const [eventCount, setEventCount] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('event_date', new Date(Date.now() - 86400000).toISOString().split('T')[0])
      .then(({ count }) => setEventCount(count ?? 0))
  }, [])

  function handleSearch() {
    if (search.trim()) navigate(`/?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div
      dir="rtl"
      className="relative min-h-screen bg-[#FDFBF7] text-[#1C1A17] font-sans overflow-hidden pb-24"
    >
      {/* Dynamic Animated Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#C0390A]/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 -left-20 w-[600px] h-[600px] bg-[#2D4A1E]/10 rounded-full blur-[140px]"
        />
      </div>

      {/* Hero Header Section */}
      <header className="pt-12 pb-8 px-6 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E8E2D8] shadow-sm mb-6">
          <Sparkles className="w-4 h-4 text-[#C0390A]" />
          <span className="text-xs font-semibold text-[#8F4222]">אירוח שבת וחג בקהילה</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1C1A17] mb-4">
          מוצאים שולחן חם <span className="text-[#C0390A]">לשבת ולחג</span>
        </h1>
        <p className="text-lg text-[#5A524C] max-w-xl mx-auto font-normal mb-8">
          פלטפורמה מחברת בין מארחים לאורחים לארוחות שבת, חגים ומפגשים קהילתיים ברחבי הארץ.
        </p>

        {/* Floating Glass Search Dock */}
        <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/90 p-2.5 rounded-2xl shadow-[0_20px_50px_rgba(192,57,10,0.06)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8F4222] mr-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="חפש לפי עיר, סוג, או שם מארח..."
            className="w-full bg-transparent border-none text-[#1C1A17] placeholder-[#9E958C] focus:outline-none text-base"
          />
          <button
            onClick={handleSearch}
            className="bg-[#C0390A] hover:bg-[#A33008] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shrink-0"
          >
            חפש ארוחה
          </button>
        </div>
      </header>

      {/* Asymmetric Bento Layout Container */}
      <main className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">

        {/* Dominant Feature Card (Bento Span 7) */}
        <Link to="/create-event" className="md:col-span-7">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-[#C0390A] via-[#B03308] to-[#802203] rounded-3xl p-8 text-white shadow-[0_25px_50px_rgba(192,57,10,0.2)] flex flex-col justify-between relative overflow-hidden group min-h-[320px]"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-xs font-semibold">פתח את הבית שלך</span>
              <PlusCircle className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform" />
            </div>

            <div className="relative z-10 mt-12">
              <h2 className="text-3xl font-extrabold mb-2">רוצה לארח בסוף השבוע?</h2>
              <p className="text-white/80 text-sm max-w-md mb-6">
                פרסם ארוחה בכמה צעדים פשוטים, קבע כמה אורחים תוכל לקבל וצור חוויות חדשות.
              </p>
              <div className="bg-white text-[#C0390A] font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-[#FDFBF7] transition-all inline-block">
                פרסם ארוחה חדשה
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Live Activity & Regional Shortcuts (Bento Span 5) */}
        <div className="md:col-span-5 grid grid-cols-1 gap-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[#2D4A1E]">פעילות בזמן אמת</span>
              </div>
              <p className="text-2xl font-black text-[#1C1A17]">
                {eventCount === null ? '...' : `${eventCount} ארוחות פתוחות`}
              </p>
              <p className="text-xs text-[#7A726A] mt-1">ארוחות שבת, חג ומפגשים פתוחים לאורחים</p>
            </div>
            <Users className="w-10 h-10 text-[#2D4A1E]/40" />
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1C1A17] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C0390A]" /> אזורי אירוח מבוקשים
            </h3>
            <div className="flex flex-wrap gap-2">
              {['ירושלים והסביבה', 'תל אביב והמרכז', 'הנגב ודימונה', 'הגליל והצפון'].map((region, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-white/80 border border-[#E8E2D8] text-xs font-medium text-[#5A524C] hover:border-[#C0390A] cursor-pointer transition-colors"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
