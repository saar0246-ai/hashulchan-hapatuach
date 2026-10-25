import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, CalendarPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'
import { InView } from '../components/ui/InView'
import { Tilt } from '../components/ui/Tilt'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'

const VOID        = '#0D0D0B'
const SURFACE     = '#191917'
const TEXT        = '#F5F3EE'
const MUTED       = '#8A8278'
const FIRE        = '#E8601C'
const BORDER      = 'rgba(255,255,255,0.07)'
const BORDER_FIRE = 'rgba(232,96,28,0.22)'
const GREEN       = '#22c55e'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const SPRING = { type: 'spring' as const, stiffness: 350, damping: 25 }

const STATS = [
  { value: 840,  label: 'ארוחות שפורסמו', suffix: '+' },
  { value: 3200, label: 'משתמשים פעילים', suffix: '+' },
  { value: 47,   label: 'ערים ויישובים',  suffix: '' },
]

const MOCK_EVENTS = [
  { id: 1, title: 'שישי ביתי ירושלמי',    host: 'משפחת לוי',        city: 'ירושלים', date: '24/10', day: 'שישי', spots: 3, kashrut: 'מהדרין' },
  { id: 2, title: 'שולחן שישי חם ומכיל',  host: 'רחל ויוסף כהן',    city: 'תל אביב', date: '25/10', day: 'שישי', spots: 5, kashrut: 'כשר' },
  { id: 3, title: 'ארוחת שבת מרוקאית',    host: 'דינה אביב',         city: 'חיפה',    date: '26/10', day: 'שבת',  spots: 2, kashrut: 'כשר' },
]

const TABS_PREVIEW = ['הכל', 'שישי', 'שבת', 'חג', 'חול']

const STEPS = [
  { n: '01', title: 'נרשמים',        desc: 'פרופיל חינמי עם העדפות כשרות ודת — תהליך של 5 דקות.' },
  { n: '02', title: 'מוצאים ארוחה', desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע.' },
  { n: '03', title: 'מגיעים ונהנים', desc: 'המארח בוחר ושולח כתובת ישירות אחרי האישור.' },
]

const PERSONAL_ITEMS = [
  { icon: '🍽️', label: 'הזמנות שלי',  desc: 'ארוחות שנרשמתי אליהן' },
  { icon: '🏠', label: 'הארוחות שלי', desc: 'ניהול ארוחות כמארח'    },
  { icon: '🔔', label: 'התראות',       desc: 'עדכונים ואישורים'      },
  { icon: '⭐', label: 'דירוגים',      desc: 'ביקורות אחרי ארוחות'  },
]

export default function Landing() {
  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = VOID
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.background = prev
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  return (
    <div dir="rtl" style={{ minHeight: '100dvh', background: VOID, color: TEXT, overflowX: 'hidden' }}>

      {/* ── Sticky header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: `1px solid ${BORDER}`,
        background: 'rgba(13,13,11,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
        }}>
          <Link to="/about" style={{ textDecoration: 'none' }}>
            <BrandLogo size="sm" onDark />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/auth?mode=login"
              style={{ fontSize: 13, fontWeight: 500, color: MUTED, textDecoration: 'none' }}>
              כניסה
            </Link>
            <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  background: FIRE, color: '#fff',
                  border: 'none', borderRadius: 10,
                  padding: '0.5rem 1.2rem',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05, filter: 'brightness(1.12)' }}
                whileTap={{ scale: 0.96 }} transition={SPRING}>
                הצטרף
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* ══ Hero — full-bleed, no maxWidth on text ══ */}
      <section style={{
        minHeight: 'calc(100dvh - 60px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.25rem, 4vw, 3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot-grid */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Ambient blooms */}
        <div aria-hidden style={{
          position: 'absolute', top: '8%', right: '-6%',
          width: 700, height: 700, borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(circle, rgba(232,96,28,0.06) 0%, transparent 70%)`,
          filter: 'blur(88px)',
        }} />
        <div aria-hidden style={{
          position: 'absolute', bottom: '10%', left: '-8%',
          width: 480, height: 480, borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(circle, rgba(212,160,23,0.045) 0%, transparent 70%)`,
          filter: 'blur(70px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', textAlign: 'center' }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.06 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: FIRE, boxShadow: `0 0 8px ${FIRE}99`,
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: MUTED,
            }}>
              שולחן פתוח · חינמי לחלוטין · ללא עמלות
            </span>
          </motion.div>

          {/* Main headline — full-width, no container cap */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: EASE, delay: 0.12 }}
            style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              fontSize: 'clamp(3.8rem, 14vw, 11rem)',
              color: TEXT,
              lineHeight: 0.88,
              letterSpacing: '-0.04em',
              fontWeight: 900,
              marginBottom: '0.25em',
            }}>
            שולחן חם
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: EASE, delay: 0.22 }}
            style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              fontSize: 'clamp(3.8rem, 14vw, 11rem)',
              color: FIRE,
              lineHeight: 0.88,
              letterSpacing: '-0.04em',
              fontWeight: 900,
              marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            }}>
            לכל שבת וחג
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.32 }}
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              color: MUTED, lineHeight: 1.75,
              maxWidth: 420, marginTop: 0, marginLeft: 'auto', marginRight: 'auto', marginBottom: 'clamp(2rem, 4vw, 3rem)',
            }}>
            מארחים פותחים את ביתם.<br />
            אורחים מוצאים שולחן ביתי אמיתי.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.4 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  background: FIRE, color: '#fff',
                  border: 'none', borderRadius: 14,
                  padding: '0.9rem 2rem',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                whileHover={{ scale: 1.04, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }} transition={SPRING}>
                הצטרף עכשיו
                <ArrowLeft size={16} />
              </motion.button>
            </Link>
            <Link to="/auth?mode=login" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  background: 'transparent', color: TEXT,
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 14, padding: '0.9rem 2rem',
                  fontSize: 15, fontWeight: 500, cursor: 'pointer',
                }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.18)' }}
                whileTap={{ scale: 0.97 }} transition={SPRING}>
                כניסה
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
            style={{ display: 'flex', gap: 'clamp(1.5rem, 5vw, 4rem)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {STATS.map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "'Frank Ruhl Libre', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: 900, color: TEXT,
                  letterSpacing: '-0.03em',
                  display: 'flex', alignItems: 'baseline', gap: 2,
                }}>
                  <AnimatedNumber value={s.value} />
                  <span style={{ color: FIRE }}>{s.suffix}</span>
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4, fontWeight: 500, letterSpacing: '0.06em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ App Preview ══ */}
      <section style={{
        background: SURFACE,
        borderTop: `1px solid ${BORDER_FIRE}`,
        padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 4vw, 3.5rem)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          <InView
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)', textAlign: 'center' }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: MUTED, marginBottom: '0.6rem',
            }}>
              כך זה נראה בפנים
            </p>
            <h2 style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
              color: TEXT, fontWeight: 900,
              letterSpacing: '-0.026em', lineHeight: 1.08,
            }}>
              הכל ממתין לך אחרי ההרשמה
            </h2>
          </InView>

          {/* Two-column grid — collapses on mobile, personal items shown first on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* Left col: search + tabs + event list — order 2 on mobile, 1 on desktop */}
            <InView
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.55, ease: EASE }}
              className="order-2 md:order-1">
              <div style={{
                background: VOID,
                border: `1px solid ${BORDER}`,
                borderRadius: 20, padding: '1.5rem',
              }}>
                {/* Search bar (static mockup) */}
                <div style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', marginBottom: 16,
                }}>
                  <Search style={{ width: 16, height: 16, color: MUTED, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: MUTED }}>חפש ארוחה, עיר, מארח...</span>
                </div>

                {/* Tabs */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap',
                  background: SURFACE, borderRadius: 9999,
                  padding: 3, border: `1px solid ${BORDER}`,
                  marginBottom: 20, gap: 0, width: 'fit-content',
                }}>
                  {TABS_PREVIEW.map((tab, i) => (
                    <div key={tab} style={{
                      padding: '6px 14px', borderRadius: 9999,
                      background: i === 0 ? 'white' : 'transparent',
                      color: i === 0 ? VOID : TEXT,
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {tab}
                    </div>
                  ))}
                </div>

                {/* Section label */}
                <p style={{
                  fontSize: 10, fontWeight: 700, color: MUTED,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  ארוחות קרובות
                </p>

                {/* Mock event cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MOCK_EVENTS.map((ev, i) => (
                    <InView
                      key={ev.id}
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.36, delay: i * 0.08, ease: EASE }}>
                      <div style={{
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 14, padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', gap: 8,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 14, color: TEXT, marginBottom: 2 }}>{ev.title}</p>
                            <p style={{ fontSize: 12, color: MUTED }}>{ev.host}</p>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: `${FIRE}18`, color: FIRE,
                            border: `1px solid ${BORDER_FIRE}`,
                            borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                            {ev.day}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN, display: 'inline-block', flexShrink: 0 }} />
                            {ev.city}
                          </span>
                          <span style={{ fontSize: 11, color: MUTED }}>{ev.date}</span>
                          <span style={{ fontSize: 11, color: MUTED }}>{ev.spots} מקומות</span>
                          <span style={{ fontSize: 11, color: 'rgba(212,160,23,0.8)' }}>{ev.kashrut}</span>
                        </div>
                      </div>
                    </InView>
                  ))}
                </div>
              </div>
            </InView>

            {/* Right col: host CTA + personal menu — order 1 on mobile (shown first!), 2 on desktop */}
            <InView
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
              className="order-1 md:order-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Host CTA card */}
                <div style={{
                  background: `linear-gradient(135deg, ${FIRE} 0%, #6E2E17 100%)`,
                  borderRadius: 20, padding: '1.8rem',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div aria-hidden style={{
                    position: 'absolute', top: -60, right: -50,
                    width: 220, height: 220,
                    background: 'radial-gradient(circle, rgba(255,215,130,0.32), transparent 60%)',
                    filter: 'blur(10px)', pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: 'rgba(255,255,255,0.18)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CalendarPlus style={{ width: 22, height: 22, color: 'white' }} strokeWidth={1.75} />
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.16em', textTransform: 'uppercase',
                      }}>
                        מארח שולחן
                      </span>
                    </div>
                    <h3 style={{
                      fontFamily: "'Frank Ruhl Libre', serif",
                      fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                      color: 'white', letterSpacing: '-0.03em', lineHeight: 0.97,
                      marginBottom: 18,
                    }}>
                      מארחים<br />בשבת?
                    </h3>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: 'rgba(255,255,255,0.14)',
                      border: '1.5px solid rgba(255,255,255,0.32)',
                      borderRadius: 11, padding: '9px 18px',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>פרסם ארוחה חינם</span>
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16 }}>←</span>
                    </div>
                  </div>
                </div>

                {/* Personal sections */}
                <div style={{
                  background: VOID, border: `1px solid ${BORDER}`,
                  borderRadius: 20, padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: MUTED, marginBottom: 4,
                  }}>
                    אזור אישי
                  </p>
                  {PERSONAL_ITEMS.map((item, i) => (
                    <InView
                      key={i}
                      variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}
                      transition={{ duration: 0.32, delay: i * 0.06, ease: EASE }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px',
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 12,
                      }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{item.label}</p>
                          <p style={{ fontSize: 11, color: MUTED }}>{item.desc}</p>
                        </div>
                        <span style={{ marginRight: 'auto', marginLeft: 0, color: MUTED, fontSize: 14, opacity: 0.5 }}>←</span>
                      </div>
                    </InView>
                  ))}
                </div>

              </div>
            </InView>
          </div>
        </div>
      </section>

      {/* ══ How it works ══ */}
      <section style={{
        padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 4vw, 3.5rem)',
        borderTop: `1px solid ${BORDER}`,
        background: VOID,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <InView
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: MUTED, marginBottom: '0.5rem',
            }}>
              איך זה עובד
            </p>
            <h2 style={{
              fontFamily: "'Frank Ruhl Libre', serif",
              fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
              color: TEXT, fontWeight: 900,
              letterSpacing: '-0.026em', lineHeight: 1.08,
            }}>
              שלושה צעדים פשוטים
            </h2>
          </InView>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
          }}>
            {STEPS.map((s, i) => (
              <InView
                key={i}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.48, delay: i * 0.1, ease: EASE }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Frank Ruhl Libre', serif",
                    fontSize: '3.5rem', fontWeight: 900,
                    color: 'rgba(232,96,28,0.15)', lineHeight: 1,
                    letterSpacing: '-0.04em', marginBottom: '0.75rem',
                    userSelect: 'none',
                  }}>
                    {s.n}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: '0.5rem', textAlign: 'center' }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, textAlign: 'center' }}>{s.desc}</p>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{
        padding: '0 clamp(1.25rem, 4vw, 3.5rem) clamp(3.5rem, 7vw, 6rem)',
        maxWidth: 1400, margin: '0 auto',
      }}>
        <InView
          variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, ease: EASE }}>
          <Tilt rotationFactor={4}>
            <div style={{
              background: SURFACE, border: `1px solid ${BORDER_FIRE}`,
              borderRadius: 20, padding: 'clamp(2rem, 5vw, 3.5rem)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem',
              position: 'relative', overflow: 'hidden', textAlign: 'center',
            }}>
              <div aria-hidden style={{
                position: 'absolute', top: -60, right: -60,
                width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none',
                background: `radial-gradient(circle, rgba(232,96,28,0.07) 0%, transparent 70%)`,
                filter: 'blur(50px)',
              }} />
              <div style={{ position: 'relative' }}>
                <h3 style={{
                  fontFamily: "'Frank Ruhl Libre', serif",
                  fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
                  color: TEXT, fontWeight: 900,
                  letterSpacing: '-0.026em', lineHeight: 1.08,
                  marginBottom: '0.75rem',
                }}>
                  מוכן לפגוש שולחן חדש?
                </h3>
                <p style={{ fontSize: 14, color: MUTED }}>הצטרף לקהילה — חינמי לחלוטין</p>
              </div>
              <div style={{ position: 'relative' }}>
                <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
                  <motion.button
                    style={{
                      background: FIRE, color: '#fff',
                      border: 'none', borderRadius: 14,
                      padding: '1rem 2.5rem',
                      fontSize: 16, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                    whileHover={{ scale: 1.04, filter: 'brightness(1.1)' }}
                    whileTap={{ scale: 0.97 }} transition={SPRING}>
                    הצטרף עכשיו — חינם
                    <ArrowLeft size={16} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </Tilt>
        </InView>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '2rem 1.5rem' }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <BrandLogo size="sm" onDark />
          <nav style={{ display: 'flex', gap: 24 }}>
            {[
              { to: '/about',   label: 'אודות'      },
              { to: '/terms',   label: 'תנאי שימוש' },
              { to: '/privacy', label: 'פרטיות'     },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                style={{ fontSize: 12, color: MUTED, textDecoration: 'none', fontWeight: 400 }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p style={{
          textAlign: 'center', fontSize: 10,
          color: 'rgba(138,130,120,0.32)', marginTop: '1.5rem',
        }}>
          שולחן פתוח © 2026 — מיזם קהילתי
        </p>
      </footer>
    </div>
  )
}
