"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Calendar, Users, CreditCard, CheckCircle } from 'lucide-react';

interface BookingData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  remainingStatus: string;
  tripDate: {
    date: string;
    trip: {
      name: string;
    } | null;
  };
}

export default function FullPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [token]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/payment/verify/${token}`);
      const data = await response.json();

      if (response.ok) {
        setBooking(data.booking);
      } else {
        setError(data.error || 'לינק תשלום לא תקין');
      }
      setLoading(false);
    } catch (err) {
      setError('שגיאה בטעינת פרטי ההזמנה');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/payment/remaining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'שגיאה ביצירת קישור תשלום');
        setProcessing(false);
      }
    } catch (err) {
      setError('שגיאה ביצירת קישור תשלום');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">טוען פרטי הזמנה...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">שגיאה</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  if (booking.remainingStatus === 'PAID') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">התשלום כבר בוצע</h1>
          <p className="text-gray-600 mb-6">
            ההזמנה שלך שולמה במלואה. תודה!
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  const tripDate = new Date(booking.tripDate.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            השלמת תשלום
          </h1>
          <p className="text-gray-600">סיום תשלום לטיול</p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">פרטי ההזמנה</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">שם מלא:</span>
              <span className="font-semibold text-gray-900">{booking.fullName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">אימייל:</span>
              <span className="font-semibold text-gray-900">{booking.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">טלפון:</span>
              <span className="font-semibold text-gray-900" dir="ltr">{booking.phone}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                תאריך טיול:
              </span>
              <span className="font-semibold text-gray-900">
                {tripDate.toLocaleDateString('he-IL')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                מספר משתתפים:
              </span>
              <span className="font-semibold text-gray-900">{booking.participantsCount}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">סיכום תשלום</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">מחיר כולל:</span>
              <span className="text-gray-900 font-semibold">
                ₪{(booking.totalPrice / 100).toFixed(0)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-green-700">מקדמה ששולמה:</span>
              <span className="text-green-700 font-semibold">
                -₪{(booking.depositAmount / 100).toFixed(0)}
              </span>
            </div>

            <div className="border-t-2 border-green-300 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">יתרה לתשלום:</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₪{(booking.remainingAmount / 100).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              מעביר לתשלום...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              המשך לתשלום
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          התשלום מאובטח באמצעות Stripe
        </p>
      </div>
    </div>
  );
}
