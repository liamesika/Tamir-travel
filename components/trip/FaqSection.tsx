"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string | string[];
}

interface FaqSectionProps {
  faqItems?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
  {
    question: "מהיכן הטיול יוצא?",
    answer: [
      "הטיול יוצא בשעה 08:00 בבוקר מתחנת Tower Hill בלונדון, שם יאסוף אתכם המיניבוס שלנו.",
      "נקודה מדויקת תשלח אליכם בווטסאפ.",
      "החזרה תתבצע ביום שלמחרת בשעות הערב, גם כן לאותה תחנה.",
    ],
  },
  {
    question: "מה התשלום כולל?",
    answer: [
      "• מיניבוס צמוד למשך יומיים",
      "• מדריך מלווה לאורך כל הטיול",
      "• לינה של לילה אחד במלון",
      "• ארוחת בוקר במלון",
    ],
  },
  {
    question: "מהי רמת הקושי של הטיול?",
    answer: ["רמת קושי: קלה מאוד", "הליכה קלה במסלול נוח, ללא קטעים מאתגרים או מאמץ פיזי מיוחד ולכן הטיול מתאים לכל גיל."],
  },
  {
    question: "כמה משתתפים יהיו בקבוצה?",
    answer: "הטיול מתקיים בקבוצות קטנות של 15–30 משתתפים, במיניבוס מותאם, המאפשר חוויה אישית ונוחה גם בכבישים הצרים בכפרים.",
  },
  {
    question: "איך מתבצע התשלום?",
    answer: [
      "על מנת להבטיח את מקומכם בטיול, יש לשלם מקדמה בסך 300 ₪ לאדם.",
      "לאחר הגעה למינימום של 15 משתתפים, תישלח אליכם הודעה עם לינק לתשלום יתרת הסכום.",
    ],
  },
];

export default function FaqSection({ faqItems }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = faqItems && faqItems.length > 0 ? faqItems : defaultFaqs;

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const renderAnswer = (answer: string | string[]) => {
    if (typeof answer === "string") {
      return <p className="text-gray-700 leading-relaxed text-lg">{answer}</p>;
    }
    return (
      <div className="text-gray-700 leading-relaxed text-lg space-y-2">
        {answer.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  };

  return (
    <section id="faq" className="py-10 sm:py-14 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            שאלות ותשובות
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={index}
                className="bg-sage-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-sage-100"
              >
                <button
                  id={buttonId}
                  onClick={() => toggleFaq(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleFaq(index);
                    }
                  }}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-3 text-right hover:bg-sage-100/50 transition-colors focus:outline-none focus:ring-2 focus:ring-nature-500 focus:ring-inset"
                >
                  <span className="text-lg sm:text-xl font-bold text-gray-900 flex-1 text-right">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 sm:w-7 sm:h-7 text-nature-600 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-7 pb-4 sm:pb-5 pt-1">
                      {renderAnswer(faq.answer)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
