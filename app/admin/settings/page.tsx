"use client";

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

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
