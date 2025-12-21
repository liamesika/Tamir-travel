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
      return <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{answer}</p>;
    }
    return (
      <div className="text-gray-700 leading-relaxed text-sm sm:text-base space-y-1.5">
        {answer.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  };

  return (
    <section id="faq" className="py-8 sm:py-12 bg-white">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
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
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 text-right hover:bg-sage-100/50 transition-colors focus:outline-none focus:ring-2 focus:ring-nature-500 focus:ring-inset"
                >
                  <span className="text-sm sm:text-base font-bold text-gray-900 flex-1 text-right">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-nature-600 flex-shrink-0 transition-transform duration-300 ${
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
                    <div className="px-4 sm:px-6 pb-3 sm:pb-4 pt-1">
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
