import { Phone, Mail, MapPin, Send, Check } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            צרו איתנו קשר
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            נשמח לענות על כל שאלה ולעזור לכם להירשם לטיול
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      טלפון
                    </h3>
                    <a
                      href="tel:0501234567"
                      className="text-lg text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      050-123-4567
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      ראשון - חמישי, 9:00 - 20:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <SiWhatsapp className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      וואטסאפ
                    </h3>
                    <a
                      href="https://wa.me/972501234567"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-lg text-green-600 hover:text-green-700 transition-colors"
                    >
                      <span>שלחו הודעה</span>
                      <Send className="w-4 h-4" />
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      התגובה המהירה ביותר
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-7 h-7 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      דוא"ל
                    </h3>
                    <a
                      href="mailto:info@trip.co.il"
                      className="text-lg text-accent-600 hover:text-accent-700 transition-colors break-all"
                    >
                      info@trip.co.il
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      נענה תוך 24 שעות
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      נקודת מפגש
                    </h3>
                    <p className="text-gray-700">
                      חניון הכניסה לפארק הלאומי
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      הפרטים המדויקים יישלחו לאחר ההרשמה
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-2xl p-8 sm:p-10 text-white">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6">
                מעוניינים בפרטים נוספים?
              </h3>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                מלאו את הפרטים ונחזור אליכם בהקדם עם כל המידע על הטיול, מחירים
                מיוחדים והצעות בלעדיות.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span>מענה מהיר ומקצועי</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span>ייעוץ אישי ללא התחייבות</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span>הצעות מחיר מיוחדות</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-white/80 text-sm text-center">
                  בשלב זה, צרו קשר באמצעי הקשר שלמעלה
                  <br />
                  או שלחו וואטסאפ לתיאום שיחת היכרות
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-primary-700">
              טיול חווייתי
            </div>
            <p className="text-gray-600">
              חוויות טיול בלתי נשכחות בכל רחבי הארץ
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-primary-600 transition-colors">
                תנאי שימוש
              </a>
              <span>•</span>
              <a href="#" className="hover:text-primary-600 transition-colors">
                מדיניות פרטיות
              </a>
              <span>•</span>
              <a href="#" className="hover:text-primary-600 transition-colors">
                נגישות
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} כל הזכויות שמורות | רישיון מדריך
              תיירות מס׳ 12345
            </p>
            <p className="text-gray-400 text-xs max-w-3xl mx-auto">
              האתר והתכנים בו הינם לצרכי מידע בלבד ואינם מהווים הצעה מחייבת.
              התמונות באתר הן להמחשה בלבד. התכנים והמחירים עשויים להשתנות ללא
              הודעה מוקדמת. בכפוף לתנאי השימוש.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
