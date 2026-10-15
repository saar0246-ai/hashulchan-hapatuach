import { Link } from 'react-router-dom'
import { Heart, Shield, Star, Users, Instagram, Facebook, Linkedin } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

const A = '#C4782A'      // amber accent
const FG = '#1A1510'     // warm near-black
const MID = '#7A6E62'    // warm mid-gray
const BD = '#E8E0D0'     // linen border
const TINT = '#F5F0E8'   // warm tint background

const VALUES = [
  {
    icon: Heart,
    title: 'חינמי לחלוטין',
    desc: 'שולחן פתוח הוא מיזם קהילתי. אין עמלות, אין דמי שירות, אין תשלום. אנשים מזמינים אנשים — פשוט.',
    color: A,
    bg: `${A}18`,
  },
  {
    icon: Shield,
    title: 'בטוח ומאומת',
    desc: 'כל פרופיל מאומת דרך כתובת מייל. מערכת דירוגים שקופה — מארחים ואורחים מדרגים זה את זה אחרי כל ארוחה.',
    color: '#1a7a4a',
    bg: 'rgba(26,122,74,0.08)',
  },
  {
    icon: Star,
    title: 'קהילה אמיתית',
    desc: 'לא מסעדה ולא בית מלון. שולחן ביתי אמיתי, אנשים אמיתיים, שיחה אמיתית. כזה שקשה למצוא בחוץ.',
    color: '#E87030',
    bg: 'rgba(232,112,48,0.08)',
  },
  {
    icon: Users,
    title: 'מארחים מכל הארץ',
    desc: 'ממשפחות דתיות בירושלים ועד זוגות צעירים בתל אביב — כולם מוזמנים לפתוח את ביתם.',
    color: '#1e5fa5',
    bg: 'rgba(30,95,165,0.08)',
  },
]

type Social = { label: string; url: string; icon: 'instagram' | 'facebook' | 'linkedin' }
type TeamMember = {
  name: string
  role: string
  desc: string | null
  socials: Social[]
  placeholder?: boolean
}

const TEAM: TeamMember[] = [
  {
    name: 'צחי מרום',
    role: 'מייסד שותף',
    desc: 'בונה קהילות ויזם חברתי — מאמין שחיבורים אמיתיים בין אנשים מתחילים ממקום של נתינה. אחד מהאנשים שהפכו את הרעיון לשולחן פתוח.',
    socials: [
      { label: 'Instagram', url: 'https://instagram.com/tzachi_marom', icon: 'instagram' },
      { label: 'Facebook', url: 'https://www.facebook.com/share/19jGiRrFeL/', icon: 'facebook' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/tzachi-marom-%D7%A6%D7%97%D7%99-%D7%9E%D7%A8%D7%95%D7%9D-6b0665240', icon: 'linkedin' },
    ],
  },
  {
    name: 'תאיר דייני',
    role: 'מייסדת שותפת',
    desc: '"לך איפה שאין דרך ותשאיר עקבות." מגיעה מבאר שבע עם חשיבה של חדשנות חברתית — מאמינה ששינוי תרבותי אמיתי יכול להתחיל מארוחת שישי.',
    socials: [
      { label: 'Instagram', url: 'https://instagram.com/tair_dayani', icon: 'instagram' },
      { label: 'Facebook', url: 'https://www.facebook.com/share/18rEERomnV/', icon: 'facebook' },
    ],
  },
  {
    name: 'טל',
    role: 'מייסדת שותפת',
    desc: null,
    socials: [],
    placeholder: true,
  },
]

const STEPS = [
  { n: '1', title: 'נרשמים', desc: 'פרופיל חינמי עם העדפות כשרות, דת וסגנון. תהליך קצר של 5 שלבים.' },
  { n: '2', title: 'מוצאים שולחן', desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע — ארוחות שבת וחגים.' },
  { n: '3', title: 'מבקשים מקום', desc: 'שולחים בקשה למארח. הוא בוחר מי מגיע — ואז מגיעה הכתובת ישירות למייל.' },
  { n: '4', title: 'מגיעים ונהנים', desc: 'ארוחה ביתית, שיחות, חיבורים חדשים. ואחרי — דירוג קצר שעוזר לכולם.' },
]

function SocialIcon({ icon }: { icon: Social['icon'] }) {
  if (icon === 'instagram') return <Instagram className="w-3.5 h-3.5" />
  if (icon === 'facebook') return <Facebook className="w-3.5 h-3.5" />
  return <Linkedin className="w-3.5 h-3.5" />
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p
      className="text-[10px] font-bold uppercase mb-4"
      style={{ color: A, letterSpacing: '0.14em' }}
    >
      {children}
    </p>
  )
}

export default function About() {
  return (
    <div className="min-h-dvh pb-28" style={{ background: '#FDFBF7' }}>

      {/* ── Hero — editorial stamp ── */}
      <div className="max-w-lg mx-auto px-5 pt-14 pb-12">

        <div className="flex justify-end mb-10">
          <BrandLogo size="sm" />
        </div>

        {/* Display headline — the signature element */}
        <h1
          className="leading-none mb-5 text-right"
          style={{
            fontFamily: "'Frank Ruhl Libre', serif",
            fontSize: 'clamp(64px, 17vw, 84px)',
            fontWeight: 900,
            color: FG,
            letterSpacing: '-0.025em',
          }}
        >
          שולחן
          <br />
          פתוח.
        </h1>

        {/* Short amber rule */}
        <div
          className="mb-5"
          style={{ width: 44, height: 2, background: A }}
        />

        <p
          className="text-sm leading-relaxed text-right"
          style={{ color: MID, maxWidth: 240, marginLeft: 'auto' }}
        >
          פלטפורמה קהילתית לחיבור בין מארחים לאורחים — לארוחות שבת וחגים
        </p>

        <div className="flex justify-end mt-5">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: `${A}15`,
              border: `1px solid ${A}38`,
              color: A,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: A }} />
            חינמי לחלוטין
          </span>
        </div>
      </div>

      {/* page-width rule */}
      <div style={{ borderTop: `1px solid ${BD}` }} />

      <div className="max-w-lg mx-auto px-5 mt-12 space-y-14">

        {/* ── על המיזם ── */}
        <section>
          <Eyebrow>על המיזם</Eyebrow>
          <h2
            className="text-xl font-black mb-4 leading-snug text-right"
            style={{ fontFamily: "'Frank Ruhl Libre', serif", color: FG }}
          >
            כמו Airbnb —
            <br />
            אבל לשולחן הישראלי
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-right" style={{ color: MID }}>
            <p>
              מארחים פותחים את ביתם לאורחים חדשים, ואורחים מוצאים שולחן חם לחג,
              לשבת, או סתם לשישי בערב.
            </p>
            <p>
              המיזם נולד מתוך הכמיהה לחיבור אנושי אמיתי. כשעוברים לעיר חדשה,
              כשהמשפחה רחוקה, כשצריך שולחן לחג — שולחן פתוח שם. ולהפך: כשיש
              שפע ורוצים לשתף — כאן אפשר.
            </p>
          </div>
        </section>

        {/* ── למה להצטרף ── */}
        <section>
          <Eyebrow>למה להצטרף</Eyebrow>
          <div style={{ borderTop: `1px solid ${BD}` }}>
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="py-5 flex items-start gap-4"
                style={{ borderBottom: `1px solid ${BD}` }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: v.bg }}
                >
                  <v.icon className="w-4 h-4" style={{ color: v.color }} />
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm mb-1" style={{ color: FG }}>{v.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: MID }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── תהליך ── */}
        <section>
          <Eyebrow>תהליך</Eyebrow>
          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="text-[11px] font-black flex-shrink-0 mt-0.5"
                  style={{ color: A, width: 18, textAlign: 'right' }}
                >
                  {s.n}
                </span>
                <div className="text-right">
                  <p className="font-bold text-sm mb-1" style={{ color: FG }}>{s.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: MID }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── כשרות ── */}
        <section
          className="px-5 py-5 rounded-xl"
          style={{ background: TINT, border: `1px solid ${BD}` }}
        >
          <Eyebrow>כשרות ודת</Eyebrow>
          <h3
            className="font-black text-base mb-2 text-right"
            style={{ fontFamily: "'Frank Ruhl Libre', serif", color: FG }}
          >
            כל אחד על מקומו
          </h3>
          <p className="text-sm leading-relaxed text-right" style={{ color: MID }}>
            המארח מגדיר את רמת הכשרות ואת הסגנון הדתי של האירוח.
            הסינון מאפשר לכל אחד למצוא שולחן שמתאים לו — חילוני, מסורתי, דתי, חרדי.
            כולם מוזמנים, ולכולם יש שולחן.
          </p>
        </section>

        {/* ── הצוות ── */}
        <section>
          <Eyebrow>הצוות</Eyebrow>
          <h2
            className="text-lg font-black mb-6 leading-snug text-right"
            style={{ fontFamily: "'Frank Ruhl Libre', serif", color: FG }}
          >
            האנשים שמאחורי השולחן
          </h2>
          <div style={{ borderTop: `1px solid ${BD}` }}>
            {TEAM.map((member, i) => (
              <div
                key={i}
                className="py-5 flex items-start gap-4"
                style={{
                  borderBottom: `1px solid ${BD}`,
                  opacity: member.placeholder ? 0.4 : 1,
                }}
              >
                {/* Initial avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black"
                  style={{
                    background: member.placeholder ? '#EDE8E0' : `${A}18`,
                    color: member.placeholder ? '#C0B9AF' : A,
                    fontFamily: "'Frank Ruhl Libre', serif",
                  }}
                >
                  {member.placeholder ? '?' : member.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-baseline justify-end gap-2 mb-1">
                    <span className="text-[10px]" style={{ color: MID }}>{member.role}</span>
                    <span className="font-black text-sm" style={{ color: FG }}>{member.name}</span>
                  </div>

                  {member.placeholder ? (
                    <p className="text-xs italic" style={{ color: '#C0B9AF' }}>פרטים בקרוב</p>
                  ) : (
                    <>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: MID }}>
                        {member.desc}
                      </p>
                      {member.socials.length > 0 && (
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {member.socials.map((s) => (
                            <a
                              key={s.label}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={s.label}
                              className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-60 active:scale-95"
                              style={{
                                background: TINT,
                                color: MID,
                                border: `1px solid ${BD}`,
                              }}
                            >
                              <SocialIcon icon={s.icon} />
                              <span>{s.label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="space-y-3 pt-2">
          <Link to="/auth?mode=register" className="block">
            <button className="w-full py-4 rounded-lg font-semibold text-base transition-all active:scale-[0.97] btn-gold">
              הצטרף עכשיו — חינמי
            </button>
          </Link>
          <Link to="/auth?mode=login" className="block">
            <button className="btn-outline w-full py-3.5 text-sm font-semibold">
              כבר יש לי חשבון
            </button>
          </Link>
        </div>

        {/* ── Footer ── */}
        <div
          className="text-center space-y-2 pt-4"
          style={{ borderTop: `1px solid ${BD}` }}
        >
          <div
            className="flex items-center justify-center gap-4 text-xs"
            style={{ color: MID }}
          >
            <Link to="/terms" className="hover:opacity-70 transition-opacity" style={{ color: MID }}>
              תנאי שימוש
            </Link>
            <span style={{ opacity: 0.35 }}>·</span>
            <Link to="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: MID }}>
              פרטיות
            </Link>
            <span style={{ opacity: 0.35 }}>·</span>
            <Link to="/accessibility" className="hover:opacity-70 transition-opacity" style={{ color: MID }}>
              נגישות
            </Link>
          </div>
          <p className="text-[11px]" style={{ color: `${MID}70` }}>
            שולחן פתוח © 2026 — מיזם קהילתי
          </p>
        </div>

      </div>
    </div>
  )
}
