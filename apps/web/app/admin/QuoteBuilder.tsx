'use client'

import { useState } from 'react'
import { ADD_ONS } from '@/lib/pricing/addOns'
import { SERVICES_BY_CATEGORY, SERVICE_LABELS, calculateEstimate, getSizeOptions } from '@/lib/pricing/engine'
import type { PropertyCategory, SelectedAddOn, ServiceKey } from '@/lib/pricing/types'
import { createManualJob } from '@/app/actions/admin/createManualJob'

export function QuoteBuilder({ onCreated }: { onCreated?: (jobId: string) => void }) {
  const [category, setCategory] = useState<PropertyCategory>('str')
  const [serviceKey, setServiceKey] = useState<ServiceKey | ''>('')
  const [sizeKey, setSizeKey] = useState('')
  const [addOns, setAddOns] = useState<SelectedAddOn[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState('')

  const effectiveServiceKey = category === 'str' ? (serviceKey as ServiceKey) : 'residential_first_visit'
  const sizeOptions = effectiveServiceKey ? getSizeOptions(category, effectiveServiceKey) : []
  const services = category === 'str' ? SERVICES_BY_CATEGORY.str : SERVICES_BY_CATEGORY.residential

  const estimate = calculateEstimate({
    category,
    serviceKey: (category === 'str' ? serviceKey || 'str_turnover' : 'residential_first_visit') as ServiceKey,
    sizeKey: sizeKey || null,
    addOns,
  })

  function toggleAddOn(id: string) {
    setAddOns((prev) => (prev.find((a) => a.id === id) ? prev.filter((a) => a.id !== id) : [...prev, { id, qty: 1 }]))
  }

  async function handleCreate() {
    if (!sizeKey || !firstName || !lastName || !email) return
    setSubmitting(true)
    try {
      const id = await createManualJob({
        category,
        serviceKey: category === 'str' ? (serviceKey as string) : 'residential_first_visit',
        propertySize: sizeKey,
        addOns,
        firstName,
        lastName,
        email,
        phone,
        quotedTotal: estimate.subtotal,
      })
      setCreatedId(id)
      onCreated?.(id)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-dark-brown/12 p-6">
      <p className="font-marcellus text-lg">Build a quote</p>

      <div className="flex gap-3">
        {(['str', 'residential'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => { setCategory(c); setServiceKey(''); setSizeKey('') }}
            className={`px-5 py-2 rounded-full border font-marcellus text-sm cursor-pointer transition-colors ${category === c ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50'}`}
          >
            {c === 'str' ? 'STR' : 'Residential'}
          </button>
        ))}
      </div>

      {category === 'str' && (
        <div className="flex flex-wrap gap-2">
          {services.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setServiceKey(key); setSizeKey('') }}
              className={`px-4 py-2 rounded-full border font-marcellus text-xs cursor-pointer transition-colors ${serviceKey === key ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50'}`}
            >
              {SERVICE_LABELS[key]}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {sizeOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSizeKey(opt.key)}
            className={`px-4 py-2 rounded-full border font-marcellus text-xs cursor-pointer transition-colors ${sizeKey === opt.key ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50'}`}
          >
            {opt.label}{opt.price !== null ? ` — $${opt.price}` : ''}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {ADD_ONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => toggleAddOn(a.id)}
            className={`px-3 py-1.5 rounded-full border font-marcellus text-xs cursor-pointer transition-colors ${addOns.find((s) => s.id === a.id) ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50'}`}
          >
            {a.name} (${a.price})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
      </div>

      <p className="font-marcellus text-base">
        Estimate: {estimate.contactForQuote ? 'Custom quote' : `$${estimate.subtotal.toLocaleString()}`}
      </p>

      <button
        type="button"
        onClick={handleCreate}
        disabled={submitting || !sizeKey || !firstName || !lastName || !email}
        className="self-start px-8 py-3 rounded-full bg-accent text-dark-brown font-marcellus text-sm disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'Creating…' : 'Create job'}
      </button>
      {createdId && <p className="font-marcellus text-sm opacity-50">Created job {createdId}.</p>}
    </div>
  )
}
