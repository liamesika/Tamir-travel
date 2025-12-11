"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Save, Loader2, ArrowRight } from 'lucide-react';

export default function NewTripPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    heroTitle: '',
    heroSubtitle: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('הטיול נוצר בהצלחה!');
        router.push(`/admin/trips/${data.trip.id}/edit`);
      } else {
        alert(data.error || 'שגיאה ביצירת טיול');
        setSaving(false);
      }
    } catch (error) {
      alert('שגיאה ביצירת טיול');
      setSaving(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-א-ת]+/g, '')
        .replace(/\-\-+/g, '-')
        .trim(),
    });
  };

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/trips')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                צור טיול חדש
              </h1>
              <p className="text-gray-600">הוסף טיול חדש למערכת</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  שם הטיול <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg"
                  placeholder="למשל: טיול ג'יפים בנגב"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  סלאג (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg font-mono"
                  placeholder="jeep-negev"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  הכתובת של הטיול באתר: /{formData.slug || 'slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  כותרת ראשית <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg"
                  placeholder="חוויה בלתי נשכחת בנגב"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  תת-כותרת <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition text-lg resize-none"
                  rows={3}
                  placeholder="גלו את יופיו של הנגב במסע ג'יפים מרגש..."
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  פעיל (יוצג באתר)
                </label>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>טיפ:</strong> לאחר יצירת הטיול, תוכל להוסיף תאריכים, תמונות, ופרטים נוספים בעמוד העריכה.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/trips')}
                className="sm:flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={saving}
                className="sm:flex-1 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    יוצר טיול...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    צור טיול
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
