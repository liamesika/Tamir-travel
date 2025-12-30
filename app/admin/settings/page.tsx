"use client";

import { useEffect, useState } from 'react';
import { Save, Loader2, Play, Trash2, CheckCircle, XCircle, AlertCircle, ExternalLink, Mail } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
  label: string;
  description: string | null;
}

interface E2ETestResult {
  step: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  data?: any;
}

interface EmailHealthStatus {
  resendConfigured: boolean;
  fromConfigured: boolean;
  valid: boolean;
  instanceCreated: boolean;
  instanceError: string | null;
  errors: string[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  // E2E Test state
  const [runningE2E, setRunningE2E] = useState(false);
  const [e2eResults, setE2eResults] = useState<E2ETestResult[] | null>(null);
  const [e2ePaymentUrl, setE2ePaymentUrl] = useState<string | null>(null);
  const [cleaningE2E, setCleaningE2E] = useState(false);

  // Email health check state
  const [checkingEmailHealth, setCheckingEmailHealth] = useState(false);
  const [emailHealth, setEmailHealth] = useState<EmailHealthStatus | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async (settingId: string, value: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/${settingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        alert('ההגדרה נשמרה בהצלחה!');
        fetchSettings();
      } else {
        alert('שגיאה בשמירת הגדרה');
      }
    } catch (error) {
      alert('שגיאה בשמירת הגדרה');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['ALL', 'business', 'branding', 'payment', 'contact', 'advanced'];

  // Email health check handler
  const checkEmailHealth = async () => {
    setCheckingEmailHealth(true);
    setEmailHealth(null);

    try {
      const response = await fetch('/api/admin/email/health');
      const data = await response.json();
      setEmailHealth(data);
    } catch (error) {
      setEmailHealth({
        resendConfigured: false,
        fromConfigured: false,
        valid: false,
        instanceCreated: false,
        instanceError: 'Failed to connect to health check API',
        errors: ['Connection failed']
      });
    } finally {
      setCheckingEmailHealth(false);
    }
  };

  // E2E Test handlers
  const runE2ETest = async () => {
    setRunningE2E(true);
    setE2eResults(null);
    setE2ePaymentUrl(null);

    try {
      const response = await fetch('/api/admin/e2e-test', {
        method: 'POST'
      });
      const data = await response.json();

      setE2eResults(data.results || []);
      if (data.testPaymentUrl) {
        setE2ePaymentUrl(data.testPaymentUrl);
      }
    } catch (error) {
      setE2eResults([{
        step: 'Connection Error',
        status: 'failed',
        message: 'Failed to connect to test API'
      }]);
    } finally {
      setRunningE2E(false);
    }
  };

  const cleanupE2ETests = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את כל הזמנות הבדיקה?')) return;

    setCleaningE2E(true);
    try {
      const response = await fetch('/api/admin/e2e-test', {
        method: 'DELETE'
      });
      const data = await response.json();
      alert(data.message || 'Cleanup completed');
      setE2eResults(null);
      setE2ePaymentUrl(null);
    } catch (error) {
      alert('Failed to cleanup test bookings');
    } finally {
      setCleaningE2E(false);
    }
  };

  const filteredSettings = filter === 'ALL'
    ? settings
    : settings.filter(setting => setting.category === filter);

  const groupedSettings = filteredSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען הגדרות...</p>
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
              הגדרות כלליות
            </h1>
            <p className="text-gray-600">נהל את כל ההגדרות והמידע העסקי</p>
          </div>

          {/* Email Health Check Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md mb-6 p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  בדיקת שירות מייל (Email Health)
                </h2>
                <p className="text-sm text-green-700 mt-1">
                  בדוק שהגדרות Resend תקינות ושירות המייל פעיל
                </p>
              </div>
              <button
                onClick={checkEmailHealth}
                disabled={checkingEmailHealth}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition shadow-md"
              >
                {checkingEmailHealth ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    בודק...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    בדוק עכשיו
                  </>
                )}
              </button>
            </div>

            {/* Email Health Results */}
            {emailHealth && (
              <div className="bg-white rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">תוצאות בדיקה:</h3>
                <div className="space-y-2">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${emailHealth.resendConfigured ? 'bg-green-50' : 'bg-red-50'}`}>
                    {emailHealth.resendConfigured ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-semibold ${emailHealth.resendConfigured ? 'text-green-700' : 'text-red-700'}`}>
                        RESEND_API_KEY
                      </div>
                      <div className={`text-sm ${emailHealth.resendConfigured ? 'text-green-600' : 'text-red-600'}`}>
                        {emailHealth.resendConfigured ? 'מוגדר כראוי' : 'לא מוגדר או לא תקין'}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${emailHealth.fromConfigured ? 'bg-green-50' : 'bg-red-50'}`}>
                    {emailHealth.fromConfigured ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-semibold ${emailHealth.fromConfigured ? 'text-green-700' : 'text-red-700'}`}>
                        RESEND_FROM_EMAIL
                      </div>
                      <div className={`text-sm ${emailHealth.fromConfigured ? 'text-green-600' : 'text-red-600'}`}>
                        {emailHealth.fromConfigured ? 'מוגדר כראוי' : 'לא מוגדר או לא תקין'}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg ${emailHealth.instanceCreated ? 'bg-green-50' : 'bg-red-50'}`}>
                    {emailHealth.instanceCreated ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className={`font-semibold ${emailHealth.instanceCreated ? 'text-green-700' : 'text-red-700'}`}>
                        Resend Instance
                      </div>
                      <div className={`text-sm ${emailHealth.instanceCreated ? 'text-green-600' : 'text-red-600'}`}>
                        {emailHealth.instanceCreated ? 'נוצר בהצלחה' : emailHealth.instanceError || 'נכשל'}
                      </div>
                    </div>
                  </div>

                  {emailHealth.errors && emailHealth.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg mt-2">
                      <div className="font-semibold text-red-700 mb-1">שגיאות:</div>
                      <ul className="list-disc list-inside text-sm text-red-600">
                        {emailHealth.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {emailHealth.valid && (
                    <div className="bg-green-100 p-3 rounded-lg mt-2 text-center">
                      <span className="text-green-800 font-bold">שירות המייל מוכן לשימוש</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* E2E Test Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md mb-6 p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  בדיקת מערכת (E2E Test)
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  בדוק את כל תהליך ההזמנה: יצירת הזמנה, תשלום Stripe, שליחת מייל
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={runE2ETest}
                  disabled={runningE2E}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                >
                  {runningE2E ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      מריץ בדיקה...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      הרץ בדיקה
                    </>
                  )}
                </button>
                <button
                  onClick={cleanupE2ETests}
                  disabled={cleaningE2E}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-50 transition"
                >
                  {cleaningE2E ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  נקה בדיקות
                </button>
              </div>
            </div>

            {/* E2E Results */}
            {e2eResults && (
              <div className="bg-white rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">תוצאות הבדיקה:</h3>
                <div className="space-y-2">
                  {e2eResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        result.status === 'success' ? 'bg-green-50' :
                        result.status === 'failed' ? 'bg-red-50' :
                        'bg-yellow-50'
                      }`}
                    >
                      {result.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : result.status === 'failed' ? (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className={`font-semibold ${
                          result.status === 'success' ? 'text-green-700' :
                          result.status === 'failed' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          {result.step}
                        </div>
                        <div className={`text-sm ${
                          result.status === 'success' ? 'text-green-600' :
                          result.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {result.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Open Stripe Payment Link */}
                {e2ePaymentUrl && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <a
                      href={e2ePaymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      פתח דף תשלום Stripe (לבדיקה)
                    </a>
                    <p className="text-xs text-blue-600 mt-1">
                      לחץ כדי לפתוח את דף התשלום ולבדוק את הזרימה המלאה
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow mb-6 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-gray-900">סנן לפי קטגוריה:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === category
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'ALL' ? 'הכל' : category}
                </button>
              ))}
            </div>
          </div>

          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <div key={category} className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                {category}
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="bg-white rounded-xl shadow p-6">
                    <div className="mb-4">
                      <label className="block text-lg font-bold text-gray-900 mb-1">
                        {setting.label}
                      </label>
                      {setting.description && (
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      )}
                    </div>

                    {setting.type === 'text' && (
                      <input
                        type="text"
                        defaultValue={setting.value}
                        onBlur={(e) => {
                          if (e.target.value !== setting.value) {
                            handleSave(setting.id, e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
                      />
                    )}

                    {setting.type === 'email' && (
                      <input
                        type="email"
                        defaultValue={setting.value}
                        onBlur={(e) => {
                          if (e.target.value !== setting.value) {
                            handleSave(setting.id, e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
                      />
                    )}

                    {setting.type === 'phone' && (
                      <input
                        type="tel"
                        defaultValue={setting.value}
                        onBlur={(e) => {
                          if (e.target.value !== setting.value) {
                            handleSave(setting.id, e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-lg"
                        dir="ltr"
                      />
                    )}

                    {setting.type === 'color' && (
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          defaultValue={setting.value}
                          onBlur={(e) => {
                            if (e.target.value !== setting.value) {
                              handleSave(setting.id, e.target.value);
                            }
                          }}
                          className="h-12 w-20 border-2 border-gray-200 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue={setting.value}
                          onBlur={(e) => {
                            if (e.target.value !== setting.value) {
                              handleSave(setting.id, e.target.value);
                            }
                          }}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="#000000"
                        />
                      </div>
                    )}

                    {setting.type === 'toggle' && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.value === 'true'}
                          onChange={(e) => {
                            handleSave(setting.id, e.target.checked ? 'true' : 'false');
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                        <span className="mr-3 text-sm font-medium text-gray-900">
                          {setting.value === 'true' ? 'מופעל' : 'כבוי'}
                        </span>
                      </label>
                    )}

                    {setting.type === 'textarea' && (
                      <textarea
                        defaultValue={setting.value}
                        onBlur={(e) => {
                          if (e.target.value !== setting.value) {
                            handleSave(setting.id, e.target.value);
                          }
                        }}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {settings.length === 0 && (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-gray-500">אין הגדרות במערכת</p>
            </div>
          )}

          {saving && (
            <div className="fixed bottom-4 left-4 bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              שומר...
            </div>
          )}
        </div>
      </div>
    </>
  );
}
