"use client";

import { useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import { Bell, Send, Users, Calendar, AlertCircle, CheckCircle, Mail } from 'lucide-react';

export default function NotificationsPage() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!message.trim()) {
      alert('אנא הכנס הודעה לשליחה');
      return;
    }

    setSending(true);
    // TODO: Implement actual notification sending
    setTimeout(() => {
      alert('ההודעה נשלחה בהצלחה!');
      setMessage('');
      setSending(false);
    }, 1000);
  };

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              התראות ועדכונים
            </h1>
            <p className="text-gray-600">שלח עדכונים ללקוחות על שינויים בטיול</p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-blue-900">עדכוני דוא"ל</h3>
              </div>
              <p className="text-sm text-blue-700">
                שלח עדכונים אוטומטיים ללקוחות שביצעו הזמנה
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-900">שינויים בטיול</h3>
              </div>
              <p className="text-sm text-green-700">
                עדכן לקוחות על שינויי תאריך, מקום מפגש או מסלול
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-purple-900">התראות חשובות</h3>
              </div>
              <p className="text-sm text-purple-700">
                שלח הודעות דחופות על מזג אויר, ביטולים או שינויים
              </p>
            </div>
          </div>

          {/* Send Notification Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">שלח התראה חדשה</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 ml-1" />
                  בחר מי יקבל את ההתראה
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg">
                  <option>כל הלקוחות עם הזמנות פעילות</option>
                  <option>לקוחות בטיול ספציפי</option>
                  <option>לקוחות שטרם שילמו יתרה</option>
                  <option>לקוחות בתאריך ספציפי</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Bell className="inline w-4 h-4 ml-1" />
                  סוג ההתראה
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg">
                  <option>עדכון כללי</option>
                  <option>שינוי תאריך</option>
                  <option>שינוי מקום מפגש</option>
                  <option>שינוי במסלול</option>
                  <option>תזכורת לתשלום</option>
                  <option>ביטול טיול</option>
                  <option>התראת מזג אויר</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  תוכן ההודעה
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg resize-none"
                  placeholder="כתוב את תוכן ההודעה שתישלח ללקוחות..."
                />
              </div>

              <button
                onClick={handleSendNotification}
                disabled={sending}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    שולח...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    שלח התראה
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">התראות אחרונות</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900">עדכון מקום מפגש</h4>
                    <span className="text-xs text-gray-500">לפני 2 שעות</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    שלח ל-15 לקוחות בטיול של 15/01/2026
                  </p>
                  <p className="text-sm text-gray-500">
                    "שימו לב: מקום המפגש שונה לחניון הראשי במקום החניון הדרומי"
                  </p>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>זוהי תצוגת דוגמה. התראות אמיתיות יופיעו כאן.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
