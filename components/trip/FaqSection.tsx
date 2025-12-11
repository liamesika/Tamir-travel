"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "האם הטיול מתאים למשפחות עם ילדים?",
      answer:
        "בהחלט! הטיול מותאם למשפחות ומתאים לילדים מגיל 6 ומעלה. המסלול מגוון ומעניין לכל הגילאים, והקצב מותאם לצרכים של המשפחות. יש הפסקות רבות והמדריך מקפיד על בטיחות מקסימלית.",
    },
    {
      question: "מה רמת הקושי של הטיול?",
      answer:
        "מדובר בטיול ברמת קושי קלה-בינונית. ההליכות קצרות ובשטח נוח, והטיול מתאים לכל מי שמסוגל ללכת מספר קילומטרים ברגל. אין צורך בכושר גופני מיוחד או ניסיון קודם בטיולים.",
    },
    {
      question: "מה קורה אם מזג האויר לא משתף פעולה?",
      answer:
        "אנחנו עוקבים אחרי תחזית מזג האוויר צמוד. במקרה של מזג אוויר קיצוני (סופה, גשמים כבדים וכו'), הטיול יידחה לתאריך חלופי בתיאום מראש. במקרה של גשם קל, הטיול יתקיים כרגיל עם התאמות במסלול.",
    },
    {
      question: "האם יש אפשרות לביטול?",
      answer:
        "ניתן לבטל השתתפות עד 7 ימים לפני מועד הטיול ולקבל החזר מלא של המקדמה. ביטול בין 7 ל-3 ימים לפני הטיול יזכה בהחזר של 50%. ביטול פחות מ-3 ימים לפני הטיול לא יזכה בהחזר.",
    },
    {
      question: "כמה משתתפים יהיו בקבוצה?",
      answer:
        "אנחנו שומרים על קבוצות קטנות ואינטימיות של 15-25 משתתפים. זה מאפשר למדריך לתת תשומת לב אישית לכל משתתף וליצור אווירה משפחתית ונעימה.",
    },
    {
      question: "איך מתבצע התשלום?",
      answer:
        "ההרשמה מתבצעת על ידי תשלום מקדמה של 300 ₪ לאדם באמצעות העברה בנקאית או אפליקציית תשלום. יתרת התשלום (המחיר המלא פחות המקדמה) תשולם עד שבוע לפני מועד הטיול. פרטי התשלום יישלחו לאחר ההרשמה.",
    },
    {
      question: "האם יש הנחות לקבוצות?",
      answer:
        "כן! קבוצה של 6 משתתפים ומעלה זכאית להנחה של 10%. קבוצה של 10 משתתפים ומעלה זכאית להנחה של 15%. ההנחה תינתן על המחיר הסופי לאחר קבלת רשימת כל המשתתפים.",
    },
    {
      question: "מה עושים במקרה של מצב רפואי מיוחד?",
      answer:
        "חשוב מאוד ליידע אותנו מראש על כל מצב רפואי רלוונטי (אלרגיות, תרופות, מגבלות תנועה וכו'). המדריך נושא עמו ערכת עזרה ראשונה מקיפה ומיומן בטיפול רפואי ראשוני. במקרה הצורך, נותאם את המסלול לצרכים המיוחדים.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            כל מה שרציתם לדעת על הטיול
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4 text-right hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg sm:text-xl font-bold text-gray-900 flex-1">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 sm:px-8 pb-5 sm:pb-6 pt-2">
                  <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg mb-4">
            לא מצאתם את התשובה שחיפשתם?
          </p>
          <a
            href="#contact"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            צרו איתנו קשר
          </a>
        </div>
      </div>
    </section>
  );
}
