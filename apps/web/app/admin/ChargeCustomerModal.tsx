'use client'

import { useState } from 'react'
import { chargeCustomer } from '@/app/actions/stripe/chargeCustomer'

export function ChargeCustomerModal({ jobId, customerId, onClose }: {
  jobId?: string
  customerId: string
  onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ status: string; message?: string } | null>(null)

  async function handleCharge() {
    const dollars = parseFloat(amount)
    if (isNaN(dollars) || dollars <= 0) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await chargeCustomer({
        jobId,
        customerId,
        amountCents: Math.round(dollars * 100),
        description: description || 'Additional charge',
      })
      setResult({ status: res.status, message: res.message })
    } catch (err) {
      setResult({ status: 'failed', message: err instanceof Error ? err.message : 'Charge failed' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-stone rounded-2xl border border-dark-brown/12 p-6 w-full max-w-sm flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-marcellus text-lg text-dark-brown">Charge customer</p>

        <div className="flex flex-col gap-1">
          <label className="font-marcellus text-xs opacity-50">Amount (USD)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 focus:outline-none focus:border-dark-brown"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-marcellus text-xs opacity-50">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Damage fee, extra hours"
            className="font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 focus:outline-none focus:border-dark-brown"
          />
        </div>

        {result && (
          <p className={`font-marcellus text-sm ${result.status === 'succeeded' ? 'text-green-700' : 'text-red-600'}`}>
            {result.status === 'succeeded' ? 'Charge succeeded.' : result.message || `Charge ${result.status}.`}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={handleCharge}
            disabled={submitting || !amount}
            className="px-6 py-3 rounded-full bg-dark-brown text-stone font-marcellus text-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Charging…' : 'Charge'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full border border-dark-brown/20 font-marcellus text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
