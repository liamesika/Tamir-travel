'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Users, AlertCircle, CheckCircle, Loader2, Send, RefreshCw } from 'lucide-react'

interface Recipient {
  bookingId: string
  fullName: string
  email: string
  phone: string
  participantsCount: number
  remainingAmount: number
  remainingStatus: string
  remainingEmailSentAt: string | null
  remainingEmailMessageId: string | null
  canSend: boolean
}

interface SendResult {
  bookingId: string
  fullName: string
  email: string
  success: boolean
  messageId?: string
  error?: string
  skipped?: boolean
  skipReason?: string
}

interface SendRemainingEmailsModalProps {
  tripDateId: string
  tripDateLabel: string
  isOpen: boolean
  onClose: () => void
}

export default function SendRemainingEmailsModal({ tripDateId, tripDateLabel, isOpen, onClose }: SendRemainingEmailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [resendingSingle, setResendingSingle] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [summary, setSummary] = useState<{ canSend: number; alreadyPaid: number; previouslySent: number }>({ canSend: 0, alreadyPaid: 0, previouslySent: 0 })
  const [error, setError] = useState<string | null>(null)
  const [sendResults, setSendResults] = useState<SendResult[] | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (isOpen && tripDateId) {
      fetchData()
    }
  }, [isOpen, tripDateId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    setSendResults(null)
    setShowConfirm(false)
    try {
      const res = await fetch(`/api/admin/trip-dates-dashboard/${tripDateId}/send-remaining-emails?unpaidOnly=false`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data')
      }

      setRecipients(data.recipients || [])
      setSummary(data.summary || { canSend: 0, alreadyPaid: 0, previouslySent: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendAll = async () => {
    setSending(true)
    setError(null)
    setSendResults(null)

    try {
      const res = await fetch(`/api/admin/trip-dates-dashboard/${tripDateId}/send-remaining-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unpaidOnly: true })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      setSendResults(data.results.details)
      setShowConfirm(false)

      // Refresh data
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  const handleResendSingle = async (bookingId: string) => {
    setResendingSingle(bookingId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/resend-remaining-email`, {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setResendingSingle(null)
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

  const formatCurrency = (amount: number) => {
    return `₪${(amount / 100).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">שליחת מייל השלמת יתרה</h2>
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
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
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

              {/* Send Results */}
              {sendResults && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-700 font-medium">שליחה הושלמה!</p>
                      <p className="text-green-600 text-sm mt-1">
                        נשלחו: {sendResults.filter(r => r.success).length} |
                        נכשלו: {sendResults.filter(r => !r.success && !r.skipped).length} |
                        דולגו: {sendResults.filter(r => r.skipped).length}
                      </p>
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 mr-8">
                    {sendResults.map((r) => (
                      <div key={r.bookingId} className="flex items-center gap-2 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          r.success ? 'bg-green-500' :
                          r.skipped ? 'bg-gray-400' : 'bg-red-500'
                        }`} />
                        <span className="text-gray-700">{r.fullName}</span>
                        <span className="text-gray-400" dir="ltr">{r.email}</span>
                        {r.skipped && <span className="text-gray-500">({r.skipReason})</span>}
                        {r.error && <span className="text-red-500">({r.error})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{summary.canSend}</div>
                  <div className="text-sm text-green-700">לשליחה</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.alreadyPaid}</div>
                  <div className="text-sm text-blue-700">שילמו כבר</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">{summary.previouslySent}</div>
                  <div className="text-sm text-amber-700">נשלח בעבר</div>
                </div>
              </div>

              {/* Recipients List */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">רשימת נמענים</span>
                </div>
                {recipients.length === 0 ? (
                  <p className="text-gray-500 text-sm">אין נמענים</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {recipients.map((r) => (
                      <div key={r.bookingId} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{r.fullName}</span>
                            <span className="text-xs text-gray-500">({r.participantsCount} משתתפים)</span>
                          </div>
                          <div className="text-sm text-gray-500" dir="ltr">{r.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-green-600">{formatCurrency(r.remainingAmount)}</span>
                            {r.remainingStatus === 'PAID' ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">שולם</span>
                            ) : (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">ממתין</span>
                            )}
                            {r.remainingEmailSentAt && (
                              <span className="text-xs text-gray-400">
                                נשלח: {formatDate(r.remainingEmailSentAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        {r.canSend && (
                          <button
                            onClick={() => handleResendSingle(r.bookingId)}
                            disabled={resendingSingle === r.bookingId}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition disabled:opacity-50"
                          >
                            {resendingSingle === r.bookingId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            {r.remainingEmailSentAt ? 'שלח שוב' : 'שלח'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              disabled={summary.canSend === 0 || sending}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              שלח לכל הממתינים ({summary.canSend})
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">לשלוח ל-{summary.canSend} נמענים?</span>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                ביטול
              </button>
              <button
                onClick={handleSendAll}
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
