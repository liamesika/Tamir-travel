"use client";

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Globe, Calendar, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

interface Trip {
  id: string;
  name: string;
  slug: string;
  heroTitle: string;
  isActive: boolean;
  createdAt: string;
  tripDates: any[];
  stats?: {
    totalBookings: number;
    totalParticipants: number;
    totalCapacity: number;
    tripDatesCount: number;
  };
}

export default function TripsManagementPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/admin/trips');
      const data = await response.json();
      if (data.trips) {
        setTrips(data.trips);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleToggleActive = async (tripId: string, currentlyActive: boolean) => {
    // If activating and there are other active trips, confirm switching
    const otherActiveTrips = trips.filter(t => t.id !== tripId && t.isActive);

    if (!currentlyActive && otherActiveTrips.length > 0) {
      const confirm = window.confirm(
        `שים לב: יש כרגע ${otherActiveTrips.length} טיול(ים) פעיל(ים) אחר(ים).\n\nהאם להפעיל את הטיול הזה בנוסף?\nלחץ "אישור" להפעלה, "ביטול" לביטול.`
      );
      if (!confirm) return;
    }

    try {
      const response = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentlyActive }),
      });

      if (response.ok) {
        fetchTrips();
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בעדכון סטטוס');
      }
    } catch {
      alert('שגיאה בעדכון סטטוס');
    }
  };

  const handleSetAsOnlyActive = async (tripId: string) => {
    if (!confirm('האם להפוך את הטיול הזה לטיול היחיד הפעיל?\nכל שאר הטיולים יכובו.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/trips/${tripId}/set-active`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchTrips();
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בעדכון');
      }
    } catch {
      alert('שגיאה בעדכון');
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הטיול?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTrips();
      } else {
        alert('שגיאה במחיקת טיול');
      }
    } catch {
      alert('שגיאה במחיקת טיול');
    }
  };

  const activeTripsCount = trips.filter(t => t.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען טיולים...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                ניהול טיולים
              </h1>
              <p className="text-gray-600">צור וערוך טיולים שונים במערכת</p>
            </div>
            <button
              onClick={() => router.push('/admin/trips/new')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              טיול חדש
            </button>
          </div>

          {/* Status Summary */}
          <div className="mb-6 p-4 bg-white rounded-xl shadow">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">
                  {activeTripsCount === 0 ? (
                    <span className="text-red-600">אין טיולים פעילים - האתר מציג תוכן ברירת מחדל</span>
                  ) : activeTripsCount === 1 ? (
                    <span className="text-green-600">טיול אחד פעיל באתר</span>
                  ) : (
                    <span className="text-blue-600">{activeTripsCount} טיולים פעילים באתר (מולטי-טיול)</span>
                  )}
                </span>
              </div>
            </div>
            {activeTripsCount === 0 && trips.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>יש להפעיל לפחות טיול אחד כדי שיוצג באתר</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {trips.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500 mb-4">אין טיולים במערכת</p>
                <button
                  onClick={() => router.push('/admin/trips/new')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  צור טיול ראשון
                </button>
              </div>
            ) : (
              trips.map((trip) => (
                <div
                  key={trip.id}
                  className={`bg-white rounded-xl shadow hover:shadow-lg transition p-4 sm:p-6 ${
                    trip.isActive ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {trip.name}
                        </h2>
                        {trip.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-800">
                            <Globe className="w-3.5 h-3.5" />
                            מוצג באתר
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-gray-100 text-gray-600">
                            <EyeOff className="w-3.5 h-3.5" />
                            מוסתר
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">{trip.heroTitle}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{trip.stats?.tripDatesCount || trip.tripDates?.length || 0} תאריכים</span>
                        </div>
                        {trip.stats && (
                          <div>
                            <span className="font-medium">{trip.stats.totalParticipants}</span>
                            <span className="text-gray-400"> / {trip.stats.totalCapacity}</span>
                            <span className="mr-1">משתתפים</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleToggleActive(trip.id, trip.isActive)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                          trip.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {trip.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            הסתר מהאתר
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            הצג באתר
                          </>
                        )}
                      </button>

                      {trips.length > 1 && !trip.isActive && (
                        <button
                          onClick={() => handleSetAsOnlyActive(trip.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
                        >
                          <Globe className="w-4 h-4" />
                          הפוך ליחיד פעיל
                        </button>
                      )}

                      <button
                        onClick={() => router.push(`/admin/trips/${trip.id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        ערוך
                      </button>

                      <button
                        onClick={() => handleDelete(trip.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        מחק
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
