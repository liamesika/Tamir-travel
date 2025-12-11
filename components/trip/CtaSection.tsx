"use client";

import { Check, Users, Clock, Calendar, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function CtaSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="booking" className="py-16 sm:py-24 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span>הצעה מוגבלת בזמן</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                הבטיחו את מקומכם בטיול!
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                מספר המקומות מוגבל ומתמלא במהירות
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 sm:p-8 mb-8 border-2 border-red-200 shadow-lg">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    ההצעה תסתיים בעוד:
                  </h3>
                </div>
                <div className="flex justify-center gap-3 sm:gap-6" dir="ltr">
                  <div className="bg-white rounded-xl shadow-lg p-4 min-w-[80px] transform hover:scale-110 transition-transform">
                    <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-1">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">שעות</div>
                  </div>
                  <div className="flex items-center text-3xl font-bold text-red-600">:</div>
                  <div className="bg-white rounded-xl shadow-lg p-4 min-w-[80px] transform hover:scale-110 transition-transform">
                    <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-1">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">דקות</div>
                  </div>
                  <div className="flex items-center text-3xl font-bold text-red-600">:</div>
                  <div className="bg-white rounded-xl shadow-lg p-4 min-w-[80px] transform hover:scale-110 transition-transform">
                    <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-1">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">שניות</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent-50 to-orange-50 rounded-2xl p-6 sm:p-8 mb-8 border-2 border-accent-200 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    איך זה עובד?
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    כדי לשמור מקום בטיול, נדרש לשלם מקדמה של{" "}
                    <span className="font-bold text-accent-700 text-xl">300 ₪ לאדם</span>.
                    המקדמה מבטיחה את מקומכם בטיול ומנוכה מהמחיר הסופי.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mr-16 sm:mr-20">
                <div className="flex items-center gap-3 group">
                  <div className="w-2 h-2 bg-accent-500 rounded-full group-hover:scale-150 transition-transform" />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                    יתרת התשלום תשולם עד שבוע לפני הטיול
                  </span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-2 h-2 bg-accent-500 rounded-full group-hover:scale-150 transition-transform" />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                    ניתן לבטל עד 7 ימים לפני ולקבל החזר מלא
                  </span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-2 h-2 bg-accent-500 rounded-full group-hover:scale-150 transition-transform" />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                    לאחר התשלום תקבלו אישור ופרטים מלאים במייל
                  </span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-primary-200">
                <Users className="w-12 h-12 text-primary-600 mx-auto mb-3 drop-shadow-md" />
                <div className="text-4xl font-bold text-gray-900 mb-1">25</div>
                <div className="text-sm text-gray-600 font-semibold">מקומות בלבד</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-red-200">
                <Clock className="w-12 h-12 text-red-600 mx-auto mb-3 drop-shadow-md animate-pulse" />
                <div className="text-4xl font-bold text-gray-900 mb-1">12</div>
                <div className="text-sm text-gray-600 font-semibold">מקומות נותרו</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 border border-green-200">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-3 drop-shadow-md" />
                <div className="text-4xl font-bold text-gray-900 mb-1">300₪</div>
                <div className="text-sm text-gray-600 font-semibold">מקדמה לאדם</div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <a
                href="#booking-form-section"
                className="inline-block w-full sm:w-auto bg-gradient-to-r from-accent-500 to-orange-500 hover:from-accent-600 hover:to-orange-600 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-accent-500/50 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Calendar className="w-6 h-6" />
                  אני רוצה לשמור מקום
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </a>
              <p className="text-gray-500 text-sm">
                או צרו קשר לשיחת התאמה ללא התחייבות
              </p>
            </div>
          </div>

          <div className="mt-8 text-center animate-bounce">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm px-6 py-3 rounded-full text-white border-2 border-white/30 shadow-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-bold text-lg">המקומות מתמלאים במהירות!</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
