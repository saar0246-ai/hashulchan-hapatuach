import { Link } from 'react-router-dom'
import { Heart, Shield, Star, Users, ChefHat } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

const VALUES = [
  {
    icon: Heart,
    title: 'חינמי לחלוטין',
    desc: 'שולחן פתוח הוא מיזם קהילתי. אין עמלות, אין דמי שירות, אין תשלום. אנשים מזמינים אנשים — פשוט.',
    color: 'hsl(var(--primary))',
    bg: 'hsl(var(--primary) / 0.08)',
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

const STEPS = [
  { n: '1', title: 'נרשמים', desc: 'פרופיל חינמי עם העדפות כשרות, דת וסגנון. תהליך קצר של 5 שלבים.' },
  { n: '2', title: 'מוצאים שולחן', desc: 'מסנן לפי עיר, תאריך, כשרות וסוג האירוע — ארוחות שבת וחגים.' },
  { n: '3', title: 'מבקשים מקום', desc: 'שולחים בקשה למארח. הוא בוחר מי מגיע — ואז מגיעה הכתובת ישירות למייל.' },
  { n: '4', title: 'מגיעים ונהנים', desc: 'ארוחה ביתית, שיחות, חיבורים חדשים. ואחרי — דירוג קצר שעוזר לכולם.' },
]

export default function About() {
  return (
    <div className="min-h-dvh bg-background pb-24">

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #2B201A 0%, #1C1510 55%, #120D09 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }} />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(180,80,40,0.15) 0%, transparent 70%)',
        }} />

        <div className="max-w-lg mx-auto px-5 pt-14 pb-12 relative z-10">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" onDark />
          </div>
          <h1 className="text-center text-4xl font-black text-white mb-3 leading-tight">
            שולחן פתוח
          </h1>
          <p className="text-center text-white/60 text-base leading-relaxed max-w-xs mx-auto">
            פלטפורמה קהילתית לחיבור בין מארחים לאורחים — לארוחות שבת וחגים
          </p>

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mt-6 mx-auto flex justify-center text-xs font-semibold"
            style={{
              background: 'rgba(180,80,40,0.18)',
              border: '1px solid rgba(180,80,40,0.35)',
              color: '#F0A080',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#F0A080' }} />
            חינמי לחלוטין
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-8 space-y-8">

        {/* ── מה זה ── */}
        <section className="shulchan-card p-6">
          <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            מה זה שולחן פתוח?
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              שולחן פתוח הוא כמו Airbnb — אבל לא לחדרים, לארוחות שישי.
              מארחים פותחים את ביתם לאורחים חדשים, ואורחים מוצאים שולחן חם לחג,
              לשבת, או סתם לשישי בערב.
            </p>
            <p>
              המיזם נולד מתוך הכמיהה לחיבור אנושי אמיתי. כשעוברים לעיר חדשה,
              כשהמשפחה רחוקה, כשצריך שולחן לחג — שולחן פתוח שם.
              ולהפך: כשיש שפע ורוצים לשתף — כאן אפשר.
            </p>
          </div>
        </section>

        {/* ── הערכים ── */}
        <section>
          <h2 className="text-xl font-black text-foreground mb-4">למה להצטרף?</h2>
          <div className="grid grid-cols-1 gap-3">
            {VALUES.map((v, i) => (
              <div key={i} className="shulchan-card p-4 flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: v.bg }}
                >
                  <v.icon className="w-5 h-5" style={{ color: v.color }} />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground mb-1">{v.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── איך זה עובד ── */}
        <section>
          <h2 className="text-xl font-black text-foreground mb-4">איך זה עובד?</h2>
          <div className="shulchan-card divide-y divide-border/50">
            {STEPS.map((s, i) => (
              <div key={i} className="p-4 flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                  style={{
                    background: 'hsl(var(--primary) / 0.1)',
                    border: '1.5px solid hsl(var(--primary) / 0.22)',
                    color: 'hsl(var(--primary))',
                  }}
                >
                  {s.n}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground mb-1">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── כשרות ── */}
        <section className="shulchan-card p-5">
          <h2 className="font-black text-base text-foreground mb-2">כשרות ודת — כל אחד על מקומו</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            המארח מגדיר את רמת הכשרות ואת הסגנון הדתי של האירוח.
            הסינון מאפשר לכל אחד למצוא שולחן שמתאים לו — חילוני, מסורתי, דתי,
            חרדי. כולם מוזמנים, ולכולם יש שולחן.
          </p>
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

        {/* ── Footer links ── */}
        <div className="text-center space-y-2 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition-colors">תנאי שימוש</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">פרטיות</Link>
            <span>·</span>
            <Link to="/accessibility" className="hover:text-primary transition-colors">נגישות</Link>
          </div>
          <p className="text-[11px] text-muted-foreground/50">שולחן פתוח © 2026 — מיזם קהילתי</p>
        </div>
      </div>
    </div>
  )
}
