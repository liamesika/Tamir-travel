"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Calendar, Users, Mail, Phone, CreditCard } from 'lucide-react';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.booking) {
            setBooking(data.booking);
          } else {
            setError('ההזמנה לא נמצאה');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('שגיאה בטעינת פרטי ההזמנה');
          setLoading(false);
        });
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען פרטי הזמנה...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">שגיאה</h1>
          <p className="text-gray-600">{error}</p>
          <a
            href="/"
            className="mt-6 inline-block bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition"
          >
            חזרה לדף הבית
          </a>
        </div>
      </div>
    );
  }

  if (booking.status !== 'PAID') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">בהמתנה לתשלום</h1>
          <p className="text-gray-600">ההזמנה שלך ממתינה לאישור התשלום</p>
          <p className="text-sm text-gray-500 mt-2">זה יכול לקחת מספר דקות</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition"
          >
            רענן את הדף
          </button>
        </div>
      </div>
    );
  }

  const tripDate = new Date(booking.tripDate.date);
  const formattedDate = tripDate.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">ההזמנה אושרה בהצלחה!</h1>
            <p className="text-green-100 text-lg">התשלום עבר בהצלחה ומקומכם בטיול מובטח</p>
          </div>

          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">פרטי ההזמנה</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">תאריך הטיול</div>
                    <div className="text-lg font-semibold text-gray-900">{formattedDate}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Users className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">מספר משתתפים</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {booking.participantsCount} {booking.participantsCount === 1 ? 'משתתף' : 'משתתפים'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">דוא"ל</div>
                    <div className="text-lg font-semibold text-gray-900">{booking.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">טלפון</div>
                    <div className="text-lg font-semibold text-gray-900" dir="ltr">{booking.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <CreditCard className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm text-green-700">מקדמה ששולמה</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₪{(booking.depositAmount / 100).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">מה הלאה?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>קיבלת אישור מייל עם כל הפרטים</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>יתרת התשלום תשולם עד שבוע לפני הטיול</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>נצור איתך קשר בהודעת ווטסאפ לפני הטיול</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <a
                href="/"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                חזרה לדף הבית
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">מספר הזמנה: {booking.id}</p>
        </div>
      </div>
    </div>
  );
}
