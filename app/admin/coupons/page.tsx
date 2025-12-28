'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Loader2,
  Percent,
  Tag,
  Calendar,
  Users,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Copy,
  Check
} from 'lucide-react'
import AdminNav from '@/components/admin/AdminNav'

interface Coupon {
  id: string
  code: string
  description: string | null
  percentOff: number
  isActive: boolean
  expiresAt: string | null
  maxRedemptions: number | null
  redemptionCount: number
  minParticipants: number | null
  stripeCouponId: string | null
  stripePromoCodeId: string | null
  createdAt: string
  _count: {
    bookings: number
  }
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    percentOff: '',
    expiresAt: '',
    maxRedemptions: '',
    minParticipants: '',
    createInStripe: false
  })

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoupons(data.coupons || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת קופונים')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setShowCreateModal(false)
      setFormData({
        code: '',
        description: '',
        percentOff: '',
        expiresAt: '',
        maxRedemptions: '',
        minParticipants: '',
        createInStripe: false
      })
      fetchCoupons()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת קופון')
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      fetchCoupons()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעדכון קופון')
    }
  }

  const deleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`האם למחוק את הקופון "${coupon.code}"?`)) return

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      fetchCoupons()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקת קופון')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ניהול קופונים</h1>
              <p className="text-gray-600 mt-1">צור וערוך קודי הנחה</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4" />
              קופון חדש
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Coupons List */}
          {coupons.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין קופונים</h3>
              <p className="text-gray-600 mb-4">צור קופון ראשון כדי להתחיל</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                <Plus className="w-4 h-4" />
                צור קופון
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-xl shadow-md p-6 border-r-4 ${
                    coupon.isActive ? 'border-green-500' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                        >
                          <code className="font-mono font-bold text-lg text-primary-600">
                            {coupon.code}
                          </code>
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {coupon.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                        {coupon.stripeCouponId && (
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            Stripe
                          </span>
                        )}
                      </div>

                      {coupon.description && (
                        <p className="text-gray-600 mb-3">{coupon.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-primary-600 font-semibold">
                          <Percent className="w-4 h-4" />
                          <span>{coupon.percentOff}% הנחה</span>
                        </div>

                        {coupon.expiresAt && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>תוקף עד {formatDate(coupon.expiresAt)}</span>
                          </div>
                        )}

                        {coupon.maxRedemptions && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Tag className="w-4 h-4" />
                            <span>{coupon.redemptionCount}/{coupon.maxRedemptions} שימושים</span>
                          </div>
                        )}

                        {coupon.minParticipants && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>מינימום {coupon.minParticipants} משתתפים</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-gray-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>{coupon._count.bookings} הזמנות</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mr-4">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`p-2 rounded-lg transition ${
                          coupon.isActive
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={coupon.isActive ? 'בטל קופון' : 'הפעל קופון'}
                      >
                        {coupon.isActive ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        title="מחק קופון"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-indigo-50">
              <h2 className="text-lg font-bold text-gray-900">יצירת קופון חדש</h2>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קוד קופון *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER25"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono uppercase"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אחוז הנחה *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentOff}
                    onChange={(e) => setFormData({ ...formData, percentOff: e.target.value })}
                    placeholder="10"
                    required
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    dir="ltr"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור (אופציונלי)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="הנחת קיץ מיוחדת"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תוקף עד</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מקס שימושים</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxRedemptions}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                    placeholder="ללא הגבלה"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מינימום משתתפים</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minParticipants}
                  onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
                  placeholder="ללא הגבלה"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createInStripe"
                  checked={formData.createInStripe}
                  onChange={(e) => setFormData({ ...formData, createInStripe: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="createInStripe" className="text-sm text-gray-700">
                  צור גם ב-Stripe (לשימוש בקישורי תשלום)
                </label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      יוצר...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      צור קופון
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
