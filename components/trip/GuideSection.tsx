"use client";

import { Heart, MapPin, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface GuideSectionProps {
  guideTitle?: string;
  guideContent?: string;
  guideImage?: string | null;
}

const defaultGuideTitle = "היי, אני תמיר ארמאני";
const defaultGuideContent = `למה יצרתי את הטיול הזה?

אחרי שנים על הקו תל אביב-לונדון, גיליתי שרוב הישראלים שמגיעים ללונדון מפספסים את הדבר הכי יפה שיש לה להציע — את הטבע שמקיף אותה.

פעם אחר פעם אני שומע חברים ומשפחות שחוזרים מלונדון עם תמונות מאותם מקומות, אותו ארמון, אותו ביג בן וקניות ברחוב הסואן והמלחיץ אוקספורד בלי לדעת שבנסיעה של שעתיים מחכה להם עולם אחר לגמרי.

כשסיפרתי לחברים על אזור הכפרים הם מאוד רצו לנסוע לבקר שם אך החליטו לוותר על כך מכמה סיבות:
1. זה מצריך לשכור רכב בלונדון שזה דבר יקר מאוד.
2. הבעיה העיקרית היא שזה מאוד מסוכן ומפחיד לנסוע בצד השמאלי של הכביש, ממש הפוך מישראל.
3. נסיעה של שעתיים כל כיוון לא מתאימה לטיול ליום בודד, אי אפשר להספיק כלום.

אז החלטתי "להרים את הכפפה" ולארגן את כל האופרציה עם הקשרים שיש לי באנגליה והכנתי עבורכם טיול שמשלב את כל הדברים שאנחנו הישראלים אוהבים.

טיול שנותן לכם טבע, נחלים זורמים, בתי אבן עתיקים, חיות משק. טיול שיאפשר לכם לנשום אוויר צח ולשכוח קצת מהאתגרים היומיומיים בארץ, ולטיול הזה שילבתי יום קניות מרוכז באאוטלט ענק עם כל המותגים שאנחנו אוהבים במחירים של עד 70% הנחה שיחסוך לכם גם כסף וגם זמן של קניות בלונדון.

הטיול הזה נולד מתוך הרצון לחשוף את אנגליה האחרת — זו שגרמה לי להתאהב בה.

כל טיול הוא עבורי הזדמנות לחלוק את המקומות האהובים עליי, ולתת לכם לחוות את אנגליה כמו שאני חווה אותה — אותנטית, ירוקה ומפתיעה.`;
const defaultGuideImage = "/images/trip/tamir.jpg";

export default function GuideSection({
  guideTitle = defaultGuideTitle,
  guideContent = defaultGuideContent,
  guideImage = defaultGuideImage,
}: GuideSectionProps) {
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
    <section
      ref={sectionRef}
      id="guide"
      className="py-8 sm:py-10 bg-gradient-to-b from-earth-50 to-sage-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-block text-nature-600 font-medium mb-1.5 text-xs">
            מי עומד מאחורי הטיול
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 mb-2">
            {guideTitle} 👋
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-start max-w-5xl mx-auto">
          {/* Image */}
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative px-4 py-4 lg:px-0 lg:py-0">
              <div className="aspect-[3/4] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl">
                <img
                  src={guideImage || defaultGuideImage}
                  alt="תמיר - המארגן"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements - hidden on mobile to prevent overflow */}
              <div className="hidden lg:block absolute -bottom-6 -right-6 w-32 h-32 bg-nature-200 rounded-3xl -z-10" />
              <div className="hidden lg:block absolute -top-6 -left-6 w-24 h-24 bg-heritage-200 rounded-3xl -z-10" />
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <div className="space-y-3 text-sage-700 leading-relaxed text-sm">
              <h3 className="font-bold text-sage-900 text-base">למה יצרתי את הטיול הזה?</h3>

              <p>
                אחרי שנים על הקו תל אביב-לונדון, גיליתי שרוב הישראלים שמגיעים ללונדון מפספסים את הדבר הכי יפה שיש לה להציע — את הטבע שמקיף אותה.
              </p>

              <p>
                פעם אחר פעם אני שומע חברים ומשפחות שחוזרים מלונדון עם תמונות מאותם מקומות, אותו ארמון, אותו ביג בן וקניות ברחוב הסואן והמלחיץ אוקספורד בלי לדעת שבנסיעה של שעתיים מחכה להם עולם אחר לגמרי.
              </p>

              <p>
                כשסיפרתי לחברים על אזור הכפרים הם מאוד רצו לנסוע לבקר שם אך החליטו לוותר על כך מכמה סיבות:
              </p>

              <ul className="list-disc list-inside space-y-1 text-sage-600">
                <li>זה מצריך לשכור רכב בלונדון שזה דבר יקר מאוד.</li>
                <li>הבעיה העיקרית היא שזה מאוד מסוכן ומפחיד לנסוע בצד השמאלי של הכביש, ממש הפוך מישראל.</li>
                <li>נסיעה של שעתיים כל כיוון לא מתאימה לטיול ליום בודד, אי אפשר להספיק כלום.</li>
              </ul>

              <p>
                אז החלטתי "להרים את הכפפה" ולארגן את כל האופרציה עם הקשרים שיש לי באנגליה והכנתי עבורכם טיול שמשלב את כל הדברים שאנחנו הישראלים אוהבים.
              </p>

              <p>
                טיול שנותן לכם טבע, נחלים זורמים, בתי אבן עתיקים, חיות משק. טיול שיאפשר לכם לנשום אוויר צח ולשכוח קצת מהאתגרים היומיומיים בארץ, ולטיול הזה שילבתי יום קניות מרוכז באאוטלט ענק עם כל המותגים שאנחנו אוהבים במחירים של עד 70% הנחה שיחסוך לכם גם כסף וגם זמן של קניות בלונדון.
              </p>

              <p className="font-medium text-sage-800">
                הטיול הזה נולד מתוך הרצון לחשוף את אנגליה האחרת — זו שגרמה לי להתאהב בה.
              </p>

              <p>
                כל טיול הוא עבורי הזדמנות לחלוק את המקומות האהובים עליי, ולתת לכם לחוות את אנגליה כמו שאני חווה אותה — אותנטית, ירוקה ומפתיעה.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <div className="w-9 h-9 rounded-lg bg-nature-100 flex items-center justify-center mx-auto mb-1.5">
                  <MapPin className="w-4 h-4 text-nature-600" />
                </div>
                <div className="text-lg font-bold text-sage-900">10+</div>
                <div className="text-xs text-sage-600">שנים באנגליה</div>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 rounded-lg bg-heritage-100 flex items-center justify-center mx-auto mb-1.5">
                  <Users className="w-4 h-4 text-heritage-600" />
                </div>
                <div className="text-lg font-bold text-sage-900">100+</div>
                <div className="text-xs text-sage-600">משתתפים מרוצים</div>
              </div>
              <div className="text-center">
                <div className="w-9 h-9 rounded-lg bg-earth-100 flex items-center justify-center mx-auto mb-1.5">
                  <Heart className="w-4 h-4 text-earth-600" />
                </div>
                <div className="text-lg font-bold text-sage-900">100%</div>
                <div className="text-xs text-sage-600">אהבה לטבע</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4">
              <a
                href="#faq"
                className="inline-flex items-center gap-2 bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-sm"
              >
                <span>יש שאלות? לשאלות נפוצות</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
