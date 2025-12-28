"use client";

import { X } from 'lucide-react';

export default function BookingCancelledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-12 h-12 text-red-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          התשלום בוטל
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          ההזמנה שלך לא הושלמה והתשלום לא עבר.
          <br />
          אם ברצונך לנסות שוב, תוכל לחזור ולבצע הזמנה חדשה.
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">רוצה עזרה?</h3>
          <p className="text-gray-700 mb-4">
            אם נתקלת בבעיה בתהליך התשלום או שיש לך שאלות,
            נשמח לעזור לך לסיים את ההזמנה.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/972502823333"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              שלח הודעת וואטסאפ
            </a>
            <a
              href="tel:0502823333"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              התקשר אלינו
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300"
          >
            חזרה לדף הבית
          </a>
          <a
            href="/#booking"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            נסה שוב
          </a>
        </div>
      </div>
    </div>
  );
}
