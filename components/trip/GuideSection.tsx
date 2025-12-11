"use client";

import { Award, MapPin, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function GuideSection() {
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

  return (
    <section ref={sectionRef} id="about" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className={`order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              מי המדריך שלכם
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                שמי יוסי כהן, ואני מדריך טיולים מוסמך עם למעלה מ-15 שנות ניסיון
                בהדרכת קבוצות בכל רחבי הארץ. התחלתי את דרכי כמדריך צעיר בתנועת
                הנוער, והמשכתי להתמחות בטיולי משפחות וחברים.
              </p>
              <p>
                המומחיות שלי היא בשילוב בין היסטוריה מרתקת, טבע עוצר נשימה
                וחוויות בלתי נשכחות. אני מאמין שכל טיול צריך להיות חוויה
                משמעותית שנשארת עם המשתתפים הרבה אחרי שהם חוזרים הביתה.
              </p>
              <p>
                ליוויתי מאות קבוצות, ואני גאה לומר שרבים מהמשתתפים הופכים
                ל"לקוחות קבועים" ומצטרפים לטיולים נוספים שלי.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4">
                <Award className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-600">שנות ניסיון</div>
              </div>
              <div className="text-center p-4">
                <Users className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">קבוצות מרוצות</div>
              </div>
              <div className="text-center p-4">
                <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-600">יעדים בארץ</div>
              </div>
            </div>
          </div>

          <div className={`order-1 lg:order-2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/trip/guide.jpg"
                  alt="המדריך"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-500 rounded-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary-200 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
