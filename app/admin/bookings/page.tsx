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
  Trash2,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import AdminNav from '@/components/admin/AdminNav';

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
  emailSent: boolean;
  whatsappSent: boolean;
  adminNotes: string | null;
  paymentToken: string;
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
  const [sendingAction, setSendingAction] = useState<{ id: string; type: string } | null>(null);

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

  const getPaymentStatusBadge = (depositStatus: string, remainingStatus: string) => {
    if (depositStatus === 'PAID' && remainingStatus === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
          <CheckCircle className="w-3.5 h-3.5" />
          שולם במלואו
        </span>
      );
    }
    if (depositStatus === 'PAID' && remainingStatus === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          ממתין ליתרה
        </span>
      );
    }
    if (depositStatus === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          ממתין למקדמה
        </span>
      );
    }
    if (depositStatus === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
          <XCircle className="w-3.5 h-3.5" />
          בוטל
        </span>
      );
    }
    return null;
  };

  const getCommunicationBadges = (emailSent: boolean, whatsappSent: boolean) => {
    if (!emailSent && !whatsappSent) return null;
    return (
      <div className="flex gap-1 mt-1">
        {whatsappSent && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-medium">
            <SiWhatsapp className="w-2.5 h-2.5" />
            נשלח
          </span>
        )}
        {emailSent && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
            <Mail className="w-2.5 h-2.5" />
            נשלח
          </span>
        )}
      </div>
    );
  };

  const handleSendWhatsApp = async (booking: Booking) => {
    setSendingAction({ id: booking.id, type: 'whatsapp' });
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsapp' }),
      });

      const data = await res.json();

      if (res.ok && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
        fetchBookings(pagination.page);
      } else {
        alert(data.error || 'שגיאה ביצירת קישור וואטסאפ');
      }
    } catch (error) {
      alert('שגיאה ביצירת קישור וואטסאפ');
    } finally {
      setSendingAction(null);
    }
  };

  const handleSendEmail = async (booking: Booking) => {
    setSendingAction({ id: booking.id, type: 'email' });
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email' }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('אימייל נשלח בהצלחה!');
        fetchBookings(pagination.page);
      } else {
        alert(data.error || 'שגיאה בשליחת אימייל');
      }
    } catch (error) {
      alert('שגיאה בשליחת אימייל');
    } finally {
      setSendingAction(null);
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

  const needsPayment = (booking: Booking) => {
    return booking.depositStatus === 'PENDING' ||
           (booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING');
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
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              ניהול הזמנות
            </h1>
            <p className="text-gray-600">
              {pagination.total} הזמנות במערכת
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-4 sm:p-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חפש לפי שם, אימייל או טלפון..."
                  className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                />
              </div>
            </form>

            <div className="flex items-center gap-2 mb-3">
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
          <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      לקוח
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      טיול
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      תשלום
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      סטטוס
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      פעולות תקשורת
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      עוד
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        לא נמצאו הזמנות
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">{booking.fullName}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {booking.email}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1" dir="ltr">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3" />
                            {booking.participantsCount} משתתפים
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900 text-sm">
                            {booking.tripDate?.trip?.name || 'טיול'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.tripDate.date).toLocaleDateString('he-IL')}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">מקדמה:</span>
                              <span className={`font-bold ${booking.depositStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {formatCurrency(booking.depositAmount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">יתרה:</span>
                              <span className={`font-bold ${booking.remainingStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                                {formatCurrency(booking.remainingAmount)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 border-t pt-1">
                              סה"כ: {formatCurrency(booking.totalPrice)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {getPaymentStatusBadge(booking.depositStatus, booking.remainingStatus)}
                          {getCommunicationBadges(booking.emailSent, booking.whatsappSent)}
                        </td>
                        <td className="px-4 py-4">
                          {needsPayment(booking) ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleSendWhatsApp(booking)}
                                disabled={sendingAction?.id === booking.id}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                              >
                                {sendingAction?.id === booking.id && sendingAction.type === 'whatsapp' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <SiWhatsapp className="w-3.5 h-3.5" />
                                )}
                                שלח בוואטסאפ
                              </button>
                              <button
                                onClick={() => handleSendEmail(booking)}
                                disabled={sendingAction?.id === booking.id}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                              >
                                {sendingAction?.id === booking.id && sendingAction.type === 'email' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Mail className="w-3.5 h-3.5" />
                                )}
                                שלח במייל
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">אין פעולות</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                            {selectedBooking === booking.id && (
                              <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-[180px]">
                                {booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING' && (
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
                                )}
                                <a
                                  href={`/payment/${booking.paymentToken}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                                  onClick={() => setSelectedBooking(null)}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  צפה בדף תשלום
                                </a>
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
              <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                לא נמצאו הזמנות
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{booking.fullName}</h3>
                        <div className="text-xs text-gray-500 mt-0.5">{booking.email}</div>
                        <div className="text-xs text-gray-500" dir="ltr">{booking.phone}</div>
                      </div>
                      <div className="text-right">
                        {getPaymentStatusBadge(booking.depositStatus, booking.remainingStatus)}
                        {getCommunicationBadges(booking.emailSent, booking.whatsappSent)}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Trip Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{booking.tripDate?.trip?.name || 'טיול'}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(booking.tripDate.date).toLocaleDateString('he-IL')}</span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {booking.participantsCount}
                      </span>
                    </div>

                    {/* Payment Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className={`rounded-lg p-2.5 text-center ${
                        booking.depositStatus === 'PAID' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className="text-[10px] text-gray-500 mb-0.5">מקדמה</div>
                        <div className={`text-sm font-bold ${
                          booking.depositStatus === 'PAID' ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          {formatCurrency(booking.depositAmount)}
                        </div>
                      </div>
                      <div className={`rounded-lg p-2.5 text-center ${
                        booking.remainingStatus === 'PAID' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                      }`}>
                        <div className="text-[10px] text-gray-500 mb-0.5">יתרה</div>
                        <div className={`text-sm font-bold ${
                          booking.remainingStatus === 'PAID' ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {formatCurrency(booking.remainingAmount)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-200">
                        <div className="text-[10px] text-gray-500 mb-0.5">סה"כ</div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(booking.totalPrice)}
                        </div>
                      </div>
                    </div>

                    {/* Communication Actions */}
                    {needsPayment(booking) && (
                      <div className="border-t pt-3 mt-3">
                        <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          שלח בקשת תשלום
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSendWhatsApp(booking)}
                            disabled={sendingAction?.id === booking.id}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                          >
                            {sendingAction?.id === booking.id && sendingAction.type === 'whatsapp' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <SiWhatsapp className="w-4 h-4" />
                            )}
                            וואטסאפ
                          </button>
                          <button
                            onClick={() => handleSendEmail(booking)}
                            disabled={sendingAction?.id === booking.id}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                          >
                            {sendingAction?.id === booking.id && sendingAction.type === 'email' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                            אימייל
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Additional Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      {booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING' && (
                        <button
                          onClick={() => handleMarkRemainingPaid(booking.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-bold transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          סמן כשולם
                        </button>
                      )}
                      <a
                        href={`/payment/${booking.paymentToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        דף תשלום
                      </a>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                עמוד {pagination.page} מתוך {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchBookings(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
