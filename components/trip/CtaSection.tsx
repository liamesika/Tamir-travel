"use client";

import { Calendar, CreditCard, Shield, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="booking"
      className="py-10 sm:py-14 bg-gradient-to-br from-nature-800 via-nature-900 to-sage-950 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-nature-700/20 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-heritage-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nature-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div
            className={`bg-white rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-nature-100 text-nature-700 px-4 py-2 rounded-full text-base font-medium mb-3">
                <Calendar className="w-5 h-5" />
                <span>מס' המקומות מוגבל</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2">
                מוכנים לגלות את
                <span className="text-nature-600"> הכפרים מחוץ ללונדון.</span>
              </h2>
              <p className="text-lg sm:text-xl text-sage-600 max-w-2xl mx-auto">
                שמרו את מקומכם עכשיו וצאו איתנו לחוויה בלתי נשכחת
              </p>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-br from-sage-50 to-nature-50 rounded-xl p-5 sm:p-6 mb-6 border border-sage-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-nature-500 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-sage-900">
                  איך זה עובד?
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-nature-500 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-sage-900 text-lg">מקדמה לשמירת מקום</h4>
                    <p className="text-sage-600 text-base leading-relaxed">
                      תשלום מקדמה של{" "}
                      <span className="font-bold text-nature-700">300 ₪</span>{" "}
                      לאדם מתוך המחיר הכולל לשמירת המקום שלכם.
                      <br />
                      <span className="text-sage-500">אל דאגה, המקדמה תוחזר במלואה במידה ולא נגיע למינימום משתתפים</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-nature-500 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sage-900 text-lg">השלמת התשלום</h4>
                    <p className="text-sage-600 text-base leading-relaxed">
                      מיד בהצטרפות מינימום משתתפים תקבלו קישור אישי להשלמת התשלום (המקדמה מקוזזת) תוך 7 ימים מקבלת ההודעה.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-nature-500 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-sage-900 text-lg">יוצאים לדרך!</h4>
                    <p className="text-sage-600 text-base leading-relaxed">
                      לאחר השלמת התשלום תקבלו את כל הפרטים ונצא לחוויה משותפת
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 justify-center bg-sage-50 rounded-xl py-3 px-4">
                <Shield className="w-6 h-6 text-nature-600" />
                <span className="text-base text-sage-700 font-medium">תשלום מאובטח</span>
              </div>
              <div className="flex items-center gap-2 justify-center bg-sage-50 rounded-xl py-3 px-4">
                <Wallet className="w-6 h-6 text-nature-600" />
                <span className="text-base text-sage-700 font-medium">אפשרות תשלומים ללא ריבית</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#booking-form-section"
                className="w-full sm:w-auto bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-heritage-500/30 text-center text-lg"
              >
                הבטחת מקום לטיול
              </a>
              <a
                href="#faq"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sage-600 hover:bg-sage-700 text-white font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 text-lg"
              >
                <span>יש שאלות? לשאלות נפוצות</span>
              </a>
            </div>
          </div>

          {/* Bottom note */}
          <div className="mt-5 text-center">
            <p className="text-white/80 text-lg">
              יש שאלות? אשמח לדבר איתכם ולהסביר על כל פרט בטיול
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
