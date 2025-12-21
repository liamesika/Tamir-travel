"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { Save, Loader2, ArrowRight, Plus, Trash2, Calendar, Users, Image, FileText, HelpCircle, Map, List } from 'lucide-react';

interface TripDate {
  id: string;
  date: string;
  capacity: number;
  reservedSpots: number;
  pricePerPerson: number;
  depositAmount: number;
  status: string;
}

interface ItineraryActivity {
  icon: string;
  title: string;
  description: string;
}

interface ItineraryDay {
  day: string;
  title: string;
  activities: ItineraryActivity[];
}

interface FaqItem {
  question: string;
  answer: string | string[];
}

interface GalleryImage {
  src: string;
  alt: string;
}

type TabType = 'basic' | 'content' | 'itinerary' | 'faq' | 'gallery' | 'dates';

const ICON_OPTIONS = ['Car', 'TreePine', 'Camera', 'MapPin', 'Home', 'Coffee', 'Sunrise', 'ShoppingBag'];

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [tripDates, setTripDates] = useState<TripDate[]>([]);

  // Parsed JSON fields
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [notIncludedItems, setNotIncludedItems] = useState<string[]>([]);
  const [itinerarySteps, setItinerarySteps] = useState<ItineraryDay[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const [newDate, setNewDate] = useState({
    date: '',
    capacity: 25,
    pricePerPerson: 500,
    depositAmount: 300,
  });

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const safeParseJSON = <T,>(value: string | null, fallback: T): T => {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/admin/trips/${tripId}`);
      const data = await response.json();
      if (response.ok) {
        setTrip(data.trip);
        setTripDates(data.trip.tripDates || []);

        // Parse JSON fields
        setIncludedItems(safeParseJSON<string[]>(data.trip.includedItems, []));
        setNotIncludedItems(safeParseJSON<string[]>(data.trip.notIncludedItems, []));
        setItinerarySteps(safeParseJSON<ItineraryDay[]>(data.trip.itinerarySteps, []));
        setFaqItems(safeParseJSON<FaqItem[]>(data.trip.faqItems, []));
        setGalleryImages(safeParseJSON<GalleryImage[]>(data.trip.galleryImages, []));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...trip,
          includedItems: JSON.stringify(includedItems),
          notIncludedItems: JSON.stringify(notIncludedItems),
          itinerarySteps: JSON.stringify(itinerarySteps),
          faqItems: JSON.stringify(faqItems),
          galleryImages: JSON.stringify(galleryImages),
        }),
      });

      if (response.ok) {
        alert('הטיול עודכן בהצלחה!');
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בעדכון טיול');
      }
    } catch (error) {
      alert('שגיאה בעדכון טיול');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDate = async () => {
    if (!newDate.date) {
      alert('אנא בחר תאריך');
      return;
    }

    try {
      const response = await fetch('/api/trip-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDate,
          tripId,
        }),
      });

      if (response.ok) {
        alert('התאריך נוסף בהצלחה!');
        fetchTrip();
        setNewDate({
          date: '',
          capacity: 25,
          pricePerPerson: 500,
          depositAmount: 300,
        });
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בהוספת תאריך');
      }
    } catch (error) {
      alert('שגיאה בהוספת תאריך');
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תאריך זה?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trip-dates/${dateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTrip();
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה במחיקת תאריך');
      }
    } catch (error) {
      alert('שגיאה במחיקת תאריך');
    }
  };

  // Array manipulation helpers
  const addIncludedItem = () => setIncludedItems([...includedItems, '']);
  const updateIncludedItem = (index: number, value: string) => {
    const updated = [...includedItems];
    updated[index] = value;
    setIncludedItems(updated);
  };
  const removeIncludedItem = (index: number) => setIncludedItems(includedItems.filter((_, i) => i !== index));

  const addNotIncludedItem = () => setNotIncludedItems([...notIncludedItems, '']);
  const updateNotIncludedItem = (index: number, value: string) => {
    const updated = [...notIncludedItems];
    updated[index] = value;
    setNotIncludedItems(updated);
  };
  const removeNotIncludedItem = (index: number) => setNotIncludedItems(notIncludedItems.filter((_, i) => i !== index));

  // Itinerary helpers
  const addItineraryDay = () => {
    setItinerarySteps([...itinerarySteps, { day: `יום ${itinerarySteps.length + 1}`, title: '', activities: [] }]);
  };
  const updateItineraryDay = (dayIndex: number, field: string, value: string) => {
    const updated = [...itinerarySteps];
    (updated[dayIndex] as any)[field] = value;
    setItinerarySteps(updated);
  };
  const removeItineraryDay = (dayIndex: number) => {
    setItinerarySteps(itinerarySteps.filter((_, i) => i !== dayIndex));
  };
  const addActivity = (dayIndex: number) => {
    const updated = [...itinerarySteps];
    updated[dayIndex].activities.push({ icon: 'MapPin', title: '', description: '' });
    setItinerarySteps(updated);
  };
  const updateActivity = (dayIndex: number, actIndex: number, field: string, value: string) => {
    const updated = [...itinerarySteps];
    (updated[dayIndex].activities[actIndex] as any)[field] = value;
    setItinerarySteps(updated);
  };
  const removeActivity = (dayIndex: number, actIndex: number) => {
    const updated = [...itinerarySteps];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex);
    setItinerarySteps(updated);
  };

  // FAQ helpers
  const addFaqItem = () => setFaqItems([...faqItems, { question: '', answer: '' }]);
  const updateFaqItem = (index: number, field: string, value: string | string[]) => {
    const updated = [...faqItems];
    (updated[index] as any)[field] = value;
    setFaqItems(updated);
  };
  const removeFaqItem = (index: number) => setFaqItems(faqItems.filter((_, i) => i !== index));

  // Gallery helpers
  const addGalleryImage = () => setGalleryImages([...galleryImages, { src: '', alt: '' }]);
  const updateGalleryImage = (index: number, field: string, value: string) => {
    const updated = [...galleryImages];
    (updated[index] as any)[field] = value;
    setGalleryImages(updated);
  };
  const removeGalleryImage = (index: number) => setGalleryImages(galleryImages.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען טיול...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">טיול לא נמצא</p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'basic', label: 'פרטים בסיסיים', icon: FileText },
    { id: 'content', label: 'תוכן המדריך', icon: FileText },
    { id: 'itinerary', label: 'מסלול', icon: Map },
    { id: 'faq', label: 'שאלות ותשובות', icon: HelpCircle },
    { id: 'gallery', label: 'גלריה', icon: Image },
    { id: 'dates', label: 'תאריכים', icon: Calendar },
  ];

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/trips')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ערוך: {trip.name}
                </h1>
                <p className="text-gray-600 text-sm">עדכן את כל פרטי הטיול</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'שומר...' : 'שמור הכל'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl p-2 shadow">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">פרטים בסיסיים</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">שם הטיול</label>
                    <input
                      type="text"
                      value={trip.name}
                      onChange={(e) => setTrip({ ...trip, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">סלאג (URL)</label>
                    <input
                      type="text"
                      value={trip.slug}
                      onChange={(e) => setTrip({ ...trip, slug: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">כותרת ראשית (Hero)</label>
                  <input
                    type="text"
                    value={trip.heroTitle}
                    onChange={(e) => setTrip({ ...trip, heroTitle: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">תת-כותרת (Hero)</label>
                  <textarea
                    value={trip.heroSubtitle}
                    onChange={(e) => setTrip({ ...trip, heroSubtitle: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">תמונת Hero (URL)</label>
                  <input
                    type="text"
                    value={trip.heroImage || ''}
                    onChange={(e) => setTrip({ ...trip, heroImage: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="/images/hero-poster.jpg"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={trip.isActive}
                    onChange={(e) => setTrip({ ...trip, isActive: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    פעיל (יוצג באתר)
                  </label>
                </div>

                {/* What's included / not included */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">מה כלול</label>
                      <button onClick={addIncludedItem} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        + הוסף פריט
                      </button>
                    </div>
                    <div className="space-y-2">
                      {includedItems.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateIncludedItem(index, e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                            placeholder="לדוגמה: לינה במקום מוקף טבע"
                          />
                          <button onClick={() => removeIncludedItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">מה לא כלול</label>
                      <button onClick={addNotIncludedItem} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        + הוסף פריט
                      </button>
                    </div>
                    <div className="space-y-2">
                      {notIncludedItems.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateNotIncludedItem(index, e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                            placeholder="לדוגמה: טיסות ללונדון"
                          />
                          <button onClick={() => removeNotIncludedItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab (Guide Section) */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">תוכן המדריך</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">כותרת המדריך</label>
                  <input
                    type="text"
                    value={trip.guideTitle || ''}
                    onChange={(e) => setTrip({ ...trip, guideTitle: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="היי, אני תמיר"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">תוכן המדריך (פסקאות מופרדות בשורה ריקה)</label>
                  <textarea
                    value={trip.guideContent || ''}
                    onChange={(e) => setTrip({ ...trip, guideContent: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                    placeholder="אחרי שנים של מגורים באנגליה..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">תמונת המדריך (URL)</label>
                  <input
                    type="text"
                    value={trip.guideImage || ''}
                    onChange={(e) => setTrip({ ...trip, guideImage: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="/images/trip/tamir.jpg"
                  />
                </div>
              </div>
            )}

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">מסלול הטיול</h2>
                  <button
                    onClick={addItineraryDay}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף יום
                  </button>
                </div>

                {itinerarySteps.map((day, dayIndex) => (
                  <div key={dayIndex} className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-4 flex-1">
                        <input
                          type="text"
                          value={day.day}
                          onChange={(e) => updateItineraryDay(dayIndex, 'day', e.target.value)}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg w-32"
                          placeholder="יום ראשון"
                        />
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => updateItineraryDay(dayIndex, 'title', e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                          placeholder="כותרת היום"
                        />
                      </div>
                      <button
                        onClick={() => removeItineraryDay(dayIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg mr-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 mr-4">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                          <select
                            value={activity.icon}
                            onChange={(e) => updateActivity(dayIndex, actIndex, 'icon', e.target.value)}
                            className="px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                          >
                            {ICON_OPTIONS.map((icon) => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={activity.title}
                            onChange={(e) => updateActivity(dayIndex, actIndex, 'title', e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                            placeholder="כותרת הפעילות"
                          />
                          <input
                            type="text"
                            value={activity.description}
                            onChange={(e) => updateActivity(dayIndex, actIndex, 'description', e.target.value)}
                            className="flex-[2] px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                            placeholder="תיאור"
                          />
                          <button
                            onClick={() => removeActivity(dayIndex, actIndex)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addActivity(dayIndex)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        + הוסף פעילות
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">שאלות ותשובות</h2>
                  <button
                    onClick={addFaqItem}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף שאלה
                  </button>
                </div>

                {faqItems.map((faq, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-medium"
                          placeholder="השאלה"
                        />
                        <textarea
                          value={Array.isArray(faq.answer) ? faq.answer.join('\n') : faq.answer}
                          onChange={(e) => updateFaqItem(index, 'answer', e.target.value.includes('\n') ? e.target.value.split('\n') : e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg resize-none"
                          placeholder="התשובה (שורות מופרדות יהפכו לרשימה)"
                        />
                      </div>
                      <button
                        onClick={() => removeFaqItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">גלריית תמונות</h2>
                  <button
                    onClick={addGalleryImage}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף תמונה
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                      {image.src && (
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <input
                        type="text"
                        value={image.src}
                        onChange={(e) => updateGalleryImage(index, 'src', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm mb-2"
                        placeholder="URL התמונה"
                      />
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateGalleryImage(index, 'alt', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm mb-2"
                        placeholder="תיאור התמונה"
                      />
                      <button
                        onClick={() => removeGalleryImage(index)}
                        className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                      >
                        מחק תמונה
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dates Tab */}
            {activeTab === 'dates' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">ניהול תאריכים</h2>

                {/* Add New Date */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    הוסף תאריך חדש
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">תאריך</label>
                      <input
                        type="date"
                        value={newDate.date}
                        onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">מקומות</label>
                      <input
                        type="number"
                        value={newDate.capacity}
                        onChange={(e) => setNewDate({ ...newDate, capacity: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">מחיר</label>
                      <input
                        type="number"
                        value={newDate.pricePerPerson}
                        onChange={(e) => setNewDate({ ...newDate, pricePerPerson: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">מקדמה</label>
                      <input
                        type="number"
                        value={newDate.depositAmount}
                        onChange={(e) => setNewDate({ ...newDate, depositAmount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                        min="0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddDate}
                    className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg"
                  >
                    הוסף תאריך
                  </button>
                </div>

                {/* Existing Dates */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">תאריכים קיימים ({tripDates.length})</h3>

                  {tripDates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>אין תאריכים זמינים</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tripDates
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((date) => {
                          const dateObj = new Date(date.date);
                          const available = date.capacity - date.reservedSpots;
                          return (
                            <div
                              key={date.id}
                              className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-primary-600" />
                                  <span className="font-bold text-gray-900">
                                    {dateObj.toLocaleDateString('he-IL', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteDate(date.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>{available}/{date.capacity}</span>
                                </div>
                                <div className="text-gray-600">₪{date.pricePerPerson}</div>
                                <div className="text-gray-600">מקדמה: ₪{date.depositAmount}</div>
                                <div className={`font-medium ${date.status === 'OPEN' ? 'text-green-600' : 'text-gray-600'}`}>
                                  {date.status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
