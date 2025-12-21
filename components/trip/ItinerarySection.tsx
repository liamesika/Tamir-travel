"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, TreePine, Home, Sunrise, ShoppingBag, Camera, Coffee, Car, LucideIcon } from "lucide-react";

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
};

const defaultDays: ItineraryDay[] = [
  {
    day: "יום ראשון",
    title: "יוצאים לכפר האנגלי",
    activities: [
      { icon: "Car", title: "איסוף מ-Tower Hill", description: "נקודת מפגש מרכזית בלונדון. יוצאים לדרך!" },
      { icon: "TreePine", title: "נסיעה לכפרים", description: "נוסעים לעבר הכפר האנגלי האותנטי — נופים ירוקים לאורך כל הדרך" },
      { icon: "MapPin", title: "סיור בכפרים ציוריים", description: "בתי אבן עתיקים, נחלים, פאבים מקומיים ואווירה אנגלית קסומה" },
      { icon: "Coffee", title: "זמן חופשי", description: "זמן לקפה, מסעדה מקומית או סיבוב עצמאי" },
      { icon: "Home", title: "לינה במקום מוקף טבע", description: "לילה באווירה כפרית, מוקפים בשקט ושלווה" },
    ],
  },
  {
    day: "יום שני",
    title: "בוקר בטבע + שופינג",
    activities: [
      { icon: "Coffee", title: "ארוחת בוקר במלון", description: "ארוחת בוקר אנגלית מלאה — התחלה טובה ליום" },
      { icon: "Sunrise", title: "קפה בכפר", description: "עצירה נוספת בכפר ציורי להנאה אחרונה מהנוף" },
      { icon: "ShoppingBag", title: "שופינג באאוטלט מותגים", description: "יום קניות מפנק — Nike, Adidas, Tommy Hilfiger, Burberry ועוד" },
      { icon: "Car", title: "חזרה ל-Tower Hill", description: "חוזרים עמוסים בחוויות, תמונות ושקיות קניות" },
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
            מסלול רגוע, מתוכנן בקפידה, בלי לחץ
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
                <div className="bg-gradient-to-r from-nature-600 to-nature-700 rounded-t-xl p-3 text-white">
                  <span className="text-nature-200 text-xs font-medium">
                    {day.day}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold">{day.title}</h3>
                </div>

                <div className="bg-white rounded-b-xl shadow-lg border border-sage-100 p-3 space-y-2.5">
                  {day.activities.map((activity, actIndex) => {
                    const Icon = iconMap[activity.icon] || MapPin;
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
