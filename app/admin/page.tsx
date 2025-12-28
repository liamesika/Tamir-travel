"use client";

import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  CreditCard,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Loader2,
  AlertCircle,
  UserCheck,
  Ban,
  X,
  Tag
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';

interface TripDateStats {
  id: string;
  date: string;
  pricePerPerson: number;
  depositAmount: number;
  capacity: number;
  minParticipants: number;
  minReachedAt: string | null;
  status: string;
  participants: number;
  paidDeposits: number;
  paidRemaining: number;
  bookingsCount: number;
  revenue: number;
}

interface DashboardStats {
  totalParticipants: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingDates: number;
  couponStats?: {
    totalCouponBookings: number;
    totalDiscountAmount: number;
    topCoupon: { code: string; count: number } | null;
  };
}

export default function AdminDashboardPage() {
  const [tripDates, setTripDates] = useState<TripDateStats[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState({ date: '', pricePerPerson: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cancelModal, setCancelModal] = useState<{ id: string; date: string; bookingsCount: number } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelResults, setCancelResults] = useState<{
    totalBookings: number;
    refundsProcessed: number;
    emailsSent: number;
    totalRefundAmountFormatted: string;
    whatsappLinks: { bookingId: string; fullName: string; phone: string; link: string }[];
  } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/trip-dates-dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTripDates(data.tripDates);
      setStats(data.stats);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('שגיאה בטעינת נתונים');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₪${(amount / 100).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (tripDate: TripDateStats) => {
    if (tripDate.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
          <Ban className="w-3 h-3" />
          בוטל
        </span>
      );
    }
    if (tripDate.status === 'SOLD_OUT' || tripDate.participants >= tripDate.capacity) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          <AlertCircle className="w-3 h-3" />
          אזל
        </span>
      );
    }
    if (tripDate.status === 'CLOSED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
          <Clock className="w-3 h-3" />
          סגור
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        <CheckCircle className="w-3 h-3" />
        פתוח
      </span>
    );
  };

  const getMinStatusBadge = (tripDate: TripDateStats) => {
    if (tripDate.participants >= tripDate.minParticipants) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <UserCheck className="w-3 h-3" />
          הושג מינימום
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
        <Users className="w-3 h-3" />
        {tripDate.minParticipants - tripDate.participants} חסרים
      </span>
    );
  };

  const handleAddTripDate = async () => {
    if (!newDate.date || !newDate.pricePerPerson) {
      alert('נא למלא את כל השדות');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/trip-dates-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate.date,
          pricePerPerson: parseInt(newDate.pricePerPerson) * 100 // Convert to agorot
        })
      });

      if (!res.ok) throw new Error('Failed to create');

      setShowAddModal(false);
      setNewDate({ date: '', pricePerPerson: '' });
      fetchData();
    } catch (err) {
      alert('שגיאה ביצירת תאריך');
    } finally {
      setSaving(false);
    }
  };

  const openCancelModal = (tripDate: TripDateStats) => {
    setCancelModal({
      id: tripDate.id,
      date: formatDate(tripDate.date),
      bookingsCount: tripDate.bookingsCount
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/admin/trip-dates-dashboard/${cancelModal.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'ALREADY_CANCELLED') {
          alert('תאריך זה כבר בוטל.');
          setCancelModal(null);
          fetchData();
        } else if (data.code === 'NOT_FOUND') {
          alert('תאריך הטיול לא נמצא.');
          setCancelModal(null);
          fetchData();
        } else {
          alert(data.error || 'שגיאה בביטול התאריך');
        }
        return;
      }

      // Show results
      if (data.results) {
        setCancelResults(data.results);
      } else {
        setCancelModal(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error cancelling trip date:', err);
      alert('שגיאת תקשורת. נסה שוב.');
    } finally {
      setCancelling(false);
    }
  };

  const closeCancelResults = () => {
    setCancelResults(null);
    setCancelModal(null);
    fetchData();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/trip-dates-dashboard/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update');
      fetchData();
    } catch (err) {
      alert('שגיאה בעדכון סטטוס');
    }
  };

  const filteredDates = tripDates.filter(td => {
    if (statusFilter === 'ALL') return td.status !== 'CANCELLED'; // Hide cancelled by default
    if (statusFilter === 'OPEN') return td.status === 'OPEN';
    if (statusFilter === 'MIN_REACHED') return td.participants >= td.minParticipants && td.status !== 'CANCELLED';
    if (statusFilter === 'SOLD_OUT') return (td.status === 'SOLD_OUT' || td.participants >= td.capacity) && td.status !== 'CANCELLED';
    if (statusFilter === 'CANCELLED') return td.status === 'CANCELLED';
    return true;
  });

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

  if (error) {
    return (
      <>
        <AdminNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              נסה שוב
            </button>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                ניהול תאריכי טיול
              </h1>
              <p className="text-gray-600 text-sm mt-1">לונדון שלא הכרתם • מקדמה ₪300 • מקסימום 30 משתתפים</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-semibold transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              הוסף תאריך
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">משתתפים בטיפול</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalParticipants}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">הכנסות שנתקבלו</div>
                      <div className="text-xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalRevenue)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">תשלומים בהמתנה</div>
                      <div className="text-xl font-bold text-yellow-600 mt-1">{formatCurrency(stats.pendingPayments)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">תאריכים קרובים</div>
                      <div className="text-2xl font-bold text-purple-600 mt-1">{stats.upcomingDates}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Analytics Widget */}
              {stats.couponStats && (stats.couponStats.totalCouponBookings > 0 || stats.couponStats.totalDiscountAmount > 0) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-4 border border-purple-200 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-purple-900">סטטיסטיקת קופונים</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/70 rounded-lg p-3 text-center">
                      <div className="text-xs text-purple-600 font-medium">הזמנות עם קופון</div>
                      <div className="text-2xl font-bold text-purple-700 mt-1">{stats.couponStats.totalCouponBookings}</div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center">
                      <div className="text-xs text-purple-600 font-medium">סה"כ הנחות</div>
                      <div className="text-xl font-bold text-purple-700 mt-1">{formatCurrency(stats.couponStats.totalDiscountAmount)}</div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 text-center">
                      <div className="text-xs text-purple-600 font-medium">קופון פופולרי</div>
                      <div className="text-lg font-bold text-purple-700 mt-1">
                        {stats.couponStats.topCoupon ? (
                          <span className="flex items-center justify-center gap-1">
                            {stats.couponStats.topCoupon.code}
                            <span className="text-xs text-purple-500">({stats.couponStats.topCoupon.count})</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'הכל' },
                { value: 'OPEN', label: 'פתוחים' },
                { value: 'MIN_REACHED', label: 'הגיעו למינימום' },
                { value: 'SOLD_OUT', label: 'אזלו' },
                { value: 'CANCELLED', label: 'בוטלו' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    statusFilter === filter.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Dates Table - Desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">תאריך</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">מחיר לאדם</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">משתתפים</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">מינימום</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">מקדמות</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">יתרות</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">סטטוס</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      אין תאריכי טיול
                    </td>
                  </tr>
                ) : (
                  filteredDates.map((tripDate) => (
                    <tr key={tripDate.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{formatDate(tripDate.date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-primary-600">{formatCurrency(tripDate.pricePerPerson)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{tripDate.participants}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{tripDate.capacity}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                tripDate.participants >= tripDate.capacity
                                  ? 'bg-red-500'
                                  : tripDate.participants >= tripDate.minParticipants
                                  ? 'bg-green-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min((tripDate.participants / tripDate.capacity) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getMinStatusBadge(tripDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-green-600">{tripDate.paidDeposits}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{tripDate.bookingsCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-blue-600">{tripDate.paidRemaining}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{tripDate.paidDeposits}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(tripDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/trip-dates/${tripDate.id}`}
                            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition"
                            title="צפה בפרטים"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {tripDate.status !== 'CANCELLED' && (
                            <button
                              onClick={() => openCancelModal(tripDate)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="בטל תאריך"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Trip Dates Cards - Mobile */}
          <div className="lg:hidden space-y-3">
            {filteredDates.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                אין תאריכי טיול
              </div>
            ) : (
              filteredDates.map((tripDate) => (
                <div key={tripDate.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{formatDate(tripDate.date)}</div>
                      <div className="text-lg font-bold text-primary-600">{formatCurrency(tripDate.pricePerPerson)}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(tripDate)}
                      {getMinStatusBadge(tripDate)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500">משתתפים</div>
                      <div className="font-bold text-gray-900">{tripDate.participants}/{tripDate.capacity}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-green-600">מקדמות</div>
                      <div className="font-bold text-green-700">{tripDate.paidDeposits}/{tripDate.bookingsCount}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-blue-600">יתרות</div>
                      <div className="font-bold text-blue-700">{tripDate.paidRemaining}/{tripDate.paidDeposits}</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full ${
                        tripDate.participants >= tripDate.capacity
                          ? 'bg-red-500'
                          : tripDate.participants >= tripDate.minParticipants
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min((tripDate.participants / tripDate.capacity) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/trip-dates/${tripDate.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition hover:bg-primary-700"
                    >
                      <Eye className="w-4 h-4" />
                      פרטים והזמנות
                    </Link>
                    {tripDate.status !== 'CANCELLED' && (
                      <button
                        onClick={() => openCancelModal(tripDate)}
                        className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition"
                        title="בטל תאריך"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Trip Date Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" dir="rtl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">הוספת תאריך טיול</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  תאריך הטיול
                </label>
                <input
                  type="date"
                  value={newDate.date}
                  onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  מחיר לאדם (₪)
                </label>
                <input
                  type="number"
                  value={newDate.pricePerPerson}
                  onChange={(e) => setNewDate({ ...newDate, pricePerPerson: e.target.value })}
                  placeholder="1290"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>מקדמה:</span>
                  <span className="font-semibold">₪300 (קבוע)</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>מקסימום משתתפים:</span>
                  <span className="font-semibold">30</span>
                </div>
                <div className="flex justify-between">
                  <span>מינימום להפעלה:</span>
                  <span className="font-semibold">15</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                ביטול
              </button>
              <button
                onClick={handleAddTripDate}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    שומר...
                  </>
                ) : (
                  'הוסף תאריך'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Trip Date Modal */}
      {cancelModal && !cancelResults && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">ביטול תאריך טיול</h2>
                  <p className="text-gray-600">{cancelModal.date}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800 font-semibold mb-2">פעולה בלתי הפיכה!</p>
                <p className="text-red-700 text-sm leading-relaxed">
                  ביטול תאריך יבצע:
                </p>
                <ul className="text-red-700 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>החזר כספי מלא לכל הנרשמים ({cancelModal.bookingsCount} הזמנות)</li>
                  <li>שליחת מייל ביטול אוטומטי לכל המשתתפים</li>
                  <li>ביטול כל ההזמנות הקשורות לתאריך</li>
                </ul>
              </div>

              {cancelModal.bookingsCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-amber-800 text-sm">
                    <strong>שים לב:</strong> יש {cancelModal.bookingsCount} הזמנות פעילות. כל הלקוחות יקבלו החזר כספי מלא ומייל ביטול.
                  </p>
                </div>
              )}

              <p className="text-gray-600 text-sm">
                האם אתה בטוח שברצונך לבטל את התאריך?
              </p>
            </div>

            <div className="flex gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setCancelModal(null)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                חזור
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מבטל...
                  </>
                ) : (
                  'בטל תאריך והחזר כספים'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Results Modal */}
      {cancelResults && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">התאריך בוטל בהצלחה</h2>
                  <p className="text-gray-600">כל הפעולות הושלמו</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{cancelResults.totalBookings}</p>
                  <p className="text-sm text-gray-600">הזמנות בוטלו</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{cancelResults.totalRefundAmountFormatted}</p>
                  <p className="text-sm text-gray-600">הוחזרו</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{cancelResults.refundsProcessed}</p>
                  <p className="text-sm text-gray-600">החזרים עובדו</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{cancelResults.emailsSent}</p>
                  <p className="text-sm text-gray-600">מיילים נשלחו</p>
                </div>
              </div>

              {/* WhatsApp Links */}
              {cancelResults.whatsappLinks.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <SiWhatsapp className="w-4 h-4 text-green-600" />
                    קישורי WhatsApp למעקב
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cancelResults.whatsappLinks.map((link) => (
                      <a
                        key={link.bookingId}
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{link.fullName}</p>
                          <p className="text-sm text-gray-500">{link.phone}</p>
                        </div>
                        <SiWhatsapp className="w-5 h-5 text-green-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={closeCancelResults}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
