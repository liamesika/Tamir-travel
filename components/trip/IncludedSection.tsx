"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function IncludedSection() {
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

  const included = [
    "לינה במקום מוקף טבע",
    "ארוחת בוקר אנגלית מלאה",
    "הסעה מלונדון וחזרה",
    "ליווי והדרכה לאורך כל הטיול",
    "סיור בכפרי מורשת היסטוריים",
    "גישה לנקודות תצפית מיוחדות",
    "יום שופינג באאוטלטים",
  ];

  const notIncluded = [
    "טיסות ללונדון",
    "ארוחות נוספות (מלבד ארוחת בוקר)",
    "כניסה לאטרקציות בתשלום",
    "הוצאות אישיות ושופינג",
  ];

  return (
    <section
      ref={sectionRef}
      id="included"
      className="py-12 sm:py-16 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block text-nature-600 font-medium mb-2 text-sm">
            מה כלול
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-3">
            הכל כלול —
            <span className="text-nature-600"> פשוט להגיע וליהנות</span>
          </h2>
          <p className="text-base sm:text-lg text-sage-600 max-w-2xl mx-auto">
            כל מה שאתם צריכים כדי לצאת לחוויה בלי דאגות
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Included */}
          <div
            className={`bg-gradient-to-br from-nature-50 to-nature-100 rounded-2xl p-5 sm:p-6 shadow-lg border border-nature-200 transition-all duration-1000 hover:shadow-xl ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-nature-500 flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-sage-900">
                מה כלול
              </h3>
            </div>
            <ul className="space-y-3">
              {included.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-6 h-6 rounded-full bg-nature-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sage-800 text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Included */}
          <div
            className={`bg-gradient-to-br from-earth-50 to-earth-100 rounded-2xl p-5 sm:p-6 shadow-lg border border-earth-200 transition-all duration-1000 hover:shadow-xl ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-earth-400 flex items-center justify-center shadow-lg">
                <X className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-sage-900">
                מה לא כלול
              </h3>
            </div>
            <ul className="space-y-3">
              {notIncluded.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-6 h-6 rounded-full bg-earth-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <X className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sage-800 text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tip Box */}
        <div
          className={`mt-6 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-gradient-to-r from-heritage-50 to-heritage-100 border-2 border-heritage-200 rounded-xl p-4 sm:p-5">
            <h4 className="text-lg font-bold text-sage-900 mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              טיפ חשוב
            </h4>
            <p className="text-sage-700 leading-relaxed text-sm sm:text-base">
              מומלץ להגיע עם נעליים נוחות להליכה, שכבות ביגוד (מזג האוויר באנגליה משתנה!),
              ומזוודה קטנה או תיק ללינה. אל תשכחו מקום לקניות מהאאוטלטים! 🛍️
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
