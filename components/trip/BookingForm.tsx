"use client";

import { useState, useEffect } from 'react';
import { Calendar, Users, Mail, Phone, User, Loader2 } from 'lucide-react';

export default function BookingForm() {
  const [tripDates, setTripDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(true);
  const [formData, setFormData] = useState({
    tripDateId: '',
    fullName: '',
    email: '',
    phone: '',
    participantsCount: 1,
  });

  useEffect(() => {
    fetch('/api/trip-dates')
      .then((res) => res.json())
      .then((data) => {
        if (data.tripDates) {
          setTripDates(data.tripDates);
          if (data.tripDates.length > 0) {
            setFormData((prev) => ({ ...prev, tripDateId: data.tripDates[0].id }));
          }
        }
        setLoadingDates(false);
      })
      .catch((err) => {
        console.error('Error fetching trip dates:', err);
        setLoadingDates(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'שגיאה ביצירת ההזמנה');
        setLoading(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('שגיאה ביצירת ההזמנה');
      setLoading(false);
    }
  };

  const handleTestBooking = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/bookings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ הזמנה נשמרה בהצלחה!\n\nפרטי ההזמנה:\nשם: ${data.booking.fullName}\nמזהה: ${data.booking.id}\nמשתתפים: ${data.booking.participantsCount}\nסטטוס: ממתין לתשלום`);
        setLoading(false);
      } else {
        alert(data.error || 'שגיאה בשמירת ההזמנה');
        setLoading(false);
      }
    } catch (error) {
      console.error('Test booking error:', error);
      alert('שגיאה בשמירת ההזמנה');
      setLoading(false);
    }
  };

  const selectedDate = tripDates.find((d) => d.id === formData.tripDateId);
  const availableSpots = selectedDate
    ? selectedDate.capacity - selectedDate.reservedSpots
    : 0;
  const depositAmount = formData.participantsCount * 300;

  if (loadingDates) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
        <p className="text-gray-600">טוען תאריכים זמינים...</p>
      </div>
    );
  }

  if (tripDates.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          אין תאריכים זמינים כרגע
        </h3>
        <p className="text-gray-600">
          אנא צור קשר לפרטים נוספים
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        טופס הרשמה לטיול
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 ml-1" />
            בחר תאריך טיול
          </label>
          <select
            value={formData.tripDateId}
            onChange={(e) => setFormData({ ...formData, tripDateId: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg"
            required
          >
            {tripDates.map((date) => {
              const dateObj = new Date(date.date);
              const availableSpots = date.capacity - date.reservedSpots;
              return (
                <option key={date.id} value={date.id} disabled={availableSpots <= 0}>
                  {dateObj.toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' - '}
                  {availableSpots > 0
                    ? `נותרו ${availableSpots} מקומות`
                    : 'אזל המלאי'}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="inline w-4 h-4 ml-1" />
            שם מלא
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg"
            placeholder="שם פרטי ושם משפחה"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 ml-1" />
            דוא"ל
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg"
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 ml-1" />
            טלפון
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg"
            placeholder="050-1234567"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Users className="inline w-4 h-4 ml-1" />
            מספר משתתפים
          </label>
          <input
            type="number"
            min="1"
            max={Math.min(10, availableSpots)}
            value={formData.participantsCount}
            onChange={(e) =>
              setFormData({ ...formData, participantsCount: parseInt(e.target.value) || 1 })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            מקסימום {Math.min(10, availableSpots)} משתתפים
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-orange-50 rounded-xl p-6 border-2 border-accent-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">מקדמה לתשלום:</span>
            <span className="text-3xl font-bold text-accent-700">₪{depositAmount}</span>
          </div>
          <p className="text-sm text-gray-600">
            300 ₪ למשתתף × {formData.participantsCount} משתתפים
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || availableSpots < formData.participantsCount}
          className="w-full bg-gradient-to-r from-accent-500 to-orange-500 hover:from-accent-600 hover:to-orange-600 text-white font-bold text-xl py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              מעביר לתשלום...
            </>
          ) : (
            <>המשך לתשלום</>
          )}
        </button>

        <button
          type="button"
          onClick={handleTestBooking}
          disabled={loading || availableSpots < formData.participantsCount}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-lg py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              שומר...
            </>
          ) : (
            <>💾 שמור הזמנה ללא תשלום (בדיקה)</>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          לאחר לחיצה על "המשך לתשלום" תועבר לעמוד תשלום מאובטח
        </p>
      </form>
    </div>
  );
}
