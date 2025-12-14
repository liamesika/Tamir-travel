"use client";

import { Check, Calendar, CreditCard } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
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
      className="py-12 sm:py-16 bg-gradient-to-br from-nature-800 via-nature-900 to-sage-950 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-nature-700/20 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-heritage-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nature-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div
            className={`bg-white rounded-2xl shadow-2xl p-5 sm:p-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-nature-100 text-nature-700 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>מקומות מוגבלים</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2">
                מוכנים לגלות את
                <span className="text-nature-600"> לונדון האחרת?</span>
              </h2>
              <p className="text-base text-sage-600 max-w-2xl mx-auto">
                שמרו את מקומכם עכשיו וצאו איתי לחוויה בלתי נשכחת
              </p>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-br from-sage-50 to-nature-50 rounded-xl p-4 sm:p-5 mb-5 border border-sage-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-nature-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-sage-900">
                  איך זה עובד?
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-nature-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-sage-900 text-sm">מקדמה לשמירת מקום</h4>
                    <p className="text-sage-600 text-sm">
                      תשלום מקדמה של{" "}
                      <span className="font-bold text-nature-700">300 ₪</span>{" "}
                      לאדם לשמירת המקום שלכם
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-nature-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sage-900 text-sm">המחיר הסופי</h4>
                    <p className="text-sage-600 text-sm">
                      המחיר הסופי משתנה לפי העונה והתאריך — תקבלו קישור אישי
                      להשלמת התשלום
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-nature-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-sage-900 text-sm">יוצאים לדרך!</h4>
                    <p className="text-sage-600 text-sm">
                      לאחר התשלום תקבלו את כל הפרטים ונצא לחוויה משותפת
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="flex items-center gap-1.5 justify-center bg-sage-50 rounded-lg py-2 px-2">
                <Check className="w-4 h-4 text-nature-600" />
                <span className="text-xs text-sage-700">תשלום מאובטח</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center bg-sage-50 rounded-lg py-2 px-2">
                <Check className="w-4 h-4 text-nature-600" />
                <span className="text-xs text-sage-700">ביטול גמיש</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center bg-sage-50 rounded-lg py-2 px-2">
                <Check className="w-4 h-4 text-nature-600" />
                <span className="text-xs text-sage-700">קבוצות קטנות</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#booking-form-section"
                className="w-full sm:w-auto bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-heritage-500/30 text-center"
              >
                הבטחת מקום לטיול
              </a>
              <a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300"
              >
                <SiWhatsapp className="w-5 h-5" />
                <span>שאלות? דברו איתי</span>
              </a>
            </div>
          </div>

          {/* Bottom note */}
          <div className="mt-5 text-center">
            <p className="text-white/70 text-sm">
              יש שאלות? אשמח לדבר איתכם ולהסביר על כל פרט בטיול
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
