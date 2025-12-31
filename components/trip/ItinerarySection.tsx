"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, TreePine, Home, Sunrise, ShoppingBag, Camera, Coffee, Car, LucideIcon, Utensils } from "lucide-react";

interface ItineraryActivity {
  icon: string;
  title: string;
  description: string;
}

interface ItineraryDay {
  day: string;
  title: string;
  activities: ItineraryActivity[];
}

interface ItinerarySectionProps {
  itinerarySteps?: ItineraryDay[];
}

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  TreePine,
  Home,
  Sunrise,
  ShoppingBag,
  Camera,
  Coffee,
  Car,
  Utensils,
};

const defaultDays: ItineraryDay[] = [
  {
    day: "יום ראשון",
    title: "יוצאים לטבע",
    activities: [
      { icon: "Car", title: "איסוף מלונדון", description: "נקודת מפגש מרכזית ונגישה מאוד, תחנת Tower Hill בלונדון. יוצאים לדרך! (הסבר פשוט איך מגיעים לנקודת המפגש בשאלות ותשובות)" },
      { icon: "TreePine", title: "נסיעה לאזורי הטבע", description: "נוסעים כשעתיים לכפרים האנגלים האותנטיים. כבר במהלך הנסיעה תראו שהנוף מתחלף מהאורבני הלחוץ לנופים ירוקים עוצרי נשימה" },
      { icon: "MapPin", title: "כפרים ציוריים", description: "סיור בכפרים עתיקים, בתי אבן, נחלים, תוכלו ליהנות ממסעדות אותנטיות בטבע, חנויות כפריות ואווירה אנגלית מסורתית" },
      { icon: "Home", title: "לינה במקום קסום", description: "לינה באווירה כפרית, מוקפים בטבע ושקט" },
    ],
  },
  {
    day: "יום שני",
    title: "טבע ושופינג",
    activities: [
      { icon: "Utensils", title: "ארוחת בוקר", description: "ארוחת בוקר אנגלית מלאה במקום הלינה" },
      { icon: "Coffee", title: "קפה בעיירה קסומה", description: "סיור התרעננות בעיירה מקסימה, אפשר ליהנות מחנויות מקומיות וקפה משובח" },
      { icon: "ShoppingBag", title: "אאוטלט מותגים", description: "יום שופינג באאוטלט גדול יפיפה שנמצא באזור הכפרים — מחירים שלא תמצאו בלונדון!" },
      { icon: "Car", title: "חזרה ללונדון", description: "חוזרים לתחנת Tower Hill בלונדון עמוסים בחוויות, תמונות ושקיות קניות :)" },
    ],
  },
];

export default function ItinerarySection({ itinerarySteps }: ItinerarySectionProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const days = itinerarySteps && itinerarySteps.length > 0 ? itinerarySteps : defaultDays;

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
  }, [days]);

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
            מסלול מתוכנן בקפידה שמשלב טבע, נוסטלגיה, פשטות ושופינג — הכל בקצב נעים, רגוע ובלי לחץ
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
                {/* Day Header - increased font sizes */}
                <div className="bg-gradient-to-r from-nature-600 to-nature-700 rounded-t-xl p-3 sm:p-4 text-white">
                  <span className="text-nature-200 text-sm sm:text-base font-medium">
                    {day.day}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold leading-tight">{day.title}</h3>
                </div>

                {/* Day Content - increased font sizes and spacing */}
                <div className="bg-white rounded-b-xl shadow-lg border border-sage-100 p-4 sm:p-5 space-y-3 sm:space-y-4">
                  {day.activities.map((activity, actIndex) => {
                    const Icon = iconMap[activity.icon] || MapPin;
                    return (
                      <div
                        key={actIndex}
                        className="flex gap-3 items-start group"
                      >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-nature-100 flex items-center justify-center flex-shrink-0 group-hover:bg-nature-200 transition-colors">
                          <Icon className="w-5 h-5 text-nature-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sage-900 text-base sm:text-lg mb-1 leading-snug">
                            {activity.title}
                          </h4>
                          <p className="text-sage-600 text-sm sm:text-base leading-relaxed">
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

          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-heritage-100 text-heritage-800 px-3 py-1.5 rounded-full text-xs font-medium">
              <span>*</span>
              <span>המסלול גמיש ומותאם לעונה ולתנאי מזג האוויר</span>
            </div>
          </div>

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
