"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IncludedSectionProps {
  includedItems?: string[];
  notIncludedItems?: string[];
}

const defaultIncluded = [
  "לינה במקום מוקף טבע",
  "ארוחת בוקר מפנקת במלון",
  "הסעה מלונדון וחזרה",
  "ליווי צמוד לאורך כל הטיול",
  "סיור בכפרים ציוריים עתיקים",
  "יום שופינג מרוכז באאוטלט",
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
    <section ref={sectionRef} id="included" className="py-10 sm:py-14 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-3">
            מה כלול
          </h2>
          <p className="text-base sm:text-lg text-sage-600 max-w-2xl mx-auto leading-relaxed">
            כל מה שאתם צריכים כדי לצאת לחוויה בלי דאגות
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <div
            className={`bg-gradient-to-br from-nature-50 to-nature-100 rounded-xl p-5 sm:p-6 shadow-lg border border-nature-200 transition-all duration-1000 hover:shadow-xl ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-nature-500 flex items-center justify-center shadow-md">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-sage-900">מה כלול</h3>
            </div>
            <ul className="space-y-3">
              {included.map((item, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-nature-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sage-800 text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`bg-gradient-to-br from-earth-50 to-earth-100 rounded-xl p-5 sm:p-6 shadow-lg border border-earth-200 transition-all duration-1000 hover:shadow-xl ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-earth-400 flex items-center justify-center shadow-md">
                <X className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-sage-900">מה לא כלול</h3>
            </div>
            <ul className="space-y-3">
              {notIncluded.map((item, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-earth-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <X className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sage-800 text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`mt-6 sm:mt-8 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="bg-gradient-to-r from-heritage-50 to-heritage-100 border border-heritage-200 rounded-xl p-4 sm:p-5">
            <h4 className="text-base sm:text-lg font-bold text-sage-900 mb-2 flex items-center gap-2">
              <span>💡</span>
              טיפ חשוב
            </h4>
            <p className="text-sage-700 leading-relaxed sm:leading-loose text-sm sm:text-base">
              בחודשי החורף מומלץ ביגוד תרמי מכנסיים וחולצה. מומלץ להגיע עם שכבות ביגוד (מזג האוויר באנגליה משתנה!), ומזוודה קטנה או תיק ללינה. אל תשכחו מקום לקניות מהאאוטלט!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
