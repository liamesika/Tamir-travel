'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Users, AlertCircle, CheckCircle, Loader2, Send, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface Recipient {
  email: string
  fullName: string
  bookingId: string
  remainingStatus: string
  paymentToken: string
}

interface BatchRecipient {
  id: string
  email: string
  fullName: string | null
  status: string
  sentAt: string | null
  errorMessage: string | null
}

interface Batch {
  id: string
  subject: string
  body: string
  includePaymentLink: boolean
  totalRecipients: number
  sentCount: number
  failedCount: number
  status: string
  createdAt: string
  sentAt: string | null
  createdByAdmin: string
  recipients: BatchRecipient[]
}

interface BulkEmailModalProps {
  tripDateId: string
  tripDateLabel: string
  isOpen: boolean
  onClose: () => void
}

export default function BulkEmailModal({ tripDateId, tripDateLabel, isOpen, onClose }: BulkEmailModalProps) {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [resendConfigured, setResendConfigured] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [includePaymentLink, setIncludePaymentLink] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; sentCount: number; failedCount: number } | null>(null)

  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && tripDateId) {
      fetchData()
    }
  }, [isOpen, tripDateId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/trip-dates/${tripDateId}/bulk-email`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data')
      }

      setRecipients(data.recipients || [])
      setBatches(data.batches || [])
      setResendConfigured(data.resendConfigured)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('נא למלא נושא ותוכן')
      return
    }

    setSending(true)
    setError(null)
    setSendResult(null)

    try {
      const res = await fetch(`/api/admin/trip-dates/${tripDateId}/bulk-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, includePaymentLink })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      setSendResult({
        success: true,
        sentCount: data.sentCount,
        failedCount: data.failedCount
      })

      // Refresh data
      await fetchData()

      // Clear form
      setSubject('')
      setBody('')
      setIncludePaymentLink(false)
      setShowConfirm(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">שליחת מייל תפוצה</h2>
              <p className="text-sm text-gray-600">{tripDateLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Success Result */}
              {sendResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700 font-medium">הקמפיין נשלח בהצלחה!</p>
                    <p className="text-green-600 text-sm mt-1">
                      נשלחו: {sendResult.sentCount} | נכשלו: {sendResult.failedCount}
                    </p>
                  </div>
                </div>
              )}

              {/* Resend Warning */}
              {!resendConfigured && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-700 font-medium">Resend לא מוגדר</p>
                    <p className="text-amber-600 text-sm mt-1">
                      יש להגדיר את משתנה הסביבה RESEND_API_KEY כדי לשלוח מיילים
                    </p>
                  </div>
                </div>
              )}

              {/* Recipients Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">נמענים ({recipients.length})</span>
                </div>
                {recipients.length === 0 ? (
                  <p className="text-gray-500 text-sm">אין נמענים לשליחה</p>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {recipients.slice(0, 10).map((r, i) => (
                      <div key={i} className="text-sm flex items-center gap-2">
                        <span className="text-gray-700">{r.fullName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500" dir="ltr">{r.email}</span>
                        {r.remainingStatus !== 'PAID' && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">ממתין לתשלום</span>
                        )}
                      </div>
                    ))}
                    {recipients.length > 10 && (
                      <p className="text-gray-400 text-sm">ועוד {recipients.length - 10} נמענים...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Compose Email */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">כתיבת מייל</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">נושא *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="נושא המייל"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תוכן * <span className="text-gray-400 font-normal">(ניתן להשתמש ב-{'{name}'} לשם הנמען)</span>
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="שלום {name},&#10;&#10;תוכן ההודעה..."
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    dir="rtl"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePaymentLink}
                      onChange={(e) => setIncludePaymentLink(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">הוסף קישור לתשלום יתרה (רק למי שטרם שילם)</span>
                  </label>
                </div>
              </div>

              {/* Previous Campaigns */}
              {batches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    קמפיינים קודמים
                  </h3>
                  <div className="space-y-2">
                    {batches.map((batch) => (
                      <div key={batch.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              batch.status === 'COMPLETED' ? 'bg-green-500' :
                              batch.status === 'FAILED' ? 'bg-red-500' :
                              batch.status === 'SENDING' ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'
                            }`} />
                            <div className="text-right">
                              <p className="font-medium text-gray-900 text-sm">{batch.subject}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(batch.createdAt)} • {batch.createdByAdmin}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-right">
                              <span className="text-green-600">{batch.sentCount} נשלחו</span>
                              {batch.failedCount > 0 && (
                                <span className="text-red-600 mr-2">{batch.failedCount} נכשלו</span>
                              )}
                            </div>
                            {expandedBatch === batch.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>
                        {expandedBatch === batch.id && (
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{batch.body}</div>
                            <div className="space-y-1">
                              {batch.recipients.map((r) => (
                                <div key={r.id} className="flex items-center gap-2 text-xs">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    r.status === 'SENT' ? 'bg-green-500' :
                                    r.status === 'FAILED' ? 'bg-red-500' : 'bg-gray-400'
                                  }`} />
                                  <span className="text-gray-700">{r.fullName || 'ללא שם'}</span>
                                  <span className="text-gray-400" dir="ltr">{r.email}</span>
                                  {r.status === 'FAILED' && r.errorMessage && (
                                    <span className="text-red-500">({r.errorMessage})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            סגור
          </button>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!subject.trim() || !body.trim() || recipients.length === 0 || !resendConfigured || sending}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              שלח מייל תפוצה
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">לשלוח ל-{recipients.length} נמענים?</span>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                ביטול
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    אישור שליחה
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
