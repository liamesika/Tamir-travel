"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Tag, Percent, MapPin } from "lucide-react";

export default function ShoppingSection() {
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

  const benefits = [
    {
      icon: Tag,
      title: "מותגים בינלאומיים",
      description: "Nike, Adidas, Coach, Michael Kors, Tommy Hilfiger ועוד עשרות מותגים",
    },
    {
      icon: Percent,
      title: "הנחות משמעותיות",
      description: "מחירים נמוכים משמעותית מחנויות לונדון — חיסכון של עשרות אחוזים",
    },
    {
      icon: MapPin,
      title: "באמצע הטבע",
      description: "אאוטלטים גדולים באזורים כפריים יפהפיים — שופינג בנוף ירוק",
    },
    {
      icon: ShoppingBag,
      title: "זמן מלא לקניות",
      description: "יום שלם של שופינג בקצב שלכם, בלי לחץ ובלי ריצות",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="shopping"
      className="py-8 sm:py-10 bg-gradient-to-br from-heritage-50 via-earth-50 to-sage-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center max-w-5xl mx-auto">
          {/* Content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <span className="inline-block text-heritage-600 font-medium mb-1.5 text-xs">
              חוויית השופינג
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 mb-2">
              אאוטלטים בלב הטבע —
              <span className="text-heritage-600"> מחירים שלא תמצאו בלונדון</span>
            </h2>
            <p className="text-sm text-sage-700 mb-4 leading-relaxed">
              יום שלם של שופינג באאוטלטים הגדולים של אנגליה, הממוקמים באזורים כפריים
              מרהיבים. מותגים בינלאומיים במחירים שפשוט לא קיימים בחנויות של מרכז לונדון.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className={`flex gap-2.5 items-start transition-all duration-700 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: `${(index + 2) * 150}ms` }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-heritage-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-heritage-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sage-900 text-sm mb-0.5">
                        {benefit.title}
                      </h4>
                      <p className="text-sage-600 text-xs leading-snug">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative">
              <img
                src="/images/trip/gallery-5.jpg"
                alt="אאוטלט בטבע"
                className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-heritage-200 rounded-3xl -z-10" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-nature-200 rounded-3xl -z-10" />

              {/* Floating Badge */}
              <div className="absolute -bottom-3 right-6 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-heritage-500 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-sage-900">עד 70%</div>
                  <div className="text-xs text-sage-600">הנחה על מותגים</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
