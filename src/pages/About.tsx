import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Shield, Star, Users, Instagram, Facebook, Linkedin, Music2 } from 'lucide-react'
import { motion } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'

/* ─── Design tokens — forced warm light mode ─── */
const C = {
  bg:    '#FDFBF7',
  fg:    '#1A1510',
  mid:   '#7A6E62',
  a:     '#C4782A',   // amber / terracotta
  bd:    '#E8E0D0',   // linen border
  tint:  '#F5F0E8',   // warm tint
}

/* ─── Data ─── */
const VALUES = [
  {
    icon: Heart, color: C.a, bg: 'rgba(196,120,42,0.1)',
    title: 'חינמי לחלוטין',
    desc:  'שולחן פתוח הוא מיזם קהילתי. אין עמלות, אין דמי שירות — אנשים מזמינים אנשים.',
  },
  {
    icon: Shield, color: '#1a7a4a', bg: 'rgba(26,122,74,0.09)',
    title: 'בטוח ומאומת',
    desc:  'כל פרופיל מאומת דרך כתובת מייל. מערכת דירוגים שקופה לאחר כל ארוחה.',
  },
  {
    icon: Star, color: '#E87030', bg: 'rgba(232,112,48,0.09)',
    title: 'קהילה אמיתית',
    desc:  'שולחן ביתי אמיתי, אנשים אמיתיים, שיחה אמיתית. כזה שקשה למצוא בחוץ.',
  },
  {
    icon: Users, color: '#1e5fa5', bg: 'rgba(30,95,165,0.09)',
    title: 'מארחים מכל הארץ',
    desc:  'ממשפחות דתיות בירושלים ועד זוגות צעירים בתל אביב — כולם מוזמנים.',
  },
]

const STEPS = [
  { n: '01', title: 'נרשמים',        desc: 'פרופיל חינמי עם העדפות כשרות, דת וסגנון. תהליך קצר של 5 שלבים.' },
  { n: '02', title: 'מוצאים שולחן',   desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
  { n: '03', title: 'מבקשים מקום',    desc: 'שולחים בקשה למארח. לאחר אישור — הכתובת מגיעה ישירות למייל.' },
  { n: '04', title: 'מגיעים ונהנים', desc: 'ארוחה ביתית, שיחות, חיבורים חדשים. ואחרי — דירוג קצר שעוזר לכולם.' },
]

type Social = { label: string; url: string; icon: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' }
type Member = {
  name: string; role: string; desc: string | null
  img: string | null; socials: Social[]; placeholder?: boolean
}

const TEAM: Member[] = [
  {
    name: 'צחי מרום', role: 'מייסד שותף',
    desc: 'בונה קהילות ויזם חברתי — מאמין שחיבורים אמיתיים בין אנשים מתחילים ממקום של נתינה.',
    img: '/images/team/tzachi.jpg',
    socials: [
      { label: 'Instagram', url: 'https://instagram.com/tzachi_marom',                                                             icon: 'instagram' },
      { label: 'Facebook',  url: 'https://www.facebook.com/share/19jGiRrFeL/',                                                     icon: 'facebook'  },
      { label: 'LinkedIn',  url: 'https://www.linkedin.com/in/tzachi-marom-%D7%A6%D7%97%D7%99-%D7%9E%D7%A8%D7%95%D7%9D-6b0665240', icon: 'linkedin'  },
    ],
  },
  {
    name: 'תאיר דייני', role: 'מייסדת שותפת',
    desc: '"לך איפה שאין דרך ותשאיר עקבות." מגיעה מבאר שבע, מאמינה ששינוי תרבותי מתחיל מארוחת שישי.',
    img: '/images/team/tair.jpg',
    socials: [
      { label: 'Instagram', url: 'https://instagram.com/tair_dayani',              icon: 'instagram' },
      { label: 'Facebook',  url: 'https://www.facebook.com/share/18rEERomnV/', icon: 'facebook'  },
    ],
  },
  {
    name: 'טל אינדה-פורקר', role: 'מייסדת שותפת',
    desc: 'יוצרת תוכן, יזמית חברתית ומרצה — מאמינה שסיפור אישי יכול לרפא, לחבר ולעורר השראה לפעולה.',
    img: '/images/team/tal.jpg',
    socials: [
      { label: 'TikTok',    url: 'https://www.tiktok.com/@talindepurker',     icon: 'tiktok'    },
      { label: 'Instagram', url: 'https://www.instagram.com/talindepurker',   icon: 'instagram' },
    ],
  },
]

/* ─── Sub-components ─── */
function Eyebrow({ label }: { label: string }) {
  return (
    <p style={{ color: C.a, letterSpacing: '0.15em', fontSize: 10 }}
       className="font-bold uppercase mb-3 md:mb-4">
      {label}
    </p>
  )
}

function SocialPill({ s }: { s: Social }) {
  const Icon = s.icon === 'instagram' ? Instagram : s.icon === 'facebook' ? Facebook : s.icon === 'tiktok' ? Music2 : Linkedin
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
       className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full
                  transition-all duration-150 hover:opacity-70 active:scale-95"
       style={{ background: '#fff', color: C.mid, border: `1px solid ${C.bd}` }}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{s.label}</span>
    </a>
  )
}

function MemberCard({ m }: { m: Member }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <motion.div
      className="flex flex-col gap-3 p-5 rounded-2xl h-full"
      style={{
        border:     `1px solid ${C.bd}`,
        background: C.tint,
        opacity:    m.placeholder ? 0.45 : 1,
        boxShadow:  `0 2px 12px rgba(26,21,16,0.04)`,
      }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(26,21,16,0.09)' }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {m.img && !imgErr ? (
          <img src={m.img} alt={m.name} onError={() => setImgErr(true)}
               className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
               style={{ border: `1.5px solid ${C.bd}` }} />
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                          text-lg font-black"
               style={{
                 background: m.placeholder ? '#EDE8E0' : `rgba(196,120,42,0.14)`,
                 color:      m.placeholder ? '#C0B9AF' : C.a,
                 fontFamily: "'Frank Ruhl Libre', serif",
               }}>
            {m.placeholder ? '?' : m.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-black text-sm leading-tight" style={{ color: C.fg }}>{m.name}</p>
          <p className="text-[11px] mt-0.5"               style={{ color: C.mid }}>{m.role}</p>
        </div>
      </div>

      {/* Bio */}
      {m.placeholder
        ? <p className="text-xs italic" style={{ color: '#C0B9AF' }}>פרטים בקרוב</p>
        : <p className="text-xs leading-relaxed flex-1" style={{ color: C.mid }}>{m.desc}</p>
      }

      {/* Socials */}
      {m.socials.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {m.socials.map(s => <SocialPill key={s.label} s={s} />)}
        </div>
      )}
    </motion.div>
  )
}

/* ─── Page ─── */
export default function About() {
  return (
    <div className="relative min-h-dvh pb-28 overflow-hidden" style={{ background: C.bg }}>

      {/* ── Ambient floating blobs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="ambient-blob absolute rounded-full"
             style={{
               width: 640, height: 640, top: -240, right: -180,
               background: 'radial-gradient(circle, rgba(196,120,42,0.13) 0%, transparent 68%)',
               animation: 'blob-drift-1 16s ease-in-out infinite',
             }} />
        <div className="ambient-blob absolute rounded-full"
             style={{
               width: 500, height: 500, bottom: 120, left: -200,
               background: 'radial-gradient(circle, rgba(232,148,72,0.10) 0%, transparent 70%)',
               animation: 'blob-drift-2 22s ease-in-out infinite',
             }} />
        <div className="ambient-blob absolute rounded-full"
             style={{
               width: 360, height: 360, top: '45%', left: '30%',
               background: 'radial-gradient(circle, rgba(245,208,168,0.09) 0%, transparent 70%)',
               animation: 'blob-drift-3 28s ease-in-out infinite',
             }} />
      </div>

      {/* ── Hero ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10 lg:px-14
                      pt-14 pb-12 md:pt-20 md:pb-16 lg:pt-28 lg:pb-20">

        {/* Logo — centered */}
        <div className="flex justify-center mb-10 md:mb-14">
          <BrandLogo size="sm" />
        </div>

        {/* Display headline — signature element */}
        <h1 className="leading-none mb-5 md:mb-6 text-center stagger-1"
            style={{
              fontFamily:   "'Frank Ruhl Libre', serif",
              fontSize:     'clamp(58px, 9vw, 104px)',
              fontWeight:   900,
              color:        C.fg,
              letterSpacing: '-0.025em',
            }}>
          שולחן
          <br />
          פתוח.
        </h1>

        {/* Amber rule — the editorial stamp */}
        <div className="mb-5 md:mb-6 stagger-2 mx-auto"
             style={{ width: 48, height: 2, background: C.a }} />

        {/* Subtitle + badge */}
        <div className="flex flex-col items-center gap-4 stagger-3">
          <p className="text-sm md:text-base leading-relaxed text-center"
             style={{ color: C.mid, maxWidth: 320 }}>
            פלטפורמה קהילתית לחיבור בין מארחים לאורחים —<br className="hidden md:block" />
            לארוחות שבת וחגים ברחבי הארץ
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold
                           px-3 py-1.5 rounded-full self-center flex-shrink-0"
                style={{
                  background: `rgba(196,120,42,0.12)`,
                  border:     `1px solid rgba(196,120,42,0.3)`,
                  color:       C.a,
                }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.a }} />
            חינמי לחלוטין
          </span>
        </div>
      </div>

      {/* Page-width rule */}
      <div className="relative z-10" style={{ borderTop: `1px solid ${C.bd}` }} />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10 lg:px-14 mt-12 md:mt-16 space-y-14 md:space-y-20">

        {/* על המיזם */}
        <section className="stagger-2">
          <Eyebrow label="על המיזם" />
          <h2 className="text-xl md:text-3xl font-black mb-4 leading-snug text-center"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: C.fg }}>
            כמו Airbnb —<br />אבל לשולחן הישראלי
          </h2>
          <div className="space-y-3 text-sm md:text-base leading-relaxed text-center max-w-2xl mx-auto"
               style={{ color: C.mid }}>
            <p>
              מארחים פותחים את ביתם לאורחים חדשים, ואורחים מוצאים שולחן חם לחג,
              לשבת, או סתם לשישי בערב.
            </p>
            <p>
              המיזם נולד מתוך הכמיהה לחיבור אנושי אמיתי. כשעוברים לעיר חדשה, כשהמשפחה רחוקה,
              כשצריך שולחן לחג — שולחן פתוח שם. ולהפך: כשיש שפע ורוצים לשתף — כאן אפשר.
            </p>
          </div>
        </section>

        {/* למה להצטרף */}
        <section>
          <Eyebrow label="למה להצטרף" />
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
            style={{ borderTop: `1px solid ${C.bd}` }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                className="py-5 flex items-start gap-4 rounded-lg px-1 md:border-b-0"
                style={{ borderBottom: `1px solid ${C.bd}` }}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                     style={{ background: v.bg }}>
                  <v.icon className="w-4 h-4" style={{ color: v.color }} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm mb-1" style={{ color: C.fg }}>{v.title}</p>
                  <p className="text-xs leading-relaxed"  style={{ color: C.mid }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* תהליך */}
        <section>
          <Eyebrow label="תהליך" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-black flex-shrink-0 mt-0.5 tabular-nums"
                      style={{ color: C.a, width: 28, textAlign: 'right', letterSpacing: '0.04em' }}>
                  {s.n}
                </span>
                <div className="text-center">
                  <p className="font-bold text-sm mb-1" style={{ color: C.fg }}>{s.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.mid }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* כשרות — callout */}
        <section className="px-5 py-6 md:px-8 rounded-2xl"
                 style={{ background: C.tint, border: `1px solid ${C.bd}` }}>
          <Eyebrow label="כשרות ודת" />
          <h3 className="font-black text-base md:text-xl mb-2 text-center"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: C.fg }}>
            כל אחד על מקומו
          </h3>
          <p className="text-sm leading-relaxed text-center max-w-xl mx-auto"
             style={{ color: C.mid }}>
            המארח מגדיר את רמת הכשרות ואת הסגנון הדתי של האירוח.
            הסינון מאפשר לכל אחד למצוא שולחן שמתאים לו — חילוני, מסורתי, דתי, חרדי.
            כולם מוזמנים, ולכולם יש שולחן.
          </p>
        </section>

        {/* הצוות */}
        <section>
          <Eyebrow label="הצוות" />
          <h2 className="text-lg md:text-2xl font-black mb-6 text-center"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: C.fg }}>
            האנשים שמאחורי השולחן
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            {TEAM.map((m, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
              >
                <MemberCard m={m} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <div className="space-y-3 pt-2 max-w-md mx-auto">
          <Link to="/auth?mode=register" className="block">
            <button className="w-full py-4 rounded-xl font-semibold text-base
                               transition-all duration-150 active:scale-[0.97]
                               hover:shadow-lg btn-gold">
              הצטרף עכשיו — חינמי
            </button>
          </Link>
          <Link to="/auth?mode=login" className="block">
            <button className="btn-outline w-full py-3.5 text-sm font-semibold rounded-xl">
              כבר יש לי חשבון
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4"
             style={{ borderTop: `1px solid ${C.bd}` }}>
          <div className="flex items-center justify-center gap-5 text-xs flex-wrap"
               style={{ color: C.mid }}>
            {[
              { to: '/terms',         label: 'תנאי שימוש' },
              { to: '/privacy',       label: 'פרטיות'     },
              { to: '/accessibility', label: 'נגישות'     },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: C.mid }}>
                {label}
              </Link>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: `${C.mid}65` }}>
            שולחן פתוח © 2026 — מיזם קהילתי
          </p>
        </div>

      </div>
    </div>
  )
}
