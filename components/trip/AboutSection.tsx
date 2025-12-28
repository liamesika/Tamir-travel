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
          className={`text-center max-w-4xl mx-auto mb-6 sm:mb-8 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="inline-block text-nature-600 font-semibold mb-2 text-base">
            על החוויה
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-3">
            החיים מחוץ ללונדון —
            <span className="text-nature-600"> הצד שלא הכרתם</span>
          </h2>
          <p className="text-lg sm:text-xl text-sage-600 leading-relaxed">
            כולם מכירים בלונדון את הביג בן, אוקספורד הסואן והארמון. אבל מחוץ לעיר מתחבא
            משהו אחר —
            <span className="font-medium text-sage-800"> אנגליה הכפרית, העתיקה והירוקה.</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-500 border border-sage-100 text-center ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-nature-100 flex items-center justify-center mb-3 mx-auto">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-nature-600" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-sage-900 mb-1">
                  {feature.title}
                </h4>
                <p className="text-sage-600 text-base leading-relaxed">
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
