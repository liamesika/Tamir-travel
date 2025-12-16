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
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary-600" />
        <p className="text-sage-600 text-sm">טוען תאריכים זמינים...</p>
      </div>
    );
  }

  if (tripDates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-sage-400" />
        <h3 className="text-lg font-bold text-sage-900 mb-1.5">
          אין תאריכים זמינים כרגע
        </h3>
        <p className="text-sage-600 text-sm">
          אנא צור קשר לפרטים נוספים
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-5 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-sage-900 mb-4">
        טופס הרשמה לטיול
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-sage-700 mb-1.5">
            <Calendar className="inline w-3.5 h-3.5 ml-1" />
            בחר תאריך טיול
          </label>
          <select
            value={formData.tripDateId}
            onChange={(e) => setFormData({ ...formData, tripDateId: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-sm"
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
          <label className="block text-sm font-semibold text-sage-700 mb-1.5">
            <User className="inline w-3.5 h-3.5 ml-1" />
            שם מלא
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-sm"
            placeholder="שם פרטי ושם משפחה"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-sage-700 mb-1.5">
            <Mail className="inline w-3.5 h-3.5 ml-1" />
            דוא"ל
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-sm"
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-sage-700 mb-1.5">
            <Phone className="inline w-3.5 h-3.5 ml-1" />
            טלפון
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-sm"
            placeholder="050-1234567"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-sage-700 mb-1.5">
            <Users className="inline w-3.5 h-3.5 ml-1" />
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
            className="w-full px-3 py-2.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-sm"
            required
          />
          <p className="text-xs text-sage-500 mt-1">
            מקסימום {Math.min(10, availableSpots)} משתתפים
          </p>
        </div>

        <div className="bg-gradient-to-br from-heritage-50 to-earth-50 rounded-lg p-4 border border-heritage-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sage-700 font-semibold text-sm">מקדמה לתשלום:</span>
            <span className="text-2xl font-bold text-heritage-600">₪{depositAmount}</span>
          </div>
          <p className="text-xs text-sage-600">
            300 ₪ למשתתף × {formData.participantsCount} משתתפים
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || availableSpots < formData.participantsCount}
          className="w-full bg-heritage-500 hover:bg-heritage-600 text-white font-bold text-base py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
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
          className="w-full bg-nature-500 hover:bg-nature-600 text-white font-semibold text-sm py-2.5 rounded-full transition-all duration-300 hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              שומר...
            </>
          ) : (
            <>שמור הזמנה ללא תשלום (בדיקה)</>
          )}
        </button>

        <p className="text-xs text-sage-500 text-center">
          לאחר לחיצה על "המשך לתשלום" תועבר לעמוד תשלום מאובטח
        </p>
      </form>
    </div>
  );
}
