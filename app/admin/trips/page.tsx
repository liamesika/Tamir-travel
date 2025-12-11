"use client";

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  const handleToggleActive = async (tripId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchTrips();
      } else {
        alert('שגיאה בעדכון סטטוס');
      }
    } catch (error) {
      alert('שגיאה בעדכון סטטוס');
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
    } catch (error) {
      alert('שגיאה במחיקת טיול');
    }
  };

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
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 sm:p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {trip.name}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                          trip.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {trip.isActive ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">{trip.heroTitle}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className="font-semibold">סלאג:</span> /{trip.slug}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className="font-semibold">תאריכים:</span>{' '}
                      {trip.tripDates?.length || 0} תאריכים זמינים
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleToggleActive(trip.id, trip.isActive)}
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition ${
                        trip.isActive
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {trip.isActive ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                      <span className="text-xs font-semibold">
                        {trip.isActive ? 'השבת' : 'הפעל'}
                      </span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/trips/${trip.id}/edit`)}
                      className="flex flex-col items-center justify-center gap-1 p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    >
                      <Edit className="w-5 h-5" />
                      <span className="text-xs font-semibold">ערוך</span>
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="flex flex-col items-center justify-center gap-1 p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="text-xs font-semibold">מחק</span>
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
