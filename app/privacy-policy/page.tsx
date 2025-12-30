import Link from 'next/link'

export const metadata = {
  title: 'מדיניות פרטיות | Tamir Tours',
  description: 'מדיניות הפרטיות של Tamir Tours',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← חזרה לעמוד הראשי
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            מדיניות פרטיות
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p>
              Tamir Tours מכבדת את פרטיות המשתמשים באתר ופועלת בהתאם להוראות החוק להגנת הפרטיות, התשמ"א–1981 ולתקנות הרלוונטיות.
            </p>

            <p>
              בעת שימוש באתר, ייתכן שתתבקשו למסור מידע אישי, לרבות: שם מלא, כתובת דוא"ל, מספר טלפון, פרטי הזמנה, פרטי תשלום (המועברים בצורה מאובטחת באמצעות ספקי סליקה חיצוניים), ופרטים נוספים הדרושים לצורך ביצוע הזמנות, מתן שירות, משלוח עדכונים ומידע רלוונטי אודות טיולים.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">המידע האישי משמש לצרכים הבאים בלבד:</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>ניהול והשלמת הזמנות טיול</li>
              <li>יצירת קשר עם הלקוח</li>
              <li>שליחת אישורי תשלום, בקשות השלמת תשלום ועדכונים לגבי הטיול</li>
              <li>שיפור השירות וחוויית המשתמש</li>
              <li>שליחת חומרים שיווקיים ועדכונים – רק בכפוף להסכמה מפורשת של המשתמש</li>
            </ul>

            <p>
              Tamir Tours אינה מוכרת, משכירה או משתפת מידע אישי עם צדדים שלישיים למטרות שיווק.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">ייתכן ויועבר מידע לספקי שירות חיצוניים לצורך תפעול האתר, כגון:</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>חברות סליקה (Stripe)</li>
              <li>ספקי שליחת דוא"ל (Resend)</li>
              <li>ספקי אחסון ושרתים</li>
              <li>שירותי אנליטיקה ושיפור חוויית משתמש</li>
            </ul>

            <p>
              העברת מידע זו נעשית אך ורק לצורך מתן השירות.
            </p>

            <p>
              האתר עושה שימוש בעוגיות (Cookies) לצורך תפעול שוטף, אבטחה, סטטיסטיקה ושיפור חוויית המשתמש.
            </p>

            <p>
              לכל משתמש קיימת הזכות לעיין במידע שנשמר עליו, לבקש תיקון, עדכון או מחיקה של המידע, באמצעות פנייה לכתובת:
            </p>

            <p className="font-semibold text-primary-600">
              tamirtours.uk@gmail.com
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-sage-900 border-t border-sage-800 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-3 text-sm text-sage-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              מדיניות פרטיות
            </Link>
            <span className="text-sage-700">•</span>
            <Link href="/terms-of-use" className="hover:text-white transition-colors">
              תנאי שימוש
            </Link>
          </div>
          <p className="text-sage-500 text-xs">
            © {new Date().getFullYear()} מחוץ ללונדון | כל הזכויות שמורות
          </p>
        </div>
      </footer>
    </div>
  )
}
