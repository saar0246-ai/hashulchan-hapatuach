# 🕯️ השולחן הפתוח — HaShulchan HaPatuach

פלטפורמה לחיבור בין מארחים לאורחים לארוחות שישי, חגים ושבתות. דומה במושג ל-Airbnb — אבל לשולחן הישראלי.

---

## 📋 תיעוד מצב הפרויקט (עדכן בכל פתיחת חלון חדש!)

### 🗓️ נוצר: 28 ספטמבר 2026
### 🔄 עדכון אחרון: 28 ספטמבר 2026

---

## ✅ מה נעשה עד כה

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
