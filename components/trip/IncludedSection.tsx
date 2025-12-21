"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IncludedSectionProps {
  includedItems?: string[];
  notIncludedItems?: string[];
}

const defaultIncluded = [
  "לינה במקום מוקף טבע",
  "ארוחת בוקר אנגלית מלאה",
  "הסעה מלונדון וחזרה",
  "ליווי והדרכה לאורך כל הטיול",
  "סיור בכפרי מורשת היסטוריים",
  "גישה לנקודות תצפית מיוחדות",
  "יום שופינג באאוטלטים",
];

const defaultNotIncluded = [
  "טיסות ללונדון",
  "ארוחות נוספות (מלבד ארוחת בוקר)",
  "כניסה לאטרקציות בתשלום",
  "הוצאות אישיות ושופינג",
];

export default function IncludedSection({
  includedItems,
  notIncludedItems,
}: IncludedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const included = includedItems && includedItems.length > 0 ? includedItems : defaultIncluded;
  const notIncluded = notIncludedItems && notIncludedItems.length > 0 ? notIncludedItems : defaultNotIncluded;

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
    <section ref={sectionRef} id="included" className="py-8 sm:py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-block text-nature-600 font-medium mb-1.5 text-xs">מה כלול</span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 mb-2">
            הכל כלול —<span className="text-nature-600"> פשוט להגיע וליהנות</span>
          </h2>
          <p className="text-sm sm:text-base text-sage-600 max-w-2xl mx-auto">
            כל מה שאתם צריכים כדי לצאת לחוויה בלי דאגות
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div
            className={`bg-gradient-to-br from-nature-50 to-nature-100 rounded-xl p-4 shadow-lg border border-nature-200 transition-all duration-1000 hover:shadow-xl ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-nature-500 flex items-center justify-center shadow-md">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-sage-900">מה כלול</h3>
            </div>
            <ul className="space-y-2">
              {included.map((item, index) => (
                <li key={index} className="flex items-start gap-2 group">
                  <div className="w-5 h-5 rounded-full bg-nature-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sage-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`bg-gradient-to-br from-earth-50 to-earth-100 rounded-xl p-4 shadow-lg border border-earth-200 transition-all duration-1000 hover:shadow-xl ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-earth-400 flex items-center justify-center shadow-md">
                <X className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-sage-900">מה לא כלול</h3>
            </div>
            <ul className="space-y-2">
              {notIncluded.map((item, index) => (
                <li key={index} className="flex items-start gap-2 group">
                  <div className="w-5 h-5 rounded-full bg-earth-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sage-800 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`mt-4 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-gradient-to-r from-heritage-50 to-heritage-100 border border-heritage-200 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm font-bold text-sage-900 mb-1 flex items-center gap-1.5">
              <span>💡</span>
              טיפ חשוב
            </h4>
            <p className="text-sage-700 leading-relaxed text-xs sm:text-sm">
              מומלץ להגיע עם נעליים נוחות להליכה, שכבות ביגוד (מזג האוויר באנגליה משתנה!),
              ומזוודה קטנה או תיק ללינה. אל תשכחו מקום לקניות מהאאוטלטים! 🛍️
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
