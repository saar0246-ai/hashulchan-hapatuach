import TopBar from '../components/TopBar'

export default function Privacy() {
  return (
    <div className="min-h-dvh bg-background">
      <TopBar title="מדיניות פרטיות" showBack />
      <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h1 className="font-display font-bold text-2xl text-foreground">מדיניות פרטיות</h1>
          <p className="text-sm text-muted-foreground mt-1">עדכון אחרון: ספטמבר 2026</p>
        </div>

        {[
          {
            title: 'מידע שאנו אוספים',
            content: `אנו אוספים מידע שאתה מספק ישירות: שם, גיל, עיר, שכונה, כתובת מייל, מספר טלפון, רמת כשרות, השתייכות דתית, ביוגרפיה ותמונת פרופיל. אנו גם אוספים מידע שנוצר בשימוש: אירועים שפרסמת, בקשות שהגשת, דירוגים ועדכוני מיקום כללי.`
          },
          {
            title: 'כיצד נשתמש במידע',
            content: `המידע משמש אך ורק לתפעול הפלטפורמה: הצגת פרופיל, שליחת התראות, חיבור מארחים ואורחים, ואימות זהות. אין אנו מוכרים, משכירים, או מעבירים מידע לצדדים שלישיים למטרות שיווק. מידע עשוי להיות מועבר לספקי שירות חיוניים (Supabase לאחסון, Brevo לשליחת מיילים) בכפוף להסכמי סודיות.`
          },
          {
            title: 'מה גלוי לציבור',
            content: `הפרטים הבאים גלויים לכל המשתמשים: שם, תמונה, גיל, עיר+שכונה, כשרות, השתייכות דתית, ביוגרפיה, דירוגים, ומספר ארוחות. הכתובת המדויקת ומספר הטלפון מועברים רק לאורחים שאושרו ישירות על ידי המארח.`
          },
          {
            title: 'אבטחת מידע',
            content: `המידע מאוחסן בשרתים מאובטחים של Supabase (EU Central 1 - Frankfurt). כל תקשורת מוצפנת ב-TLS. אנו מיישמים בקרות גישה על בסיס תפקיד (RLS - Row Level Security). סיסמאות מוצפנות עם bcrypt ואינן נשמרות בטקסט גלוי.`
          },
          {
            title: 'זכויותיך',
            content: `בהתאם לחוק הגנת הפרטיות הישראלי ולתקנות GDPR של האיחוד האירופי, יש לך זכות לגשת למידע שנאסף עליך, לתקן אותו, למחוק אותו ("הזכות להישכח"), לקבל עותק שלו (ניידות מידע) ולהגיש תלונה לרשות להגנת הפרטיות. לפנות: info@hashulchan.co.il`
          },
          {
            title: 'קובצי עוגיה (Cookies)',
            content: `אנו משתמשים בעוגיות חיוניות בלבד לניהול הפגישה (Session) ולאבטחה. אין אנו משתמשים בעוגיות מעקב, פרסום, או ניתוח התנהגות של צד שלישי.`
          },
          {
            title: 'שמירת מידע',
            content: `פרטי חשבון נשמרים כל עוד החשבון פעיל. בעת מחיקת חשבון, נמחקים הפרטים האישיים תוך 30 יום. תוכן שנוצר (דירוגים, הערות) עשוי להישמר בצורה אנונימית לצורך שלמות הנתונים.`
          },
        ].map(({ title, content }) => (
          <div key={title} className="shulchan-card p-4 space-y-2">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
          </div>
        ))}

        <div className="shulchan-card p-4 bg-primary/5 border-primary/20 text-center">
          <p className="text-sm font-medium text-foreground">פניות בנושא פרטיות</p>
          <a href="mailto:privacy@hashulchan.co.il" className="text-sm text-primary underline">privacy@hashulchan.co.il</a>
        </div>
      </div>
    </div>
  )
}
