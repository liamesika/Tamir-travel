"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  Users,
  CheckCircle,
  Clock,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Loader2,
  UserCheck,
  AlertCircle,
  Send,
  Download,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  MessageCircle,
  Tag
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import AdminNav from '@/components/admin/AdminNav';
import BulkEmailModal from '@/components/admin/BulkEmailModal';
import SendRemainingEmailsModal from '@/components/admin/SendRemainingEmailsModal';
import Link from 'next/link';

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
  paymentToken: string;
  createdAt: string;
  adminNotes: string | null;
  remainingEmailSentAt: string | null;
  remainingEmailMessageId: string | null;
  couponCode: string | null;
  discountAmount: number | null;
}

interface TripDateDetail {
  id: string;
  date: string;
  pricePerPerson: number;
  depositAmount: number;
  capacity: number;
  minParticipants: number;
  minReachedAt: string | null;
  status: string;
  bookings: Booking[];
  stats: {
    participants: number;
    paidDeposits: number;
    paidRemaining: number;
    pendingDeposits: number;
    bookingsCount: number;
    revenue: number;
    pendingRevenue: number;
    availableSpots: number;
    minReached: boolean;
    isSoldOut: boolean;
  };
}

export default function TripDateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tripDate, setTripDate] = useState<TripDateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingPaymentLink, setSendingPaymentLink] = useState<string | null>(null);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [showRemainingEmailsModal, setShowRemainingEmailsModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/trip-dates-dashboard/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTripDate(data.tripDate);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('שגיאה בטעינת נתונים');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return `₪${(amount / 100).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            שולם
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" />
            ממתין
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <AlertCircle className="w-3 h-3" />
            בוטל
          </span>
        );
      default:
        return status;
    }
  };

  const sendPaymentLink = async (booking: Booking, type: 'deposit' | 'remaining') => {
    setSendingPaymentLink(booking.id);
    try {
      const res = await fetch('/api/admin/send-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          type
        })
      });

      if (!res.ok) throw new Error('Failed to send');
      alert('קישור התשלום נשלח בהצלחה');
    } catch (err) {
      alert('שגיאה בשליחת קישור');
    } finally {
      setSendingPaymentLink(null);
    }
  };

  const openWhatsApp = (booking: Booking) => {
    const phone = booking.phone.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('0') ? `972${phone.slice(1)}` : phone;
    const message = encodeURIComponent(
      `שלום ${booking.fullName}, זהו מסר לגבי ההזמנה שלך לטיול "לונדון שלא הכרתם"`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const exportToCSV = () => {
    if (!tripDate) return;

    const headers = ['שם מלא', 'אימייל', 'טלפון', 'משתתפים', 'מחיר כולל', 'סטטוס מקדמה', 'סטטוס יתרה', 'תאריך הזמנה'];
    const rows = tripDate.bookings.map(b => [
      b.fullName,
      b.email,
      b.phone,
      b.participantsCount.toString(),
      (b.totalPrice / 100).toString(),
      b.depositStatus === 'PAID' ? 'שולם' : 'ממתין',
      b.remainingStatus === 'PAID' ? 'שולם' : 'ממתין',
      new Date(b.createdAt).toLocaleDateString('he-IL')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings-${tripDate.date.split('T')[0]}.csv`;
    link.click();
  };

  const filteredBookings = tripDate?.bookings.filter(b => {
    // Apply status filter
    if (filter === 'PAID_DEPOSIT' && b.depositStatus !== 'PAID') return false;
    if (filter === 'PENDING_DEPOSIT' && b.depositStatus !== 'PENDING') return false;
    if (filter === 'PAID_REMAINING' && b.remainingStatus !== 'PAID') return false;
    if (filter === 'PENDING_REMAINING' && (b.depositStatus !== 'PAID' || b.remainingStatus !== 'PENDING')) return false;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        b.fullName.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        b.phone.includes(query)
      );
    }

    return true;
  }) || [];

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">טוען נתונים...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !tripDate) {
    return (
      <>
        <AdminNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4">{error || 'שגיאה בטעינת נתונים'}</p>
            <Link
              href="/admin"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              חזרה לדשבורד
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm font-medium mb-3"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה לתאריכי טיול
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatDate(tripDate.date)}
                </h1>
                <p className="text-gray-600 mt-1">
                  {formatCurrency(tripDate.pricePerPerson)} לאדם • מקדמה {formatCurrency(tripDate.depositAmount)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowRemainingEmailsModal(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  <Send className="w-4 h-4" />
                  שלח מייל יתרה
                </button>
                <button
                  onClick={() => setShowBulkEmailModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <Mail className="w-4 h-4" />
                  מייל תפוצה
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  <Download className="w-4 h-4" />
                  ייצוא CSV
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tripDate.stats.minReached ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <Users className={`w-5 h-5 ${tripDate.stats.minReached ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <div className="text-xs text-gray-500">משתתפים</div>
                  <div className="font-bold text-gray-900">
                    {tripDate.stats.participants}/{tripDate.capacity}
                  </div>
                </div>
              </div>
              {!tripDate.stats.minReached && (
                <div className="mt-2 text-xs text-yellow-600 font-medium">
                  חסרים {tripDate.minParticipants - tripDate.stats.participants} למינימום
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">מקדמות ששולמו</div>
                  <div className="font-bold text-green-600">
                    {tripDate.stats.paidDeposits}/{tripDate.stats.bookingsCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">יתרות ששולמו</div>
                  <div className="font-bold text-blue-600">
                    {tripDate.stats.paidRemaining}/{tripDate.stats.paidDeposits}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">הכנסות</div>
                  <div className="font-bold text-purple-600 text-sm">
                    {formatCurrency(tripDate.stats.revenue)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">בהמתנה</div>
                  <div className="font-bold text-yellow-600 text-sm">
                    {formatCurrency(tripDate.stats.pendingRevenue)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש לפי שם, אימייל או טלפון..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'ALL', label: 'הכל' },
                  { value: 'PAID_DEPOSIT', label: 'מקדמה שולמה' },
                  { value: 'PENDING_DEPOSIT', label: 'ממתין למקדמה' },
                  { value: 'PENDING_REMAINING', label: 'ממתין ליתרה' },
                  { value: 'PAID_REMAINING', label: 'שולם במלואו' }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                      filter === f.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings Table - Desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">לקוח</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">משתתפים</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">קופון</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">מקדמה</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">יתרה</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">מייל יתרה</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">סה"כ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">תאריך</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      אין הזמנות
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{booking.fullName}</div>
                        <div className="text-xs text-gray-500">{booking.email}</div>
                        <div className="text-xs text-gray-500">{booking.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{booking.participantsCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        {booking.couponCode ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            <Tag className="w-3 h-3" />
                            {booking.couponCode}
                            {booking.discountAmount && (
                              <span className="text-purple-500">
                                (-{formatCurrency(booking.discountAmount)})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(booking.depositStatus)}
                          <span className="text-xs text-gray-500">{formatCurrency(booking.depositAmount)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(booking.remainingStatus)}
                          <span className="text-xs text-gray-500">{formatCurrency(booking.remainingAmount)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {booking.remainingEmailSentAt ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-green-500">🟢</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-green-700">נשלח</span>
                              <span className="text-xs text-gray-500">
                                {new Date(booking.remainingEmailSentAt).toLocaleDateString('he-IL')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-300">⚪</span>
                            <span className="text-xs text-gray-500">לא נשלח</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-primary-600">{formatCurrency(booking.totalPrice)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString('he-IL')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openWhatsApp(booking)}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                            title="שלח הודעה בוואטסאפ"
                          >
                            <SiWhatsapp className="w-4 h-4" />
                          </button>
                          {booking.depositStatus === 'PENDING' && (
                            <button
                              onClick={() => sendPaymentLink(booking, 'deposit')}
                              disabled={sendingPaymentLink === booking.id}
                              className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition disabled:opacity-50"
                              title="שלח קישור למקדמה"
                            >
                              {sendingPaymentLink === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING' && (
                            <button
                              onClick={() => sendPaymentLink(booking, 'remaining')}
                              disabled={sendingPaymentLink === booking.id}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                              title="שלח קישור ליתרה"
                            >
                              {sendingPaymentLink === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CreditCard className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <Link
                            href={`/admin/bookings?id=${booking.id}`}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                            title="צפה בפרטי הזמנה"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bookings Cards - Mobile */}
          <div className="lg:hidden space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                אין הזמנות
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{booking.fullName}</div>
                      <div className="text-xs text-gray-500">{booking.email}</div>
                      <div className="text-xs text-gray-500">{booking.phone}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-primary-600">{formatCurrency(booking.totalPrice)}</span>
                      <span className="text-xs text-gray-500">{booking.participantsCount} משתתפים</span>
                    </div>
                  </div>

                  {/* Coupon badge */}
                  {booking.couponCode && (
                    <div className="mb-2">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        <Tag className="w-3 h-3" />
                        {booking.couponCode}
                        {booking.discountAmount && (
                          <span className="text-purple-500">(-{formatCurrency(booking.discountAmount)})</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">מקדמה</div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(booking.depositStatus)}
                        <span className="text-xs font-medium">{formatCurrency(booking.depositAmount)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">יתרה</div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(booking.remainingStatus)}
                        <span className="text-xs font-medium">{formatCurrency(booking.remainingAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remaining email status */}
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="text-gray-500">מייל יתרה:</span>
                    {booking.remainingEmailSentAt ? (
                      <span className="text-green-600 font-medium">
                        🟢 נשלח {new Date(booking.remainingEmailSentAt).toLocaleDateString('he-IL')}
                      </span>
                    ) : (
                      <span className="text-gray-400">⚪ לא נשלח</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openWhatsApp(booking)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg font-medium text-sm hover:bg-green-600 transition"
                    >
                      <SiWhatsapp className="w-4 h-4" />
                      וואטסאפ
                    </button>
                    {booking.depositStatus === 'PENDING' && (
                      <button
                        onClick={() => sendPaymentLink(booking, 'deposit')}
                        disabled={sendingPaymentLink === booking.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg font-medium text-sm hover:bg-primary-700 transition disabled:opacity-50"
                      >
                        {sendingPaymentLink === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            קישור מקדמה
                          </>
                        )}
                      </button>
                    )}
                    {booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING' && (
                      <button
                        onClick={() => sendPaymentLink(booking, 'remaining')}
                        disabled={sendingPaymentLink === booking.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {sendingPaymentLink === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            קישור יתרה
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bulk Email Modal */}
      <BulkEmailModal
        tripDateId={id}
        tripDateLabel={tripDate ? formatDate(tripDate.date) : ''}
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
      />

      {/* Send Remaining Emails Modal */}
      <SendRemainingEmailsModal
        tripDateId={id}
        tripDateLabel={tripDate ? formatDate(tripDate.date) : ''}
        isOpen={showRemainingEmailsModal}
        onClose={() => setShowRemainingEmailsModal(false)}
      />
    </>
  );
}
