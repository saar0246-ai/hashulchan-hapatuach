import TopBar from '../components/TopBar'

export default function Accessibility() {
  return (
    <div className="min-h-dvh bg-background">
      <TopBar title="הצהרת נגישות" showBack />
      <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">♿</div>
          <h1 className="font-display font-bold text-2xl text-foreground">הצהרת נגישות</h1>
          <p className="text-sm text-muted-foreground mt-1">בהתאם לתקן ישראלי 5568</p>
        </div>

        <div className="shulchan-card p-4 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">✅ רמת תאימות: AA (WCAG 2.1)</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">האתר עומד ברמת הנגישות AA של תקן WCAG 2.1 ובדרישות תקן ישראלי 5568.</p>
        </div>

        {[
          {
            title: 'מה עשינו',
            items: [
              'כל התמונות כוללות טקסט חלופי (alt text)',
              'יחסי ניגודיות עומדים בדרישות AA (לפחות 4.5:1)',
              'ניתן לנווט בכל האתר באמצעות מקלדת בלבד',
              'שפת הדף מוגדרת כעברית (lang="he" dir="rtl")',
              'כפתורים ואלמנטים אינטראקטיביים כוללים תוויות נגישות (aria-label)',
              'גודל גופן ברירת מחדל 16px, עם תמיכה בהגדלת גופן של הדפדפן',
              'התאמה מלאה ל-RTL (ימין לשמאל)',
              'עמודי האתר מגיבים לכל גדלי מסך (Responsive)',
              'ניגוד צבעים מספק גם במצב כהה (Dark Mode)',
              'תמיכה ב-zoom עד 200% ללא פגיעה בשימושיות',
              'הודעות שגיאה ברורות ותיאוריות',
              'מיקוד (focus) גלוי על כל האלמנטים',
            ]
          },
          {
            title: 'מגבלות ידועות',
            items: [
              'תמונות פרופיל שהועלו על ידי משתמשים אינן בשליטתנו ועשויות לחסר alt text מוגדר',
              'אין כרגע תרגום לשפות אחרות מלבד עברית',
            ]
          },
        ].map(({ title, items }) => (
          <div key={title} className="shulchan-card p-4 space-y-3">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="shulchan-card p-4 space-y-2">
          <h2 className="font-semibold text-foreground">בקשת עזרה בנגישות</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            נתקלת בבעיית נגישות? אנחנו כאן לעזור. שלח אלינו מייל ונטפל בכך תוך 7 ימי עסקים.
          </p>
          <a href="mailto:access@hashulchan.co.il" className="text-sm text-primary font-medium underline">
            access@hashulchan.co.il
          </a>
        </div>

        <div className="shulchan-card p-4 space-y-2">
          <h2 className="font-semibold text-foreground">גורם מוסמך</h2>
          <p className="text-sm text-muted-foreground">
            אחראי נגישות: מנהל הפלטפורמה<br />
            תאריך בדיקה אחרון: ספטמבר 2026<br />
            כלי בדיקה: Lighthouse, axe DevTools, NVDA
          </p>
        </div>
      </div>
    </div>
  )
}
