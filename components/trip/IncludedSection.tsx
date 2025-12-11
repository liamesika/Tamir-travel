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
    "הסעות מלאות בתיאום מראש",
    "הדרכה מקצועית לאורך כל הטיול",
    "ביטוח מקיף לכל המשתתפים",
    "ארוחת בוקר קלה וכיבוד",
    "מים וכיבוד לאורך היום",
    "ערכת עזרה ראשונה ואבזור בטיחות",
    "מפות ומדריכים מודפסים",
  ];

  const notIncluded = [
    "ארוחת צהריים (מומלץ להביא אוכל אישי)",
    "ביגוד והנעלה אישיים",
    "ציוד צילום אישי",
    "הוצאות אישיות נוספות",
  ];

  return (
    <section ref={sectionRef} id="included" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            מה כלול בטיול?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            כל מה שאתם צריכים לדעת לפני ההרשמה
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div className={`bg-green-50 rounded-2xl p-8 shadow-lg border-2 border-green-200 transition-all duration-1000 hover:shadow-2xl hover:scale-105 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                מה כלול
              </h3>
            </div>
            <ul className="space-y-4">
              {included.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-800 text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`bg-red-50 rounded-2xl p-8 shadow-lg border-2 border-red-200 transition-all duration-1000 hover:shadow-2xl hover:scale-105 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} style={{ transitionDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <X className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                מה לא כלול
              </h3>
            </div>
            <ul className="space-y-4">
              {notIncluded.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-800 text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8">
          <h4 className="text-xl font-bold text-gray-900 mb-3">
            מה מומלץ להביא?
          </h4>
          <p className="text-gray-700 leading-relaxed">
            נעליים סגורות ונוחות להליכה, כובע, משקפי שמש, קרם הגנה, בקבוק מים אישי,
            ארוחת צהריים קלה, ביגוד מתאים לעונה (שכבות), תרופות אישיות במידת הצורך,
            ומצלמה להנצחת הרגעים המיוחדים!
          </p>
        </div>
      </div>
    </section>
  );
}
