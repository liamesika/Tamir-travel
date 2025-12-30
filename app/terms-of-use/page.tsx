import Link from 'next/link'

export const metadata = {
  title: 'תנאי שימוש | Tamir Tours',
  description: 'תנאי השימוש באתר Tamir Tours',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← חזרה לעמוד הראשי
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            תקנון ותנאי שימוש
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p>
              השימוש באתר Tamir Tours מהווה הסכמה מלאה לתנאים המפורטים להלן:
            </p>

            <ul className="list-disc list-inside space-y-4 mr-4">
              <li>
                האתר משמש כפלטפורמה להזמנת טיולים היוצאים מבריטניה, לקבלת מידע, יצירת קשר וביצוע תשלומים.
              </li>
              <li>
                ההזמנה באתר מותנית בהשארת פרטים מלאים ונכונים. האחריות על נכונות הפרטים חלה על המשתמש בלבד.
              </li>
              <li>
                התשלומים באתר מתבצעים באמצעות מערכת סליקה מאובטחת של Stripe. פרטי כרטיסי אשראי אינם נשמרים בשרתי האתר.
              </li>
              <li>
                Tamir Tours רשאית לעדכן מחירים, מועדים, מסלולים ותכנים בהתאם לשיקול דעתה.
              </li>
              <li>
                ביטול טיול, החזרים, מינימום משתתפים ותנאי יציאה לטיול יפורטו בכל עמוד טיול באופן נפרד ומהווים חלק בלתי נפרד מתקנון זה.
              </li>
              <li>
                האתר רשאי לשלוח הודעות דוא"ל הקשורות להזמנה, לתשלומים ולשינויים בטיול.
              </li>
              <li>
                הנהלת האתר רשאית למנוע גישה ממשתמש אשר הפר את תנאי השימוש או פעל בניגוד לחוק.
              </li>
              <li>
                כל זכויות הקניין הרוחני באתר – לרבות עיצוב, תוכן, קוד ותמונות – שייכות ל-Tamir Tours ואין לעשות בהם שימוש ללא אישור מראש ובכתב.
              </li>
              <li>
                הדין החל וסמכות השיפוט הבלעדית בכל מחלוקת יהיו בתי המשפט בישראל.
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/privacy-policy" className="hover:text-white transition">
              מדיניות פרטיות
            </Link>
            <Link href="/terms-of-use" className="hover:text-white transition">
              תנאי שימוש
            </Link>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Tamir Tours. כל הזכויות שמורות.
          </p>
        </div>
      </footer>
    </div>
  )
}
