# 🕯️ השולחן הפתוח — HaShulchan HaPatuach

פלטפורמה לחיבור בין מארחים לאורחים לארוחות שישי, חגים ושבתות. דומה במושג ל-Airbnb — אבל לשולחן הישראלי.

---

## 📦 גירסאות

### טיוטא 4 — commit `master` (אוקטובר 2026) — נוכחי

**מנוע גרפי מלא (WebGL + 3D + Spotlight):**
- `FluidCanvas.tsx` — canvas WebGL (GLSL fragment shader): 4 blobs בפלטה (#C0390A/#2D4A1E/#F59E0B) + mouse force vectors + vignette
- `SpotlightCard` — 3D perspective tilt (`useSpring stiffness:300 damping:28`) + spotlight DOM-direct (`radial-gradient 600px circle at cursor`) + `BorderBeam` (top/bottom sweeping highlights)
- הרקע מכוסה על-ידי canvas (div ראשי שקוף) — זכוכית מטשטשת את ה-canvas
- `ShimmerSweep` — sweep אחד מעל הכותרת בטעינה
- Feature card: `gradient(148deg, #C0390A → #A9603D → #6E2E17)` + נצנוץ פנימי + grain overlay
- Region explorer: פסים אופקיים (bands) עם SpotlightCard
- `layoutId="activeTabPill"` — Emil Kowalski sliding pill על tabs

---

### טיוטא 3 — commit `87883e7` (אוקטובר 2026)

**שינויים ביחס לטיוטא 2:**
- `FluidCanvas.tsx` (חדש): WebGL GLSL shader — 4 blobs צפים, mouse tracking
- `TiltCard`: `useMotionValue` + `useSpring` + `useMotionTemplate` specular glare
- `ShimmerSweep`: sweep חד-פעמי על כותרת הגיבור
- Feature card בגובה מלא 300px (במקום col-span-3 ב-164px)
- Region explorer: פסים אופקיים עם שמות ערים
- `layoutId="activeFilterPill"` Emil Kowalski tabs

---

### טיוטא 2 — branch `draft-2` (אוקטובר 2026)

עמוד הבית נבנה מחדש לגמרי עם שפה עיצובית אחרת לחלוטין:

**טוקני עיצוב:**
- רקע: `#FFF3E0` (קרם רווי — לא חיוור)
- מבטא ראשי: `#C0390A` (טרקוטה כהה)
- מבטא משני: `#2D4A1E` (ירוק יער — חדש לחלוטין)
- טקסט: `#1C1A17` · muted: `#8A6650`

**זכוכית חמה — פונקציית `S(opacity)`:**
- `rgba(255,248,240, opacity)` + גבול ענברי `rgba(255,210,170,0.48)`
- מחליפה את GLASS הקר הלבן של טיוטא 1

**רכיבים חדשים:**
- 3 כדורי אווירה מתנשמים (Framer Motion) — טרקוטה + ירוק יער + ענבר
- טאבי קטגוריה מונפשים עם `layoutId="draft2ActiveTab"` (pill מחליק)
- כרטיסי אזור עם צבע ייחודי לכל אזור: `#C0390A` ירושלים · `#2D4A1E` גוש דן · `#1E5A8A` צפון · `#8F5A0A` נגב
- רציף חיפוש צף עם גבול ענברי חם
- Bento grid: כרטיס יצירה (גרדיאנט כהה), כרטיס סטטיסטיקות (זכוכית), קיצור גאוגרפי
- סינון אירועים inline — ללא תלות ב-FilterBar

---

### טיוטא 1 — commit `118b3ed` (אוקטובר 2026)

ה-UI הראשון הבשל. כל הדפים מאוחדים לעיצוב בהיר (light-only).

**עמוד הבית:**
- Hero עם ברכה אישית + badge "ארוחות זמינות"
- Bento Grid 5-עמודות: כרטיס ארוחות (3-col, עם count) + כרטיס "פרסם ארוחה" (2-col, טרקוטה)
- CityCard — גלילה אופקית עם 7 ערים, live-dot, layoutId accent strip
- FilterBar קולפסיבל מאחורי כפתור "סינון" עם badge מונה סינונים פעילים
- SkeletonCard (3 כרטיסים) במקום spinner בזמן טעינה
- Empty state עם 3 אייקונים מרחפים (Moon/Sun/Star)

**עיצוב (Tokens):**
- רקע: `#FDFBF7` · מבטא: `#C0522A` · גבולות: `#E8E2D8` · טקסט: `#1C1A17` · muted: `#786C63`
- Framer Motion ambient orbs (2 כדורים קבועים ברקע, animate loops)
- Spring: `stiffness: 400, damping: 28`

---

## 📋 תיעוד מצב הפרויקט (עדכן בכל פתיחת חלון חדש!)

### 🗓️ נוצר: 28 ספטמבר 2026
### 🔄 עדכון אחרון: 31 אוקטובר 2026 (session 2)

---

## ✅ מה נעשה עד כה

### עדכונים (31 אוקטובר 2026 — session 2)
- [x] **תיקון קראש התראות במובייל** — שני תיקונים:
  1. `whileHover={{ boxShadow }}` בכרטיסי ההתראה: Framer Motion ניסה לאינטרפולט בין 3 צלליות (מצב ראשוני) ל-2 צלליות (hover) → קראש על mobile. תוקן: הסרת `boxShadow` מ-`whileHover`, נשמר רק `y: -2`.
  2. `showBack` לא הועבר ל-`TopBar` → לא הייתה כפתור חזרה. תוקן: `<TopBar showBack ...>`.
- [x] **Error Boundary** סביב עמוד ההתראות — `NotificationsErrorBoundary` תופס כל שגיאת render ומציג מסך "נסה שוב" במקום מסך לבן ריק.
- [x] **באנר וואטסאפ בדף הבית** — הוסר wrapper `InView` (IntersectionObserver לא תמיד מופעל במובייל בטעינה ראשונה → אלמנט נשאר ב-`opacity:0`). הוחלף ב-`motion.a` עם `initial/animate` ישיר שמופעל מיד עם mount הדף.

### עדכונים אחרונים (31 אוקטובר 2026 — לילה)
- [x] **קישור קהילת וואטסאפ** — `https://chat.whatsapp.com/J45vgvDnJhtCOUgKvpmZk8`
  - מוצג לאחר הרשמה (`Auth.tsx` — מסך `verify`, כרטיס ירוק עם כפתור "הצטרף עכשיו")
  - מוצג בדף הבית לאחר כניסה (`Home.tsx` — באנר מעל רשימת הארוחות)
- [x] **תיקון יישור במובייל** (`About.tsx`) — badge "חינמי לחלוטין" תוקן מ-`self-end` ל-`self-center` (לא היה ממורכז במובייל)
- [x] **תמונות לוגו לקבוצות וואטסאפ** — 4 קבצי JPEG ב-`public/images/`, 512×512px, פלטת המותג:
  - `whatsapp-updates.jpg` — קבוצת עדכונים (רקע אדום-טרקוטה)
  - `whatsapp-admins.jpg` — קבוצת מנהלים (רקע כחול כהה)
  - `whatsapp-vip.jpg` — חברי VIP (רקע זהב-חום)
  - `whatsapp-community.jpg` — לוגו קהילה כללי (רקע ירוק יער)

### עדכונים (31 אוקטובר 2026 — בוקר)
- [x] **קישור קהילת וואטסאפ** — `https://chat.whatsapp.com/J45vgvDnJhtCOUgKvpmZk8`
  - מוצג לאחר הרשמה (`Auth.tsx` — מסך `verify`)
  - מוצג בדף הבית לאחר כניסה (`Home.tsx` — באנר מעל רשימת הארוחות)
- [x] **תיקון יישור במובייל** (`About.tsx`) — badge "חינמי לחלוטין": `self-end` → `self-center`
- [x] **תמונות לוגו לקבוצות וואטסאפ** — 4 קבצי JPEG 512×512 ב-`public/images/` עם לוגו הקשת האמיתי
- [x] **פביקון** — עודכן מאמוג'י נר לסמל הקשת הרשמי (לבן על טרקוטה)

### עדכונים (31 אוקטובר 2026 — לילה)
- [x] **PWA — "הוסף למסך הבית"** (`vite-plugin-pwa`):
  - `manifest.json` אוטומטי: `name=שולחן פתוח`, `display=standalone`, `lang=he`, `dir=rtl`
  - Service Worker עם Workbox — cache לגופנים ו-assets
  - אייקוני PNG: `pwa-icon-192.png` + `pwa-icon-512.png` + `apple-touch-icon.png` (לוגו קשת לבן על טרקוטה)
  - `index.html`: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title=שולחן פתוח`, `theme-color=#C0522A`
  - **מה זה אומר**: משתמש יכול ללחוץ "הוסף למסך הבית" ב-Safari/Chrome → נפתח כאפליקציה בלי סרגל URL
- [x] **תיקון קראש התראות במובייל** — `format(new Date(created_at))` זרק כשהתאריך null/undefined → `safeFormat()` עם try/catch + isNaN guard

### עדכונים (28 אוקטובר 2026)
- [x] הוספת **טל אינדה-פורקר** כמייסדת שותפת בעמוד אודות — ביו, תמונת פרופיל (Instagram), TikTok + Instagram links
- [x] תמיכה באייקון TikTok בכרטיסי הצוות (`Social` type + `Music2` icon)
- [x] תיקון שגיאת Windows Script Host — `UseWINSAFER=0` ב-`HKCU\Software\Microsoft\Windows Script Host\Settings` (ה-dialog של "פוליסה של JavaScript" לא יחזור)

---

### תשתית
- [x] יצירת פרויקט Supabase חדש (`hashulchan-hapatuach`, region: `eu-central-1`)
- [x] הגדרת DB schema מלא (migrations)
- [x] הגדרת RLS policies לכל הטבלאות
- [x] Edge Function: `send-notification-email` (Resend)
- [x] DB Triggers: עדכון אוטומטי של ratings + counters
- [x] Vite + React + TypeScript + Tailwind setup
- [x] Vercel deployment (GitHub → Vercel auto-deploy)

### פיצ'רים שפועלים
- [x] הרשמה + כניסה (Supabase Auth עם אימות מייל)
- [x] אונבורדינג 5 שלבים (שם, עיר, כשרות/דת/טלפון, ביו, תקנון)
- [x] עמוד בית: גלישה באירועים עם סינון (כשרות, דת, עיר, תאריך)
- [x] יצירת אירוע (מארח) — כולל הגבלות גיל, מגבלת אורחים, כשרות
- [x] עמוד אירוע + הרשמה כאורח
- [x] ניהול אירועים (מארח): אישור/דחיית אורחים
- [x] שליחת מייל אוטומטי לאורח עם כתובת + טלפון מארח לאחר אישור
- [x] שליחת מייל למארח על אורח חדש שנרשם
- [x] הגבלת מכסת אורחים (אירוע נעלם מהחיפוש כשמלא)
- [x] הצעת עצמי כאורח (פרופיל גלוי לכל)
- [x] מערכת דירוגים (1-7 ימים אחרי האירוח, שני הצדדים)
- [x] התראות באתר ובמייל
- [x] פרופיל אישי + עריכה
- [x] צפייה בפרופיל ציבורי של מארח/אורח
- [x] עמוד תקנון (מלא ועם הסכמה בהרשמה)
- [x] עמוד מדיניות פרטיות
- [x] הצהרת נגישות (תקן ישראלי AA)
- [x] דף 404 + error states
- [x] dark mode + light mode
- [x] RTL מלא (עברית)
- [x] Mobile-first responsive design

---

## 🔑 Supabase

| פרמטר | ערך |
|---|---|
| **Project ID** | `vazpzeleradoecmtqhts` |
| **URL** | `https://vazpzeleradoecmtqhts.supabase.co` |
| **Region** | eu-central-1 (Europe / Frankfurt) |
| **Anon key** | ראה `.env.local` |
| **Organization** | `oyyswgbpqeqjxoziowdo` (saar0246-ai) |

---

## 🚀 Vercel / GitHub

| פרמטר | ערך |
|---|---|
| **GitHub Repo** | (יש ליצור: `saar0246-ai/hashulchan-hapatuach`) |
| **Vercel URL** | (יוגדר לאחר deploy) |

---

## 📧 Email (Resend)

- שירות: Resend — 3,000 מיילים/חודש חינם
- Secret names ב-Supabase:
  - `RESEND_API_KEY` — מפתח API מ-resend.com
  - `RESEND_FROM_EMAIL` — כתובת השולח (למשל: noreply@hashulchan.co.il)
  - `SITE_URL` — כתובת האתר (https://hashulchan.co.il)

**להגדיר:** Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

## 🛠️ איך להריץ מקומית

```bash
cd C:\Users\PC\Desktop\opentable
npm install
npm run dev
```

האתר ירוץ על http://localhost:5173

---

## 🏗️ Stack טכנולוגי

| שכבה | טכנולוגיה |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (לא shadcn — עיצוב מותאם) |
| Icons | Lucide React |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL + Edge Functions + Realtime) |
| Email | Resend SDK (דרך Edge Functions) |
| Deployment | Vercel (מ-GitHub) |

---

## 🎨 מערכת עיצוב

- **Palette**: זהב חם (נר שבת) + בורגונדי/יין + קרם חמים
- **Font**: Heebo (עברית ואנגלית) + Frank Ruhl Libre (כותרות)
- **Direction**: RTL מלא
- **Mobile-first**: תוכנן ל-430px ומטה

---

## 📁 מבנה תיקיות

```
opentable/
├── src/
│   ├── components/     # רכיבים משותפים
│   ├── pages/          # עמודים
│   ├── hooks/          # React hooks
│   ├── lib/            # supabase client
│   └── types/          # TypeScript types
├── supabase/
│   └── functions/      # Edge Functions (Deno)
├── .env.local          # משתני סביבה (לא ב-git)
└── README.md           # המסמך הזה
```

---

## 🔮 מה עוד לעשות (Backlog)

- [ ] העלאת תמונת פרופיל (Supabase Storage)
- [ ] Push notifications (PWA)
- [ ] צ'אט בין מארח לאורח
- [ ] מפה אינטראקטיבית של אירועים
- [ ] "חג" calendar view
- [ ] Admin dashboard
- [ ] Google OAuth login
- [ ] אפליקציה מקומית (React Native)

---

## ⚠️ הערות חשובות

1. **Windows + Supabase CLI**: לעולם לא לכתוב עברית בתוך גוף פונקציות SQL — גורם לשגיאות encoding (למדנו מ-TEOS)
2. **Resend secrets**: חייבים להגדיר ב-Supabase לפני שהמיילים יעבדו
3. **Email verification**: Supabase שולח מייל אימות מובנה — אפשר להחליף ל-Resend ב-Auth Settings
4. **RLS**: כל הטבלאות מוגנות — לא לבטל RLS

---

*נבנה על ידי Claude Code • saar0246@gmail.com*
