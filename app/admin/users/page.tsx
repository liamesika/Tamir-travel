"use client";

import { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  createdAt: string;
  bookings: {
    id: string;
    depositStatus: string;
    remainingStatus: string;
    participantsCount: number;
    tripDate: {
      date: string;
      trip?: {
        name: string;
      };
    };
  }[];
  stats: {
    bookingsCount: number;
    totalSpent: number;
    totalParticipants: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (search) {
        params.append('search', search);
      }

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const formatCurrency = (amount: number) => {
    return `₪${(amount / 100).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">טוען לקוחות...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              ניהול לקוחות
            </h1>
            <p className="text-gray-600">
              {pagination.total} לקוחות במערכת
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow mb-6 p-4 sm:p-6">
            <form onSubmit={handleSearch}>
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
                      פרטי קשר
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      הזמנות
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      סה"כ שילם
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      תאריך הצטרפות
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        לא נמצאו לקוחות
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-bold text-sm">
                                {user.fullName.charAt(0)}
                              </span>
                            </div>
                            <div className="font-semibold text-gray-900">{user.fullName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1" dir="ltr">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">{user.stats.bookingsCount}</span>
                            <span className="text-gray-500 text-sm">({user.stats.totalParticipants} משתתפים)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-green-600">{formatCurrency(user.stats.totalSpent)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('he-IL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-primary-600"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
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
            {users.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                לא נמצאו לקוחות
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-bold">
                        {user.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary-600">{user.stats.bookingsCount}</div>
                      <div className="text-xs text-gray-500">הזמנות</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{user.stats.totalParticipants}</div>
                      <div className="text-xs text-gray-500">משתתפים</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-600">{formatCurrency(user.stats.totalSpent)}</div>
                      <div className="text-xs text-gray-500">סה"כ</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedUser(user)}
                    className="w-full py-2 bg-primary-50 text-primary-600 rounded-lg font-semibold hover:bg-primary-100 transition"
                  >
                    צפה בפרטים
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                עמוד {pagination.page} מתוך {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-xl">
                      {selectedUser.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.fullName}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">טלפון</div>
                  <div className="font-semibold" dir="ltr">{selectedUser.phone || '-'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">וואטסאפ</div>
                  <div className="font-semibold" dir="ltr">{selectedUser.whatsapp || '-'}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{selectedUser.stats.bookingsCount}</div>
                  <div className="text-sm text-blue-700">הזמנות</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">{selectedUser.stats.totalParticipants}</div>
                  <div className="text-sm text-purple-700">משתתפים</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedUser.stats.totalSpent)}</div>
                  <div className="text-sm text-green-700">סה"כ שילם</div>
                </div>
              </div>

              {/* Bookings */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">היסטוריית הזמנות</h3>
              {selectedUser.bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  אין הזמנות
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedUser.bookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{booking.tripDate?.trip?.name || 'טיול'}</div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            booking.depositStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.depositStatus === 'PAID' ? 'מקדמה שולמה' : 'ממתין למקדמה'}
                          </span>
                          {booking.depositStatus === 'PAID' && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              booking.remainingStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {booking.remainingStatus === 'PAID' ? 'יתרה שולמה' : 'ממתין ליתרה'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.tripDate.date).toLocaleDateString('he-IL')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.participantsCount} משתתפים
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {selectedUser.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">הערות</h3>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    {selectedUser.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
