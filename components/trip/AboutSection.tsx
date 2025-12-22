"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf, Home, ShoppingBag, Heart } from "lucide-react";

export default function AboutSection() {
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

  const features = [
    {
      icon: Leaf,
      title: "טבע אנגלי אותנטי",
      description: "נופים ירוקים, נחלים וחיות משק חופשיות",
    },
    {
      icon: Home,
      title: "כפרים ציוריים",
      description: "כפרים עתיקים עם בתי אבן שהזמן פסק מלכת",
    },
    {
      icon: ShoppingBag,
      title: "חנויות ומסעדות מקומיות",
      description: "עסקים מיוחדים המציעים תוצרת מקומית כפרית",
    },
    {
      icon: Heart,
      title: "חוויה אישית",
      description: "להתרגש, לחוות, ליהנות",
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
            החיים מחוץ ללונדון —
            <span className="text-nature-600"> הצד שלא הכרתם</span>
          </h2>
          <p className="text-sm sm:text-base text-sage-600 leading-relaxed">
            כולם מכירים בלונדון את הביג בן, אוקספורד הסואן והארמון. אבל מחוץ לעיר מתחבא
            משהו אחר —
            <span className="font-medium text-sage-800"> אנגליה הכפרית, העתיקה והירוקה.</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
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
      </div>
    </section>
  );
}
