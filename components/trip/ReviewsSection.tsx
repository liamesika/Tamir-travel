"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ReviewsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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

  const reviews = [
    {
      name: "שרה לוי",
      rating: 5,
      text: "טיול מדהים! יוסי המדריך היה מקצוען אמיתי, המון ידע והומור. הילדים נהנו בטירוף ואנחנו כבר מתכננים את הטיול הבא איתו.",
      date: "מרץ 2024",
    },
    {
      name: "דוד כהן",
      rating: 5,
      text: "חוויה משפחתית בלתי נשכחת. הארגון היה מושלם, המסלול מגוון ומעניין, והאוכל טעים. מומלץ בחום!",
      date: "פברואר 2024",
    },
    {
      name: "מיכל אברהם",
      rating: 5,
      text: "הגעתי עם ציפיות גבוהות אבל יוסי הצליח להפתיע! נופים מדהימים, סיפורים מרתקים והרבה צחוקים. בהחלט שווה כל שקל.",
      date: "ינואר 2024",
    },
    {
      name: "אבי מזרחי",
      rating: 5,
      text: "כבר השתתפתי ב-3 טיולים עם יוסי והוא מצליח להפתיע בכל פעם מחדש. מדריך עם לב גדול ותשומת לב לכל פרט.",
      date: "דצמבר 2023",
    },
    {
      name: "רונית שמיר",
      rating: 5,
      text: "ארגון מעולה, מדריך סבלני ומקצועי. הגענו כזוגות וחזרנו כחברים. אווירה מדהימה לאורך כל הטיול!",
      date: "נובמבר 2023",
    },
    {
      name: "יוסי פרץ",
      rating: 5,
      text: "טיול שמתאים למשפחות ולכל הגילאים. הקטנים והגדולים נהנו באותה מידה. תודה על החוויה המיוחדת!",
      date: "אוקטובר 2023",
    },
  ];

  return (
    <section ref={sectionRef} id="reviews" className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            מה המשתתפים הקודמים מספרים
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            ביקורות אמיתיות ממשתתפים מרוצים
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-6 sm:p-8 border border-gray-100 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6 text-base sm:text-lg">
                "{review.text}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="font-bold text-gray-900">{review.name}</div>
                  <div className="text-sm text-gray-500">{review.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-primary-50 px-6 py-3 rounded-full">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-gray-700 font-semibold">
              דירוג ממוצע 5.0 מתוך 5 | למעלה מ-200 ביקורות
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
