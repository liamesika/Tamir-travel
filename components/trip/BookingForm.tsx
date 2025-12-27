"use client";

import { useState, useEffect } from 'react';
import { Calendar, Users, Mail, Phone, User, Loader2, AlertCircle } from 'lucide-react';

interface TripDate {
  id: string;
  date: string;
  capacity: number;
  reservedSpots: number;
  pricePerPerson: number;
  tripId?: string;
  tripName?: string;
}

interface TripInfo {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function BookingForm() {
  const [tripDates, setTripDates] = useState<TripDate[]>([]);
  const [trips, setTrips] = useState<TripInfo[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
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
            if (data.tripDates[0].tripId) {
              setSelectedTripId(data.tripDates[0].tripId);
            }
          }
        }
        if (data.trips) {
          setTrips(data.trips);
          if (data.trips.length > 0 && !selectedTripId) {
            setSelectedTripId(data.trips[0].id);
          }
        }
        setLoadingDates(false);
      })
      .catch(() => {
        setLoadingDates(false);
      });
  }, []);

  // Filter dates by selected trip when multiple trips exist
  const filteredDates = trips.length > 1 && selectedTripId
    ? tripDates.filter(d => d.tripId === selectedTripId)
    : tripDates;

  // Update selected date when trip changes
  useEffect(() => {
    if (trips.length > 1 && selectedTripId) {
      const datesForTrip = tripDates.filter(d => d.tripId === selectedTripId);
      if (datesForTrip.length > 0 && !datesForTrip.find(d => d.id === formData.tripDateId)) {
        setFormData(prev => ({ ...prev, tripDateId: datesForTrip[0].id }));
      }
    }
  }, [selectedTripId, tripDates, trips.length, formData.tripDateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'שגיאה ביצירת ההזמנה');
        setLoading(false);
      }
    } catch {
      alert('שגיאה ביצירת ההזמנה');
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
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
        <p className="text-sage-600 text-lg">טוען תאריכים זמינים...</p>
      </div>
    );
  }

  if (tripDates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Calendar className="w-14 h-14 mx-auto mb-4 text-sage-400" />
        <h3 className="text-xl font-bold text-sage-900 mb-2">
          אין תאריכים זמינים כרגע
        </h3>
        <p className="text-sage-600 text-lg">
          אנא צור קשר לפרטים נוספים
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-sage-900 mb-6">
        טופס הרשמה לטיול
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Trip Selector - only show if multiple trips */}
        {trips.length > 1 && (
          <div>
            <label className="block text-base font-semibold text-sage-700 mb-2">
              בחר טיול
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`p-4 rounded-lg border-2 text-right transition-all ${
                    selectedTripId === trip.id
                      ? 'border-heritage-500 bg-heritage-50'
                      : 'border-sage-200 hover:border-sage-300'
                  }`}
                >
                  <span className="font-semibold text-sage-900">{trip.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-base font-semibold text-sage-700 mb-2">
            <Calendar className="inline w-5 h-5 ml-1.5" />
            בחר תאריך טיול
          </label>
          <select
            value={formData.tripDateId}
            onChange={(e) => setFormData({ ...formData, tripDateId: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-lg"
            required
          >
            {filteredDates.map((date) => {
              const dateObj = new Date(date.date);
              const spots = date.capacity - date.reservedSpots;
              const isLastSpots = date.reservedSpots >= 10 && spots > 0;
              return (
                <option key={date.id} value={date.id} disabled={spots <= 0}>
                  {dateObj.toLocaleDateString('he-IL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {spots <= 0
                    ? ' - אזל המלאי'
                    : isLastSpots
                    ? ' - מקומות אחרונים!'
                    : ''}
                </option>
              );
            })}
          </select>
          {selectedDate && selectedDate.reservedSpots >= 10 && (selectedDate.capacity - selectedDate.reservedSpots) > 0 && (
            <div className="mt-3 flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="text-lg font-semibold">מקומות אחרונים!</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-base font-semibold text-sage-700 mb-2">
            <User className="inline w-5 h-5 ml-1.5" />
            שם מלא
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-lg"
            placeholder="שם פרטי ושם משפחה"
            required
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-sage-700 mb-2">
            <Mail className="inline w-5 h-5 ml-1.5" />
            דוא"ל
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-lg"
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-sage-700 mb-2">
            <Phone className="inline w-5 h-5 ml-1.5" />
            טלפון
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-lg"
            placeholder="050-1234567"
            required
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-sage-700 mb-2">
            <Users className="inline w-5 h-5 ml-1.5" />
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
            className="w-full px-4 py-3.5 border-2 border-sage-200 rounded-lg focus:border-nature-500 focus:outline-none transition text-lg"
            required
          />
          <p className="text-base text-sage-500 mt-2">
            מקסימום {Math.min(10, availableSpots)} משתתפים
          </p>
        </div>

        <div className="bg-gradient-to-br from-heritage-50 to-earth-50 rounded-lg p-5 border border-heritage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sage-700 font-semibold text-lg">מקדמה לתשלום:</span>
            <span className="text-3xl font-bold text-heritage-600">₪{depositAmount}</span>
          </div>
          <p className="text-base text-sage-600">
            300 ₪ למשתתף × {formData.participantsCount} משתתפים
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || availableSpots < formData.participantsCount}
          className="w-full bg-heritage-500 hover:bg-heritage-600 text-white font-bold text-xl py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

        <p className="text-base text-sage-500 text-center">
          לאחר לחיצה על "המשך לתשלום" תועבר לעמוד תשלום מאובטח
        </p>
      </form>
    </div>
  );
}
