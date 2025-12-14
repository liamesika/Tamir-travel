"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, TreePine, Home, Sunrise, ShoppingBag, Camera, Coffee, Car } from "lucide-react";

export default function ItinerarySection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...new Set([...prev, index])]);
          }
        },
        { threshold: 0.3 }
      );

      if (ref) {
        observer.observe(ref);
      }

      return observer;
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const days = [
    {
      day: "יום ראשון",
      title: "יוצאים לטבע",
      activities: [
        {
          icon: Car,
          title: "איסוף מלונדון",
          description: "נקודת מפגש מרכזית בלונדון. יוצאים לדרך!",
        },
        {
          icon: TreePine,
          title: "נסיעה לאזורי הטבע",
          description: "נוסעים צפונה/מערבה לעבר הכפר האנגלי האותנטי",
        },
        {
          icon: Camera,
          title: "נקודות תצפית ונופים",
          description: "עצירות בנקודות מיוחדות עם נופים ירוקים עוצרי נשימה",
        },
        {
          icon: MapPin,
          title: "כפרי מורשת היסטוריים",
          description: "סיור בכפרים עתיקים, בתי אבן, פאבים מקומיים ואווירה אנגלית אותנטית",
        },
        {
          icon: Home,
          title: "לינה במקום קסום",
          description: "לינה באווירה כפרית, מוקפים בטבע ושקט",
        },
      ],
    },
    {
      day: "יום שני",
      title: "טבע ושופינג",
      activities: [
        {
          icon: Coffee,
          title: "ארוחת בוקר",
          description: "ארוחת בוקר אנגלית מלאה במקום הלינה",
        },
        {
          icon: Sunrise,
          title: "בוקר בטבע",
          description: "המשך גילוי אזורי הטבע והנופים הירוקים",
        },
        {
          icon: ShoppingBag,
          title: "אאוטלטים בלב הטבע",
          description: "יום שופינג מלא באאוטלטים גדולים באזורים כפריים — מחירים שלא תמצאו בלונדון!",
        },
        {
          icon: Car,
          title: "חזרה ללונדון",
          description: "חוזרים עמוסים בחוויות, תמונות ושקיות קניות",
        },
      ],
    },
  ];

  return (
    <section
      id="itinerary"
      className="py-12 sm:py-16 bg-gradient-to-b from-white to-earth-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block text-nature-600 font-medium mb-2 text-sm">
            מסלול הטיול
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-3">
            יומיים של חוויות
            <span className="text-nature-600"> בלתי נשכחות</span>
          </h2>
          <p className="text-base sm:text-lg text-sage-600 max-w-2xl mx-auto">
            מסלול מתוכנן בקפידה שמשלב טבע, היסטוריה ושופינג — הכל בקצב נעים ובלי לחץ
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                ref={(el) => (itemRefs.current[dayIndex] = el)}
                className={`transition-all duration-700 ${
                  visibleItems.includes(dayIndex)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${dayIndex * 200}ms` }}
              >
                {/* Day Header */}
                <div className="bg-gradient-to-r from-nature-600 to-nature-700 rounded-t-2xl p-4 text-white">
                  <span className="text-nature-200 text-sm font-medium">
                    {day.day}
                  </span>
                  <h3 className="text-2xl font-bold mt-1">{day.title}</h3>
                </div>

                {/* Activities */}
                <div className="bg-white rounded-b-2xl shadow-xl border border-sage-100 p-4 space-y-4">
                  {day.activities.map((activity, actIndex) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={actIndex}
                        className="flex gap-4 items-start group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-nature-100 flex items-center justify-center flex-shrink-0 group-hover:bg-nature-200 transition-colors">
                          <Icon className="w-6 h-6 text-nature-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sage-900 mb-1">
                            {activity.title}
                          </h4>
                          <p className="text-sage-600 text-sm leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-heritage-100 text-heritage-800 px-4 py-2 rounded-full text-sm font-medium">
              <span>*</span>
              <span>המסלול גמיש ומותאם לעונה ולתנאי מזג האוויר</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-6 text-center">
            <a
              href="#booking-form-section"
              className="inline-block bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              רוצים להצטרף? שריינו מקום
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
