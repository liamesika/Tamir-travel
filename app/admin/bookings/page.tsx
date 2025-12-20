"use client";

import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Eye
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';

type BookingStatus = 'ALL' | 'PAID' | 'PENDING' | 'CANCELLED';

interface Booking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  totalPrice: number;
  depositAmount: number;
  depositStatus: string;
  remainingAmount: number;
  remainingStatus: string;
  adminNotes: string | null;
  createdAt: string;
  tripDate: {
    id: string;
    date: string;
    trip?: {
      name: string;
      slug: string;
    };
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  payments: any[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus>('ALL');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (filter !== 'ALL') {
        params.append('status', filter);
      }
      if (search) {
        params.append('search', search);
      }

      const res = await fetch(`/api/admin/bookings?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setBookings(data.bookings);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            שולם
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" />
            ממתין
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
            <XCircle className="w-3 h-3" />
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (response.ok) {
        alert('קישור תשלום נשלח בהצלחה!');
      } else {
        const data = await response.json();
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
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remainingStatus: 'PAID' }),
      });

      if (response.ok) {
        alert('היתרה סומנה כשולמה!');
        fetchBookings(pagination.page);
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בעדכון סטטוס');
      }
    } catch (error) {
      alert('שגיאה בעדכון סטטוס');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק הזמנה זו? פעולה זו לא ניתנת לביטול.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('ההזמנה נמחקה בהצלחה');
        fetchBookings(pagination.page);
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה במחיקת הזמנה');
      }
    } catch (error) {
      alert('שגיאה במחיקת הזמנה');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₪${(amount / 100).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
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
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                ניהול הזמנות
              </h1>
              <p className="text-gray-600">
                {pagination.total} הזמנות במערכת
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow mb-6 p-4 sm:p-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חפש לפי שם, אימייל או טלפון..."
                  className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">סנן לפי סטטוס:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PAID', 'PENDING', 'CANCELLED'] as BookingStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === status
                      ? 'bg-primary-600 text-white shadow-lg'
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

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      לקוח
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      טיול
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      משתתפים
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      מקדמה
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      יתרה
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        לא נמצאו הזמנות
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {booking.tripDate?.trip?.name || 'טיול'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.tripDate.date).toLocaleDateString('he-IL')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">{booking.participantsCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(booking.depositAmount)}
                          </div>
                          {getStatusBadge(booking.depositStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(booking.remainingAmount)}
                          </div>
                          {getStatusBadge(booking.remainingStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString('he-IL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                            {selectedBooking === booking.id && (
                              <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[180px]">
                                {booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleSendRemainingPayment(booking.id);
                                        setSelectedBooking(null);
                                      }}
                                      className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Send className="w-4 h-4" />
                                      שלח קישור תשלום
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleMarkRemainingPaid(booking.id);
                                        setSelectedBooking(null);
                                      }}
                                      className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      סמן יתרה כשולמה
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    handleDeleteBooking(booking.id);
                                    setSelectedBooking(null);
                                  }}
                                  className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  מחק הזמנה
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                לא נמצאו הזמנות
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{booking.fullName}</h3>
                      <div className="text-sm text-gray-500">{booking.email}</div>
                      <div className="text-sm text-gray-500" dir="ltr">{booking.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.tripDate?.trip?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.tripDate.date).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">משתתפים</div>
                      <div className="text-lg font-bold">{booking.participantsCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">סה"כ</div>
                      <div className="text-lg font-bold">{formatCurrency(booking.totalPrice)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-green-700 mb-1">מקדמה</div>
                      <div className="text-lg font-bold text-green-800">
                        {formatCurrency(booking.depositAmount)}
                      </div>
                      <div className="mt-1">{getStatusBadge(booking.depositStatus)}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="text-xs text-orange-700 mb-1">יתרה</div>
                      <div className="text-lg font-bold text-orange-800">
                        {formatCurrency(booking.remainingAmount)}
                      </div>
                      <div className="mt-1">{getStatusBadge(booking.remainingStatus)}</div>
                    </div>
                  </div>

                  {booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING' && (
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleSendRemainingPayment(booking.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                      >
                        שלח קישור תשלום
                      </button>
                      <button
                        onClick={() => handleMarkRemainingPaid(booking.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                      >
                        סמן כשולם
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchBookings(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                עמוד {pagination.page} מתוך {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchBookings(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
