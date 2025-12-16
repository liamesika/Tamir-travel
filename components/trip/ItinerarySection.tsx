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
      className="py-8 sm:py-10 bg-gradient-to-b from-white to-earth-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-block text-nature-600 font-medium mb-1.5 text-xs">
            מסלול הטיול
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 mb-2">
            יומיים של חוויות
            <span className="text-nature-600"> בלתי נשכחות</span>
          </h2>
          <p className="text-sm sm:text-base text-sage-600 max-w-2xl mx-auto">
            מסלול מתוכנן בקפידה שמשלב טבע, היסטוריה ושופינג — הכל בקצב נעים ובלי לחץ
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                ref={(el) => { itemRefs.current[dayIndex] = el; }}
                className={`transition-all duration-700 ${
                  visibleItems.includes(dayIndex)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${dayIndex * 200}ms` }}
              >
                {/* Day Header */}
                <div className="bg-gradient-to-r from-nature-600 to-nature-700 rounded-t-xl p-3 text-white">
                  <span className="text-nature-200 text-xs font-medium">
                    {day.day}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold">{day.title}</h3>
                </div>

                {/* Activities */}
                <div className="bg-white rounded-b-xl shadow-lg border border-sage-100 p-3 space-y-2.5">
                  {day.activities.map((activity, actIndex) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={actIndex}
                        className="flex gap-2.5 items-start group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-nature-100 flex items-center justify-center flex-shrink-0 group-hover:bg-nature-200 transition-colors">
                          <Icon className="w-4 h-4 text-nature-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sage-900 text-sm mb-0.5">
                            {activity.title}
                          </h4>
                          <p className="text-sage-600 text-xs leading-snug">
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
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-heritage-100 text-heritage-800 px-3 py-1.5 rounded-full text-xs font-medium">
              <span>*</span>
              <span>המסלול גמיש ומותאם לעונה ולתנאי מזג האוויר</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-4 text-center">
            <a
              href="#booking-form-section"
              className="inline-block bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-sm"
            >
              רוצים להצטרף? שריינו מקום
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
