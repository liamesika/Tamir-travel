"use client";

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface ContentBlock {
  id: string;
  key: string;
  value: string;
  type: string;
  category: string;
}

export default function ContentManagementPage() {
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      const data = await response.json();
      if (data.content) {
        setContent(data.content);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  const handleSave = async (blockId: string, value: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/content/${blockId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        alert('התוכן נשמר בהצלחה!');
        fetchContent();
      } else {
        alert('שגיאה בשמירת תוכן');
      }
    } catch (error) {
      alert('שגיאה בשמירת תוכן');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['ALL', 'hero', 'guide', 'itinerary', 'included', 'gallery', 'reviews', 'faq', 'cta', 'contact'];

  const filteredContent = filter === 'ALL'
    ? content
    : content.filter(block => block.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען תוכן...</p>
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
              ניהול תוכן
            </h1>
            <p className="text-gray-600">ערוך את כל התוכן שמוצג באתר</p>
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

          <div className="grid grid-cols-1 gap-6">
            {filteredContent.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500">אין בלוקי תוכן במערכת</p>
              </div>
            ) : (
              filteredContent.map((block) => (
                <div key={block.id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{block.key}</h3>
                      <span className="text-sm text-gray-500">קטגוריה: {block.category} | סוג: {block.type}</span>
                    </div>
                  </div>

                  {block.type === 'text' && (
                    <input
                      type="text"
                      defaultValue={block.value}
                      onBlur={(e) => {
                        if (e.target.value !== block.value) {
                          handleSave(block.id, e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  )}

                  {block.type === 'textarea' && (
                    <textarea
                      defaultValue={block.value}
                      onBlur={(e) => {
                        if (e.target.value !== block.value) {
                          handleSave(block.id, e.target.value);
                        }
                      }}
                      rows={6}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  )}

                  {block.type === 'json' && (
                    <textarea
                      defaultValue={block.value}
                      onBlur={(e) => {
                        if (e.target.value !== block.value) {
                          try {
                            JSON.parse(e.target.value);
                            handleSave(block.id, e.target.value);
                          } catch (err) {
                            alert('JSON לא תקין');
                          }
                        }
                      }}
                      rows={10}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none font-mono text-sm"
                    />
                  )}
                </div>
              ))
            )}
          </div>

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
