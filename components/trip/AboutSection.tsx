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
      className="py-12 sm:py-16 bg-gradient-to-b from-sage-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center max-w-4xl mx-auto mb-8 sm:mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-block text-nature-600 font-medium mb-2 text-sm">
            על החוויה
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-4">
            לונדון האחרת —
            <span className="text-nature-600"> הצד שלא הכרתם</span>
          </h2>
          <p className="text-base sm:text-lg text-sage-600 leading-relaxed">
            כולם מכירים את לונדון של הביג בן והארמון.
            אבל מעבר לעיר מתחבא משהו אחר —
            <span className="font-medium text-sage-800"> אנגליה הכפרית והירוקה.</span>
          </p>
        </div>

        {/* Features Grid - Always visible */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-500 border border-sage-100 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-nature-100 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-nature-600" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-sage-900 mb-1">
                  {feature.title}
                </h4>
                <p className="text-sage-600 text-xs sm:text-sm leading-relaxed">
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
            className="w-full flex items-center justify-center gap-2 py-3 text-nature-600 font-medium"
          >
            <span>עוד עליי</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ${
              isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-4 space-y-4">
              <img
                src="/images/trip/gallery-1.jpg"
                alt="נופי טבע אנגליה"
                className="rounded-2xl shadow-lg w-full aspect-video object-cover"
              />
              <div className="space-y-3 text-sage-700 leading-relaxed text-sm">
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
        <div className="hidden lg:grid lg:grid-cols-2 gap-10 items-center">
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative">
              <img
                src="/images/trip/gallery-1.jpg"
                alt="נופי טבע אנגליה"
                className="rounded-2xl shadow-xl w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h3 className="text-2xl font-bold text-sage-900 mb-4">
              למה יצרתי את הטיול הזה?
            </h3>
            <div className="space-y-3 text-sage-700 leading-relaxed">
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
