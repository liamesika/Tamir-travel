"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ShoppingBag, Tag, Percent, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const outletImages = [
  "/outlet_/first.JPG",
  "/outlet_/IMG_0487.JPG",
  "/outlet_/IMG_0488.JPG",
  "/outlet_/IMG_0489.JPG",
  "/outlet_/IMG_0491.JPG",
  "/outlet_/IMG_0492.JPG",
  "/outlet_/IMG_0493.JPG",
  "/outlet_/IMG_0494.JPG",
];

export default function ShoppingSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

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

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % outletImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + outletImages.length) % outletImages.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (isAutoPlaying && isVisible) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isVisible, nextSlide]);

  // Resume auto-play after 10 seconds of inactivity
  useEffect(() => {
    if (!isAutoPlaying) {
      const resumeTimer = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000);
      return () => clearTimeout(resumeTimer);
    }
  }, [isAutoPlaying, currentSlide]);

  const handleNavClick = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false);
    if (direction === 'prev') {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const benefits = [
    {
      icon: Tag,
      title: "מותגים בינלאומיים (אופנה, קוסמטיקה, נעליים, תיקים, ספורט)",
      description: "Nike, Adidas, New Balance, The North Face, Tommy Hilfiger, Burberry, Jimmy Choo, Clarins, Breitling, Lululemon ועוד מעל ל-100 מותגים נוספים",
    },
    {
      icon: Percent,
      title: "הנחות משמעותיות",
      description: "מחירים נמוכים משמעותית מחנויות בלונדון — חיסכון ענק של עד 40%",
    },
    {
      icon: Clock,
      title: "זמן מלא לקניות",
      description: "יום של שופינג מרוכז בקצב שלכם, בלי לחץ ובלי ריצות",
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
              אאוטלט ענק עם כל המותגים שאנחנו אוהבים —
              <span className="text-heritage-600"> במחירים שלא תמצאו בלונדון</span>
            </h2>
            <p className="text-sm text-sage-700 mb-4 leading-relaxed">
              יום מרוכז של שופינג באאוטלט ענק, אחד הנחשבים באנגליה, יש בו 150-160 חנויות, האאוטלט ממוקם באזור הכפרים שנבקר בהם. מותגים בינלאומיים במחירים שפשוט לא קיימים בחנויות של מרכז לונדון.
            </p>

            <div className="space-y-3">
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

          {/* Slideshow */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative pb-4 lg:pb-0">
              {/* Slideshow Container */}
              <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl aspect-[4/3]">
                {/* Images */}
                <div
                  className="flex transition-transform duration-500 ease-out h-full"
                  style={{ transform: `translateX(${currentSlide * 100}%)` }}
                >
                  {outletImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`אאוטלט ${index + 1}`}
                      className="w-full h-full object-cover flex-shrink-0"
                      style={{ marginRight: index === 0 ? 0 : undefined }}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => handleNavClick('next')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                  aria-label="תמונה הבאה"
                >
                  <ChevronRight className="w-5 h-5 text-sage-800" />
                </button>
                <button
                  onClick={() => handleNavClick('prev')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                  aria-label="תמונה קודמת"
                >
                  <ChevronLeft className="w-5 h-5 text-sage-800" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {outletImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`עבור לתמונה ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Decorative elements - hidden on mobile */}
              <div className="hidden lg:block absolute -bottom-6 -left-6 w-32 h-32 bg-heritage-200 rounded-3xl -z-10" />
              <div className="hidden lg:block absolute -top-6 -right-6 w-24 h-24 bg-nature-200 rounded-3xl -z-10" />

              {/* Floating Badge */}
              <div className="absolute -bottom-2 right-3 lg:-bottom-3 lg:right-6 bg-white rounded-lg lg:rounded-xl shadow-lg lg:shadow-xl p-2 lg:p-3 flex items-center gap-2">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-heritage-500 flex items-center justify-center">
                  <Percent className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <div className="text-base lg:text-lg font-bold text-sage-900">עד 40%</div>
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
