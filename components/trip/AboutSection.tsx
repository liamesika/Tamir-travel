"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf, Mountain, Castle, Sparkles, ChevronDown } from "lucide-react";

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const features = [
    {
      icon: Leaf,
      title: "טבע אנגלי אותנטי",
      description: "נופים ירוקים, גבעות מתגלגלות ויערות עתיקים",
    },
    {
      icon: Castle,
      title: "כפרים היסטוריים",
      description: "כפרי מורשת בריטיים עם בתי אבן ופאבים מקומיים",
    },
    {
      icon: Mountain,
      title: "נקודות תצפית נסתרות",
      description: "מקומות שרק מקומיים מכירים",
    },
    {
      icon: Sparkles,
      title: "חוויה אישית",
      description: "קבוצה קטנה וליווי אישי",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-8 sm:py-10 bg-gradient-to-b from-sage-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center max-w-4xl mx-auto mb-5 sm:mb-6 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-block text-nature-600 font-medium mb-1.5 text-xs">
            על החוויה
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 mb-2">
            לונדון האחרת —
            <span className="text-nature-600"> הצד שלא הכרתם</span>
          </h2>
          <p className="text-sm sm:text-base text-sage-600 leading-relaxed">
            כולם מכירים את לונדון של הביג בן והארמון.
            אבל מעבר לעיר מתחבא משהו אחר —
            <span className="font-medium text-sage-800"> אנגליה הכפרית והירוקה.</span>
          </p>
        </div>

        {/* Features Grid - Always visible */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-500 border border-sage-100 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-nature-100 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-nature-600" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-sage-900 mb-0.5">
                  {feature.title}
                </h4>
                <p className="text-sage-600 text-xs leading-snug">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Collapsible Story Section - Mobile */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-nature-600 font-medium text-sm"
          >
            <span>עוד עליי</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ${
              isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-2 space-y-3">
              <img
                src="/images/trip/gallery-1.jpg"
                alt="נופי טבע אנגליה"
                className="rounded-xl shadow-lg w-full aspect-video object-cover"
              />
              <div className="space-y-2 text-sage-700 leading-relaxed text-xs">
                <p>
                  אחרי שנים של מגורים באנגליה, גיליתי שרוב הישראלים שמגיעים ללונדון
                  מפספסים את הדבר הכי יפה שיש לה להציע — את הטבע שמקיף אותה.
                </p>
                <p className="font-medium text-sage-800">
                  הטיול הזה נולד מתוך הרצון לחשוף את לונדון האחרת — זו שגרמה לי להתאהב באנגליה.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:items-center">
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative">
              <img
                src="/images/trip/gallery-1.jpg"
                alt="נופי טבע אנגליה"
                className="rounded-xl shadow-xl w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h3 className="text-xl font-bold text-sage-900 mb-3">
              למה יצרתי את הטיול הזה?
            </h3>
            <div className="space-y-2 text-sage-700 leading-relaxed text-sm">
              <p>
                אחרי שנים של מגורים באנגליה, גיליתי שרוב הישראלים שמגיעים ללונדון
                מפספסים את הדבר הכי יפה שיש לה להציע — את הטבע שמקיף אותה.
              </p>
              <p>
                פעם אחר פעם שמעתי חברים ומשפחות שחוזרים מלונדון עם תמונות מאותם מקומות,
                בלי לדעת שבנסיעה של שעה-שעתיים מחכה להם עולם אחר לגמרי.
              </p>
              <p className="font-medium text-sage-800">
                הטיול הזה נולד מתוך הרצון לחשוף את לונדון האחרת — זו שגרמה לי להתאהב באנגליה.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
