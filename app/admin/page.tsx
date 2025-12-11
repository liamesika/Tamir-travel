"use client";

import { useEffect, useState } from 'react';
import { Calendar, Users, Mail, Phone, CheckCircle, Clock, XCircle, Filter, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

type BookingStatus = 'ALL' | 'PAID' | 'PENDING' | 'CANCELLED';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus>('ALL');
  const [selectedTripDate, setSelectedTripDate] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => {
        if (data.bookings) {
          setBookings(data.bookings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    // Filter by payment status
    if (filter !== 'ALL' && booking.depositStatus !== filter) {
      return false;
    }

    // Filter by trip date
    if (selectedTripDate !== 'ALL' && booking.tripDateId !== selectedTripDate) {
      return false;
    }

    return true;
  });

  // Get unique trip dates for the filter
  const uniqueTripDates = Array.from(
    new Map(
      bookings.map((b) => [
        b.tripDateId,
        {
          id: b.tripDateId,
          date: b.tripDate.date,
          bookingsCount: bookings.filter((booking) => booking.tripDateId === b.tripDateId).length,
        },
      ])
    ).values()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            שולם
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            ממתין
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            בוטל
          </span>
        );
      default:
        return status;
    }
  };

  const handleSendRemainingPayment = async (bookingId: string) => {
    try {
      const response = await fetch('/api/payment/remaining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('קישור תשלום נשלח בהצלחה!');
      } else {
        alert(data.error || 'שגיאה בשליחת קישור תשלום');
      }
    } catch (error) {
      alert('שגיאה בשליחת קישור תשלום');
    }
  };

  const handleMarkRemainingPaid = async (bookingId: string) => {
    if (!confirm('האם אתה בטוח שברצונך לסמן את היתרה כשולמה?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}/remaining`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PAID' }),
      });

      if (response.ok) {
        alert('היתרה סומנה כשולמה!');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בעדכון סטטוס');
      }
    } catch (error) {
      alert('שגיאה בעדכון סטטוס');
    }
  };

  const stats = {
    total: bookings.length,
    paid: bookings.filter((b) => b.depositStatus === 'PAID').length,
    pending: bookings.filter((b) => b.depositStatus === 'PENDING').length,
    cancelled: bookings.filter((b) => b.depositStatus === 'CANCELLED').length,
    totalRevenue: bookings
      .filter((b) => b.depositStatus === 'PAID')
      .reduce((sum, b) => sum + b.depositAmount, 0) / 100,
    totalParticipants: bookings.reduce((sum, b) => sum + b.participantsCount, 0),
    averageBookingSize: bookings.length > 0
      ? (bookings.reduce((sum, b) => sum + b.participantsCount, 0) / bookings.length).toFixed(1)
      : 0,
    remainingPayments: bookings
      .filter((b) => b.remainingStatus === 'PENDING' && b.depositStatus === 'PAID')
      .reduce((sum, b) => sum + b.remainingAmount, 0) / 100,
    fullyPaidBookings: bookings.filter((b) => b.depositStatus === 'PAID' && b.remainingStatus === 'PAID').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען הזמנות...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            ניהול הזמנות
          </h1>
          <p className="text-gray-600">רשימת כל ההזמנות והתשלומים במערכת</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-blue-700 font-semibold">סה"כ הזמנות</div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
            <div className="text-4xl font-bold text-blue-900">{stats.total}</div>
            <div className="text-xs text-blue-600 mt-1">{stats.totalParticipants} משתתפים</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-green-700 font-semibold">מקדמות ששולמו</div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
            </div>
            <div className="text-4xl font-bold text-green-900">{stats.paid}</div>
            <div className="text-xs text-green-600 mt-1">{stats.fullyPaidBookings} שולמו במלואן</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl shadow-lg p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-yellow-700 font-semibold">ממתינים לתשלום</div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
            <div className="text-4xl font-bold text-yellow-900">{stats.pending}</div>
            <div className="text-xs text-yellow-600 mt-1">מקדמות בהמתנה</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-purple-700 font-semibold">סה"כ הכנסות</div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-purple-900">₪{stats.totalRevenue.toFixed(0)}</div>
            <div className="text-xs text-purple-600 mt-1">₪{stats.remainingPayments.toFixed(0)} יתרות בהמתנה</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Status Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">התפלגות סטטוס תשלומים</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">שולמו במלואן</span>
                  <span className="text-sm font-bold text-green-600">{stats.fullyPaidBookings} ({stats.total > 0 ? ((stats.fullyPaidBookings / stats.total) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.fullyPaidBookings / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">מקדמה בלבד</span>
                  <span className="text-sm font-bold text-blue-600">{stats.paid - stats.fullyPaidBookings} ({stats.total > 0 ? (((stats.paid - stats.fullyPaidBookings) / stats.total) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? ((stats.paid - stats.fullyPaidBookings) / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">ממתינים לתשלום</span>
                  <span className="text-sm font-bold text-yellow-600">{stats.pending} ({stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {stats.cancelled > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">בוטלו</span>
                    <span className="text-sm font-bold text-red-600">{stats.cancelled} ({stats.total > 0 ? ((stats.cancelled / stats.total) * 100).toFixed(1) : 0}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Breakdown Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">פירוט הכנסות</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <div className="text-sm text-green-700 font-semibold mb-1">מקדמות שנתקבלו</div>
                <div className="text-3xl font-bold text-green-800">₪{stats.totalRevenue.toFixed(0)}</div>
                <div className="text-xs text-green-600 mt-1">מ-{stats.paid} הזמנות</div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                <div className="text-sm text-orange-700 font-semibold mb-1">יתרות בהמתנה</div>
                <div className="text-3xl font-bold text-orange-800">₪{stats.remainingPayments.toFixed(0)}</div>
                <div className="text-xs text-orange-600 mt-1">מ-{bookings.filter((b) => b.remainingStatus === 'PENDING' && b.depositStatus === 'PAID').length} הזמנות</div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="text-sm text-purple-700 font-semibold mb-1">צפי סה"כ</div>
                <div className="text-3xl font-bold text-purple-800">₪{(stats.totalRevenue + stats.remainingPayments).toFixed(0)}</div>
                <div className="text-xs text-purple-600 mt-1">כולל יתרות עתידיות</div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">גודל הזמנה ממוצע:</span>
                  <span className="font-bold text-gray-900">{stats.averageBookingSize} משתתפים</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow mb-6 p-4 sm:p-6">
          {/* Payment Status Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">סנן לפי סטטוס תשלום:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PAID', 'PENDING', 'CANCELLED'] as BookingStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === status
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' && 'הכל'}
                  {status === 'PAID' && 'שולם'}
                  {status === 'PENDING' && 'ממתין'}
                  {status === 'CANCELLED' && 'בוטל'}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Date Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">סנן לפי תאריך טיול:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedTripDate('ALL')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all text-right ${
                  selectedTripDate === 'ALL'
                    ? 'bg-accent-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>כל התאריכים</span>
                  <span className="text-xs opacity-75">({bookings.length})</span>
                </div>
              </button>
              {uniqueTripDates.map((tripDate) => {
                const date = new Date(tripDate.date);
                return (
                  <button
                    key={tripDate.id}
                    onClick={() => setSelectedTripDate(tripDate.id)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all text-right ${
                      selectedTripDate === tripDate.id
                        ? 'bg-accent-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {date.toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs opacity-75">({tripDate.bookingsCount})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filter !== 'ALL' || selectedTripDate !== 'ALL') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">פילטרים פעילים:</span>
                {filter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
                    סטטוס: {filter === 'PAID' ? 'שולם' : filter === 'PENDING' ? 'ממתין' : 'בוטל'}
                  </span>
                )}
                {selectedTripDate !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-sm font-semibold">
                    תאריך: {new Date(uniqueTripDates.find((d) => d.id === selectedTripDate)?.date || '').toLocaleDateString('he-IL')}
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilter('ALL');
                    setSelectedTripDate('ALL');
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                  נקה הכל
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    שם מלא
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    תאריך טיול
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    משתתפים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    מקדמה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    יתרה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    סטטוס מקדמה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    סטטוס יתרה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      לא נמצאו הזמנות
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const tripDate = new Date(booking.tripDate.date);
                    const createdDate = new Date(booking.createdAt);

                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{booking.fullName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {booking.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1" dir="ltr">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">
                              {tripDate.toLocaleDateString('he-IL')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">{booking.participantsCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900">
                            ₪{(booking.depositAmount / 100).toFixed(0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900">
                            ₪{(booking.remainingAmount / 100).toFixed(0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.depositStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.remainingStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            {booking.remainingStatus === 'PENDING' && booking.depositStatus === 'PAID' && (
                              <>
                                <button
                                  onClick={() => handleSendRemainingPayment(booking.id)}
                                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                  שלח קישור תשלום
                                </button>
                                <button
                                  onClick={() => handleMarkRemainingPaid(booking.id)}
                                  className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                                >
                                  סמן כשולם
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              לא נמצאו הזמנות
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const tripDate = new Date(booking.tripDate.date);
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-lg p-5 border-2 border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {booking.fullName}
                      </h3>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                        <Mail className="w-3 h-3" />
                        {booking.email}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {booking.phone}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        תאריך טיול
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {tripDate.toLocaleDateString('he-IL')}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        משתתפים
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.participantsCount}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-green-700 mb-1">מקדמה</div>
                      <div className="text-lg font-bold text-green-800">
                        ₪{(booking.depositAmount / 100).toFixed(0)}
                      </div>
                      <div className="mt-1">{getStatusBadge(booking.depositStatus)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-orange-700 mb-1">יתרה</div>
                      <div className="text-lg font-bold text-orange-800">
                        ₪{(booking.remainingAmount / 100).toFixed(0)}
                      </div>
                      <div className="mt-1">{getStatusBadge(booking.remainingStatus)}</div>
                    </div>
                  </div>

                  {booking.remainingStatus === 'PENDING' && booking.depositStatus === 'PAID' && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleSendRemainingPayment(booking.id)}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all"
                      >
                        שלח קישור תשלום
                      </button>
                      <button
                        onClick={() => handleMarkRemainingPaid(booking.id)}
                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-all"
                      >
                        סמן כשולם
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </>
  );
}
