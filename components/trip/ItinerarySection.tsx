"use client";

import { Sunrise, Sun, Sunset, Moon, MapPin, Camera, Utensils } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ItinerarySection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => [...new Set([...prev, index])]);
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
      observers.forEach(observer => observer.disconnect());
    };
  }, []);
  const itinerary = [
    {
      time: "07:00",
      icon: Sunrise,
      title: "יציאה והתכנסות",
      description: "התכנסות בנקודת המפגש ויציאה לטיול. הסבר קצר על המסלול והבטיחות.",
    },
    {
      time: "08:30",
      icon: MapPin,
      title: "תחנה ראשונה - מצפה נוף עוצר נשימה",
      description: "טיפוס קצר לנקודת תצפית מרהיבה. סיפורים היסטוריים על האזור והתמצאות בשטח.",
    },
    {
      time: "10:00",
      icon: Sun,
      title: "מסלול הליכה בטבע",
      description: "הליכה בשביל ציורי דרך נחל ויער. זיהוי צמחייה מקומית ותצפיות על חיות בר.",
    },
    {
      time: "12:30",
      icon: Utensils,
      title: "הפסקת צהריים ופיקניק",
      description: "ארוחת צהריים משפחתית באווירה נעימה. זמן חופשי למנוחה ומשחקים.",
    },
    {
      time: "14:00",
      icon: Camera,
      title: "נקודת צילום מיוחדת",
      description: "הגעה לאתר ייחודי עם רקע מדהים. זמן לצילומים והנצחת החוויה.",
    },
    {
      time: "16:00",
      icon: Sunset,
      title: "סיכום וחזרה",
      description: "סיכום היום, שיתוף רגעים מרגשים וחזרה לנקודת המפגש.",
    },
  ];

  return (
    <section id="itinerary" className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            מסלול הטיול
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            יום מלא בחוויות, נופים ורגעים בלתי נשכחים
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute right-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-accent-500 hidden sm:block" />

            <div className="space-y-8 sm:space-y-12">
              {itinerary.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    ref={el => itemRefs.current[index] = el}
                    className={`relative transition-all duration-700 ${
                      visibleItems.includes(index)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex gap-6 sm:gap-8 items-start">
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 hover:scale-[1.02]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                          <span className="inline-block px-4 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-bold">
                            {item.time}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
