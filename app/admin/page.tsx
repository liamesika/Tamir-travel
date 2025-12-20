"use client";

import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  PieChart,
  Loader2,
  ArrowRight,
  Settings
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';

interface DashboardData {
  stats: {
    totalBookings: number;
    paidDeposits: number;
    pendingDeposits: number;
    cancelledBookings: number;
    fullyPaidBookings: number;
    totalParticipants: number;
    usersCount: number;
  };
  revenue: {
    depositRevenue: number;
    remainingRevenue: number;
    pendingRemaining: number;
    totalRevenue: number;
    projectedTotal: number;
  };
  upcomingTrips: {
    id: string;
    date: string;
    tripName: string;
    capacity: number;
    reservedSpots: number;
    availableSpots: number;
    status: string;
    bookingsCount: number;
    occupancyRate: number;
  }[];
  recentBookings: {
    id: string;
    fullName: string;
    email: string;
    participantsCount: number;
    depositStatus: string;
    remainingStatus: string;
    tripDate: string;
    tripName: string;
    createdAt: string;
  }[];
  paymentDistribution: {
    fullyPaid: number;
    depositOnly: number;
    pending: number;
    cancelled: number;
  };
  monthlyRevenue: {
    month: string;
    revenue: number;
    bookings: number;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard:', err);
        setError('שגיאה בטעינת נתונים');
        setLoading(false);
      });
  }, []);

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
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₪${(amount / 100).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">טוען דשבורד...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'שגיאה בטעינת נתונים'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  const { stats, revenue, upcomingTrips, recentBookings, paymentDistribution, monthlyRevenue } = data;

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              דשבורד ניהול
            </h1>
            <p className="text-gray-600">סקירה כללית של הפעילות במערכת</p>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs sm:text-sm text-blue-700 font-semibold">סה"כ הזמנות</div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 opacity-50" />
              </div>
              <div className="text-2xl sm:text-4xl font-bold text-blue-900">{stats.totalBookings}</div>
              <div className="text-xs text-blue-600 mt-1">{stats.totalParticipants} משתתפים</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs sm:text-sm text-green-700 font-semibold">מקדמות ששולמו</div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 opacity-50" />
              </div>
              <div className="text-2xl sm:text-4xl font-bold text-green-900">{stats.paidDeposits}</div>
              <div className="text-xs text-green-600 mt-1">{stats.fullyPaidBookings} שולמו במלואן</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs sm:text-sm text-yellow-700 font-semibold">ממתינים לתשלום</div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 opacity-50" />
              </div>
              <div className="text-2xl sm:text-4xl font-bold text-yellow-900">{stats.pendingDeposits}</div>
              <div className="text-xs text-yellow-600 mt-1">מקדמות בהמתנה</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs sm:text-sm text-purple-700 font-semibold">סה"כ הכנסות</div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 opacity-50" />
              </div>
              <div className="text-xl sm:text-3xl font-bold text-purple-900">{formatCurrency(revenue.totalRevenue)}</div>
              <div className="text-xs text-purple-600 mt-1">{formatCurrency(revenue.pendingRemaining)} יתרות בהמתנה</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Payment Status Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">התפלגות סטטוס תשלומים</h3>
                </div>
                <Link href="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                  צפה בהזמנות
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">שולמו במלואן</span>
                    <span className="text-sm font-bold text-green-600">
                      {paymentDistribution.fullyPaid} ({stats.totalBookings > 0 ? ((paymentDistribution.fullyPaid / stats.totalBookings) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalBookings > 0 ? (paymentDistribution.fullyPaid / stats.totalBookings) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">מקדמה בלבד</span>
                    <span className="text-sm font-bold text-blue-600">
                      {paymentDistribution.depositOnly} ({stats.totalBookings > 0 ? ((paymentDistribution.depositOnly / stats.totalBookings) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalBookings > 0 ? (paymentDistribution.depositOnly / stats.totalBookings) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">ממתינים לתשלום</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {paymentDistribution.pending} ({stats.totalBookings > 0 ? ((paymentDistribution.pending / stats.totalBookings) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalBookings > 0 ? (paymentDistribution.pending / stats.totalBookings) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {paymentDistribution.cancelled > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">בוטלו</span>
                      <span className="text-sm font-bold text-red-600">
                        {paymentDistribution.cancelled} ({stats.totalBookings > 0 ? ((paymentDistribution.cancelled / stats.totalBookings) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.totalBookings > 0 ? (paymentDistribution.cancelled / stats.totalBookings) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-900">פירוט הכנסות</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-sm text-green-700 font-semibold mb-1">מקדמות שנתקבלו</div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-800">{formatCurrency(revenue.depositRevenue)}</div>
                  <div className="text-xs text-green-600 mt-1">מ-{stats.paidDeposits} הזמנות</div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-sm text-blue-700 font-semibold mb-1">יתרות שנתקבלו</div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-800">{formatCurrency(revenue.remainingRevenue)}</div>
                  <div className="text-xs text-blue-600 mt-1">מ-{stats.fullyPaidBookings} הזמנות</div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="text-sm text-orange-700 font-semibold mb-1">יתרות בהמתנה</div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-800">{formatCurrency(revenue.pendingRemaining)}</div>
                  <div className="text-xs text-orange-600 mt-1">מ-{stats.paidDeposits - stats.fullyPaidBookings} הזמנות</div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-semibold">צפי סה"כ:</span>
                    <span className="text-xl font-bold text-purple-800">{formatCurrency(revenue.projectedTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Trips & Recent Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Upcoming Trips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">טיולים קרובים</h3>
                </div>
                <Link href="/admin/trips" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                  נהל טיולים
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {upcomingTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  אין טיולים קרובים
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTrips.slice(0, 5).map((trip) => (
                    <div key={trip.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{trip.tripName}</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          trip.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                          trip.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                          trip.status === 'SOLD_OUT' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trip.status === 'OPEN' ? 'פתוח' :
                           trip.status === 'CLOSED' ? 'סגור' :
                           trip.status === 'SOLD_OUT' ? 'אזל' : trip.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(trip.date).toLocaleDateString('he-IL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-semibold">{trip.reservedSpots}</span>
                          <span className="text-gray-500">/{trip.capacity} מקומות</span>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              trip.occupancyRate >= 80 ? 'bg-red-500' :
                              trip.occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${trip.occupancyRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">הזמנות אחרונות</h3>
                </div>
                <Link href="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
                  כל ההזמנות
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  אין הזמנות עדיין
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{booking.fullName}</div>
                        {getStatusBadge(booking.depositStatus)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div>{booking.participantsCount} משתתפים</div>
                        <div>{booking.tripName}</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(booking.createdAt).toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          {monthlyRevenue.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-900">הכנסות חודשיות</h3>
              </div>
              <div className="flex items-end justify-between gap-2 h-48">
                {monthlyRevenue.map((month, index) => {
                  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))
                  const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">{formatCurrency(month.revenue)}</div>
                      <div
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-2">{month.month}</div>
                      <div className="text-xs text-gray-400">{month.bookings} הזמנות</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/bookings"
              className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">הזמנות</div>
                <div className="text-sm text-gray-500">ניהול הזמנות</div>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">לקוחות</div>
                <div className="text-sm text-gray-500">ניהול לקוחות</div>
              </div>
            </Link>

            <Link
              href="/admin/trips"
              className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">טיולים</div>
                <div className="text-sm text-gray-500">ניהול טיולים</div>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">הגדרות</div>
                <div className="text-sm text-gray-500">הגדרות מערכת</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
