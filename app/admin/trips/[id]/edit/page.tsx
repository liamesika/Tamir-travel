"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Save, Loader2, ArrowRight, Plus, Trash2, Calendar, Users } from 'lucide-react';

interface TripDate {
  id: string;
  date: string;
  capacity: number;
  reservedSpots: number;
  pricePerPerson: number;
  depositAmount: number;
}

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [tripDates, setTripDates] = useState<TripDate[]>([]);
  const [newDate, setNewDate] = useState({
    date: '',
    capacity: 25,
    pricePerPerson: 500,
    depositAmount: 300,
  });

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/admin/trips/${tripId}`);
      const data = await response.json();
      if (response.ok) {
        setTrip(data.trip);
        setTripDates(data.trip.tripDates || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip:', error);
      setLoading(false);
    }
  };

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trip),
      });

      if (response.ok) {
        alert('הטיול עודכן בהצלחה!');
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בעדכון טיול');
      }
    } catch (error) {
      alert('שגיאה בעדכון טיול');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDate = async () => {
    if (!newDate.date) {
      alert('אנא בחר תאריך');
      return;
    }

    try {
      const response = await fetch('/api/trip-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDate,
          tripId,
        }),
      });

      if (response.ok) {
        alert('התאריך נוסף בהצלחה!');
        fetchTrip(); // Refresh the trip data
        setNewDate({
          date: '',
          capacity: 25,
          pricePerPerson: 500,
          depositAmount: 300,
        });
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בהוספת תאריך');
      }
    } catch (error) {
      alert('שגיאה בהוספת תאריך');
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תאריך זה?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trip-dates/${dateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('התאריך נמחק בהצלחה!');
        fetchTrip(); // Refresh the trip data
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה במחיקת תאריך');
      }
    } catch (error) {
      alert('שגיאה במחיקת תאריך');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען טיול...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">טיול לא נמצא</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/trips')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                ערוך טיול: {trip.name}
              </h1>
              <p className="text-gray-600">עדכן פרטים ונהל תאריכי טיולים</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <form onSubmit={handleSaveBasicInfo} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">פרטים בסיסיים</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    שם הטיול
                  </label>
                  <input
                    type="text"
                    value={trip.name}
                    onChange={(e) => setTrip({ ...trip, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    סלאג (URL)
                  </label>
                  <input
                    type="text"
                    value={trip.slug}
                    onChange={(e) => setTrip({ ...trip, slug: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    כותרת ראשית
                  </label>
                  <input
                    type="text"
                    value={trip.heroTitle}
                    onChange={(e) => setTrip({ ...trip, heroTitle: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    תת-כותרת
                  </label>
                  <textarea
                    value={trip.heroSubtitle}
                    onChange={(e) => setTrip({ ...trip, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={trip.isActive}
                    onChange={(e) => setTrip({ ...trip, isActive: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    פעיל (יוצג באתר)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline ml-2" />
                    שומר...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 inline ml-2" />
                    שמור שינויים
                  </>
                )}
              </button>
            </form>

            {/* Trip Dates Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ניהול תאריכים</h2>

              {/* Add New Date */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  הוסף תאריך חדש
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      תאריך
                    </label>
                    <input
                      type="date"
                      value={newDate.date}
                      onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        מקומות
                      </label>
                      <input
                        type="number"
                        value={newDate.capacity}
                        onChange={(e) => setNewDate({ ...newDate, capacity: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition text-sm"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        מחיר
                      </label>
                      <input
                        type="number"
                        value={newDate.pricePerPerson}
                        onChange={(e) => setNewDate({ ...newDate, pricePerPerson: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition text-sm"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        מקדמה
                      </label>
                      <input
                        type="number"
                        value={newDate.depositAmount}
                        onChange={(e) => setNewDate({ ...newDate, depositAmount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition text-sm"
                        min="0"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDate}
                    className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף תאריך
                  </button>
                </div>
              </div>

              {/* Existing Dates */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">תאריכים קיימים ({tripDates.length})</h3>

                {tripDates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>אין תאריכים זמינים</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tripDates
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((date) => {
                        const dateObj = new Date(date.date);
                        const available = date.capacity - date.reservedSpots;
                        return (
                          <div
                            key={date.id}
                            className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-primary-300 transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-600" />
                                <span className="font-bold text-gray-900">
                                  {dateObj.toLocaleDateString('he-IL', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteDate(date.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="מחק תאריך"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{available}/{date.capacity} מקומות</span>
                              </div>
                              <div className="text-gray-600">
                                מחיר: ₪{date.pricePerPerson}
                              </div>
                              <div className="text-gray-600">
                                מקדמה: ₪{date.depositAmount}
                              </div>
                              <div className="text-gray-600">
                                הוזמנו: {date.reservedSpots}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
