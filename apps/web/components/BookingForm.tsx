'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitBooking } from '@/app/actions/booking'
import { BookingCardCapture, type CardCaptureResult } from '@/components/BookingCardCapture'
import { ADD_ONS, PUBLIC_ADD_ON_IDS } from '@/lib/pricing/addOns'
import {
  SERVICES_BY_CATEGORY,
  SERVICE_LABELS,
  applySurcharges,
  calculateEstimate,
  getSizeOptions,
  mapSqftToSizeKey,
} from '@/lib/pricing/engine'
import type {
  EstimateResult,
  Frequency,
  PropertyCategory,
  SelectedAddOn,
  ServiceKey,
  SizeOption,
} from '@/lib/pricing/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeWindow = 'Morning (8am–12pm)' | 'Afternoon (12pm–4pm)' | 'Flexible'

interface FormData {
  category: PropertyCategory
  serviceKey: ServiceKey | ''
  sizeKey: string
  sqftInput: string
  addOns: SelectedAddOn[]
  date: string
  timeWindow: TimeWindow | ''
  frequency: Frequency | ''
  emergencySameDay: boolean
  address: string
  unit: string
  city: string
  state: string
  zip: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  stripeCustomerId: string
  stripePaymentMethodId: string
  customerId: string
}

// ─── Static metadata ──────────────────────────────────────────────────────────

const STR_SERVICE_META: Record<ServiceKey, { tagline: string; group: string }> = {
  str_turnover: { tagline: 'Full turnover — inspection, cleaning, restocking, photo report.', group: 'Cleaning' },
  str_deep: { tagline: 'Everything in Regular plus appliances, grout, baseboards, and more.', group: 'Cleaning' },
  str_seasonal: { tagline: 'Most comprehensive — Regular + Deep + preventive maintenance.', group: 'Cleaning' },
  str_startup: { tagline: 'One-time deep clean, supply setup, and guest-ready styling for new listings.', group: 'One-Time' },
  str_subscription_standard: { tagline: 'Five turnovers per month, same crew, priority scheduling.', group: 'Subscription' },
  str_subscription_premium: { tagline: 'Everything in Standard plus zero-friction scheduling and a dedicated account manager.', group: 'Subscription' },
  residential_first_visit: { tagline: '', group: '' },
  residential_recurring: { tagline: '', group: '' },
  move_in_out: { tagline: '', group: '' },
  post_construction: { tagline: '', group: '' },
}

const SERVICE_GROUPS = ['Cleaning', 'One-Time', 'Subscription'] as const

const RESIDENTIAL_FREQUENCIES: { value: Frequency; tagline: string }[] = [
  { value: 'Weekly', tagline: 'Cheapest per-visit rate — our most popular plan.' },
  { value: 'Bi-weekly', tagline: 'A balance of upkeep and cost.' },
  { value: 'Monthly', tagline: 'Lightest touch, highest per-visit rate.' },
]

const STEP_TITLES = ['', 'Service Type', 'Property Size', 'Schedule', 'Address', 'Contact', 'Review & Book']
const TOTAL_STEPS = 6

function isStepValid(step: number, data: FormData): boolean {
  switch (step) {
    case 1: return data.category === 'residential' ? !!data.frequency : !!data.serviceKey
    case 2: return !!data.sizeKey
    case 3: return !!data.date && !!data.timeWindow
    case 4: return !!data.address.trim() && !!data.city.trim() && !!data.state.trim() && !!data.zip.trim()
    case 5: return !!data.firstName.trim() && !!data.lastName.trim() && !!data.email.trim() && !!data.phone.trim()
    default: return true
  }
}

function stepSummary(step: number, data: FormData): string {
  switch (step) {
    case 1:
      return data.category === 'residential' ? `Residential · ${data.frequency}` : SERVICE_LABELS[data.serviceKey as ServiceKey]
    case 2: {
      const ext = data.addOns.length ? ` · ${data.addOns.length} add-on${data.addOns.length !== 1 ? 's' : ''}` : ''
      return `${data.sizeKey}${ext}`
    }
    case 3: {
      const d = new Date(data.date + 'T12:00')
      const ds = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${ds} · ${data.timeWindow}`
    }
    case 4:
      return `${data.address}${data.unit ? ` #${data.unit}` : ''}, ${data.city}, ${data.state} ${data.zip}`
    case 5:
      return `${data.firstName} ${data.lastName} · ${data.email}`
    default: return ''
  }
}

// ─── Estimate helper (shared by Step6 + BookingSummary) ──────────────────────

interface Estimates {
  primaryLabel: string
  primary: EstimateResult
  secondaryLabel?: string
  secondary?: EstimateResult
}

function getEstimates(data: FormData): Estimates {
  if (data.category === 'residential') {
    const primary = calculateEstimate({
      category: 'residential',
      serviceKey: 'residential_first_visit',
      sizeKey: data.sizeKey || null,
      addOns: data.addOns,
      emergencySameDay: data.emergencySameDay,
      serviceDate: data.date,
    })
    const secondary = calculateEstimate({
      category: 'residential',
      serviceKey: 'residential_recurring',
      sizeKey: data.sizeKey || null,
      frequency: data.frequency || undefined,
      addOns: [],
    })
    return {
      primaryLabel: 'First-visit deep clean (one-time)',
      primary,
      secondaryLabel: data.frequency ? `Then, ${data.frequency.toLowerCase()} visits` : 'Then, recurring visits',
      secondary,
    }
  }

  const serviceKey = (data.serviceKey || 'str_turnover') as ServiceKey
  const primary = calculateEstimate({
    category: 'str',
    serviceKey,
    sizeKey: data.sizeKey || null,
    addOns: data.addOns,
    emergencySameDay: data.emergencySameDay,
    serviceDate: data.date,
  })
  return { primaryLabel: data.serviceKey ? SERVICE_LABELS[serviceKey] : '', primary }
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString()}`
}

function EstimateLine({ result }: { result: EstimateResult }) {
  if (result.contactForQuote) {
    return <span className="font-marcellus text-sm opacity-50">Contact us for a custom quote</span>
  }
  if (!result.range) {
    return <span className="font-marcellus text-sm">{formatMoney(result.subtotal)}</span>
  }
  return <span className="font-marcellus text-sm">{formatMoney(result.range.low)}–{formatMoney(result.range.high)}</span>
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-marcellus text-xs opacity-40 mb-3 uppercase tracking-widest">{children}</p>
  )
}

const inputCls = 'font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-full focus:outline-none focus:border-dark-brown transition-colors placeholder:opacity-30'

// ─── Step content ─────────────────────────────────────────────────────────────

function CategoryToggle({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const options: { value: PropertyCategory; label: string }[] = [
    { value: 'str', label: 'Short-Term Rental' },
    { value: 'residential', label: 'Residential Home' },
  ]
  return (
    <div className="flex gap-3 mb-8">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => update({ category: opt.value, serviceKey: '', sizeKey: '', sqftInput: '', addOns: [], frequency: '' })}
          className={[
            'px-6 py-3 rounded-full border font-marcellus text-sm transition-all duration-150 cursor-pointer',
            data.category === opt.value ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Step1({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  if (data.category === 'residential') {
    return (
      <div className="flex flex-col gap-6">
        <CategoryToggle data={data} update={update} />
        <p className="font-marcellus text-sm opacity-50 max-w-lg">
          Residential service starts with a required first-visit deep clean, then settles into recurring
          cleanings at the frequency you choose below.
        </p>
        <div className="flex flex-col gap-2 max-w-lg">
          {RESIDENTIAL_FREQUENCIES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => update({ frequency: f.value })}
              className={[
                'text-left px-6 py-5 rounded-2xl border transition-all duration-200 cursor-pointer',
                data.frequency === f.value ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35',
              ].join(' ')}
            >
              <span className="font-marcellus text-base">{f.value}</span>
              <p className="font-marcellus text-sm opacity-40 mt-1">{f.tagline}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const strServices = SERVICES_BY_CATEGORY.str
  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col gap-6 flex-1">
        <CategoryToggle data={data} update={update} />
        {SERVICE_GROUPS.map((group) => (
          <div key={group}>
            <p className="font-marcellus text-xs opacity-35 uppercase tracking-widest mb-2">{group}</p>
            <div className="flex flex-col gap-2">
              {strServices
                .filter((key) => STR_SERVICE_META[key].group === group)
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update({ serviceKey: key, sizeKey: '', sqftInput: '' })}
                    className={[
                      'text-left px-6 py-5 rounded-2xl border transition-all duration-200 cursor-pointer',
                      data.serviceKey === key ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35',
                    ].join(' ')}
                  >
                    <span className="font-marcellus text-base">{SERVICE_LABELS[key]}</span>
                    <p className="font-marcellus text-sm opacity-40 mt-1">{STR_SERVICE_META[key].tagline}</p>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddOnRow({ addOn, selected, onToggle, onQtyChange }: {
  addOn: (typeof ADD_ONS)[number]
  selected: SelectedAddOn | undefined
  onToggle: () => void
  onQtyChange: (qty: number) => void
}) {
  const isSelected = !!selected
  return (
    <div
      className={[
        'px-5 py-3 rounded-xl border font-marcellus text-sm transition-all duration-150 flex items-center justify-between gap-4',
        isSelected ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35',
      ].join(' ')}
    >
      <button type="button" onClick={onToggle} className="text-left flex-1 cursor-pointer bg-transparent border-none p-0 font-marcellus">
        {addOn.name} <span className="opacity-40 text-xs">— {addOn.note}</span>
      </button>
      <div className="flex items-center gap-3 flex-shrink-0">
        {isSelected && addOn.qtyRange && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQtyChange(Math.max(addOn.qtyRange ? addOn.qtyRange[0] : 1, (selected?.qty ?? 1) - 1))}
              className="w-6 h-6 rounded-full border border-dark-brown/25 flex items-center justify-center cursor-pointer bg-transparent"
            >
              −
            </button>
            <span className="w-5 text-center">{selected?.qty ?? 1}</span>
            <button
              type="button"
              onClick={() => onQtyChange(Math.min(addOn.qtyRange ? addOn.qtyRange[1] : 99, (selected?.qty ?? 1) + 1))}
              className="w-6 h-6 rounded-full border border-dark-brown/25 flex items-center justify-center cursor-pointer bg-transparent"
            >
              +
            </button>
          </div>
        )}
        <span className="opacity-50">{addOn.price === 0 ? 'Included' : `$${addOn.price}${addOn.unit !== 'flat' && addOn.unit !== 'included' ? ` / ${addOn.unit}` : ''}`}</span>
      </div>
    </div>
  )
}

function Step2({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const effectiveServiceKey: ServiceKey = data.category === 'str'
    ? (data.serviceKey as ServiceKey)
    : 'residential_first_visit'
  const sizeOptions: SizeOption[] = effectiveServiceKey ? getSizeOptions(data.category, effectiveServiceKey) : []

  function handleSqftChange(v: string) {
    update({ sqftInput: v })
    const n = parseInt(v, 10)
    if (!isNaN(n) && effectiveServiceKey) {
      const key = mapSqftToSizeKey(data.category, effectiveServiceKey, n)
      if (key) update({ sizeKey: key })
    }
  }

  function toggleAddOn(id: string) {
    const exists = data.addOns.find((a) => a.id === id)
    update({
      addOns: exists ? data.addOns.filter((a) => a.id !== id) : [...data.addOns, { id, qty: 1 }],
    })
  }

  function setAddOnQty(id: string, qty: number) {
    update({ addOns: data.addOns.map((a) => (a.id === id ? { ...a, qty } : a)) })
  }

  const publicAddOns = ADD_ONS.filter((a) => PUBLIC_ADD_ON_IDS.has(a.id))
  const addOnCategories = Array.from(new Set(publicAddOns.map((a) => a.category)))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Label>Property size</Label>
        <div className="mb-3">
          <input
            type="number"
            inputMode="numeric"
            value={data.sqftInput}
            onChange={(e) => handleSqftChange(e.target.value)}
            placeholder="Enter square footage (optional) to auto-select"
            className={`${inputCls} max-w-xs`}
          />
        </div>
        <div className="flex flex-col gap-2">
          {sizeOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => update({ sizeKey: opt.key })}
              className={[
                'text-left px-5 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between',
                data.sizeKey === opt.key ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35',
              ].join(' ')}
            >
              <span className="font-marcellus text-sm">{opt.label}</span>
              <span className="font-marcellus text-sm opacity-40">
                {opt.price !== null ? `$${opt.price.toLocaleString()}` : 'Custom quote'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Add-ons (optional)</Label>
        <div className="flex flex-col gap-4">
          {addOnCategories.map((cat) => (
            <div key={cat}>
              <p className="font-marcellus text-xs opacity-35 uppercase tracking-wider mb-2">{cat}</p>
              <div className="flex flex-col gap-2">
                {publicAddOns.filter((a) => a.category === cat).map((addOn) => (
                  <AddOnRow
                    key={addOn.id}
                    addOn={addOn}
                    selected={data.addOns.find((a) => a.id === addOn.id)}
                    onToggle={() => toggleAddOn(addOn.id)}
                    onQtyChange={(qty) => setAddOnQty(addOn.id, qty)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step3({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const today = new Date().toISOString().split('T')[0]
  const times: TimeWindow[] = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Flexible']
  const freqs: Frequency[] = ['One-time', 'Weekly', 'Bi-weekly', 'Monthly']
  const surcharges = applySurcharges({ emergencySameDay: data.emergencySameDay, serviceDate: data.date })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Label>Preferred date</Label>
        <input
          type="date"
          value={data.date}
          min={today}
          onChange={(e) => update({ date: e.target.value })}
          className="font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-44 focus:outline-none focus:border-dark-brown transition-colors"
        />
      </div>
      <div>
        <Label>Arrival window</Label>
        <div className="flex flex-wrap gap-3">
          {times.map((t) => (
            <button
              key={t} type="button"
              onClick={() => update({ timeWindow: t })}
              className={[
                'px-5 py-2.5 rounded-full border font-marcellus text-sm transition-all duration-150 cursor-pointer',
                data.timeWindow === t ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50',
              ].join(' ')}
            >{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={data.emergencySameDay}
            onChange={(e) => update({ emergencySameDay: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="font-marcellus text-sm">I need this today (+$50 emergency call-out)</span>
        </label>
      </div>
      {data.category === 'str' && (
        <div>
          <Label>Frequency</Label>
          <div className="flex flex-wrap gap-3">
            {freqs.map((f) => (
              <button
                key={f} type="button"
                onClick={() => update({ frequency: f })}
                className={[
                  'px-5 py-2.5 rounded-full border font-marcellus text-sm transition-all duration-150 cursor-pointer',
                  data.frequency === f ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50',
                ].join(' ')}
              >{f}</button>
            ))}
          </div>
        </div>
      )}
      {data.category === 'residential' && (
        <p className="font-marcellus text-sm opacity-40">Frequency: {data.frequency} (set in Step 1)</p>
      )}
      {surcharges.breakdown.length > 0 && (
        <div className="flex flex-col gap-1">
          {surcharges.breakdown.map((s) => (
            <p key={s.label} className="font-marcellus text-xs opacity-50">+ ${s.amount} {s.label}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function Step4({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <input type="text" value={data.address} onChange={e => update({ address: e.target.value })} placeholder="Street address" className={inputCls} />
      <input type="text" value={data.unit} onChange={e => update({ unit: e.target.value })} placeholder="Unit / Apt (optional)" className={`${inputCls} w-44`} />
      <div className="grid grid-cols-[1fr_56px_80px] gap-5 items-end">
        <input type="text" value={data.city} onChange={e => update({ city: e.target.value })} placeholder="City" className={inputCls} />
        <input type="text" value={data.state} onChange={e => update({ state: e.target.value })} placeholder="State" className={inputCls} maxLength={2} />
        <input type="text" value={data.zip} onChange={e => update({ zip: e.target.value })} placeholder="ZIP" className={inputCls} maxLength={10} />
      </div>
    </div>
  )
}

function Step5({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const cardSaved = !!data.stripePaymentMethodId
  const validContact = !!data.firstName.trim() && !!data.lastName.trim() && !!data.email.trim() && !!data.phone.trim()

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-5">
        <input type="text" value={data.firstName} onChange={e => update({ firstName: e.target.value })} placeholder="First name" className={inputCls} />
        <input type="text" value={data.lastName} onChange={e => update({ lastName: e.target.value })} placeholder="Last name" className={inputCls} />
      </div>
      <input type="email" value={data.email} onChange={e => update({ email: e.target.value })} placeholder="Email address" className={inputCls} />
      <input type="tel" value={data.phone} onChange={e => update({ phone: e.target.value })} placeholder="Phone number" className={inputCls} />

      {validContact && !cardSaved && (
        <div>
          <Label>Save a card (optional)</Label>
          <p className="font-marcellus text-xs opacity-40 mb-3">
            Saving a card lets us bill add-ons or upcharges after the job without contacting you again. You can skip this.
          </p>
          <BookingCardCapture
            email={data.email}
            firstName={data.firstName}
            lastName={data.lastName}
            phone={data.phone}
            onSaved={(r: CardCaptureResult) => update({
              stripeCustomerId: r.stripeCustomerId,
              stripePaymentMethodId: r.stripePaymentMethodId,
              customerId: r.customerId,
            })}
            onSkip={() => update({ stripePaymentMethodId: 'skipped' })}
          />
        </div>
      )}
      {cardSaved && data.stripePaymentMethodId !== 'skipped' && (
        <p className="font-marcellus text-sm opacity-50">Card saved.</p>
      )}
    </div>
  )
}

function Step6({ data, update, onSubmit, submitting }: {
  data: FormData; update: (p: Partial<FormData>) => void; onSubmit: () => void; submitting: boolean
}) {
  const { primaryLabel, primary, secondaryLabel, secondary } = getEstimates(data)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-dark-brown/12 px-6 py-5 flex flex-col gap-3">
        <div className="flex justify-between font-marcellus text-sm opacity-50">
          <span>{primaryLabel} — {primary.sizeLabel}</span>
          <EstimateLine result={primary} />
        </div>
        {secondary && (
          <div className="flex justify-between font-marcellus text-sm opacity-50">
            <span>{secondaryLabel}</span>
            <EstimateLine result={secondary} />
          </div>
        )}
        {data.addOns.map((sel) => {
          const opt = ADD_ONS.find((o) => o.id === sel.id)
          if (!opt) return null
          return (
            <div key={sel.id} className="flex justify-between font-marcellus text-sm opacity-50">
              <span>{opt.name}{opt.qtyRange ? ` × ${sel.qty}` : ''}</span>
              <span>${(opt.price * (opt.qtyRange ? sel.qty : 1)).toLocaleString()}</span>
            </div>
          )
        })}
        {primary.surchargeBreakdown.map((s) => (
          <div key={s.label} className="flex justify-between font-marcellus text-sm opacity-50">
            <span>{s.label}</span>
            <span>+${s.amount}</span>
          </div>
        ))}
        <div className="border-t border-dark-brown/12 pt-3 flex justify-between font-marcellus text-base">
          <span>Estimated total</span>
          <EstimateLine result={primary} />
        </div>
        <p className="font-marcellus text-xs opacity-35">
          Final price confirmed after property review. Prices shown are a ±10% estimate.
        </p>
      </div>

      <div>
        <Label>Special instructions (optional)</Label>
        <textarea
          value={data.notes}
          onChange={e => update({ notes: e.target.value })}
          placeholder="Gate codes, parking details, special requests…"
          rows={3}
          className="font-marcellus text-sm bg-transparent border border-dark-brown/20 rounded-xl px-4 py-3 w-full focus:outline-none focus:border-dark-brown transition-colors placeholder:opacity-30 resize-none"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="mt-2 px-14 py-5 rounded-full bg-accent text-dark-brown font-marcellus text-base transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer disabled:cursor-default"
      >
        {submitting ? 'Sending…' : 'Request Booking'}
      </button>
    </div>
  )
}

// ─── Booking summary panel ────────────────────────────────────────────────────

const SummaryIcons = {
  service: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6.5L7.5 2 14 6.5V14H1V6.5Z" />
      <path d="M5 14V9.5H10V14" />
    </svg>
  ),
  addon: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7.5" r="6" />
      <path d="M7.5 4.5v6M4.5 7.5h6" />
    </svg>
  ),
  date: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="13" height="11" rx="1.5" />
      <path d="M1 7h13M5 1v4M10 1v4" />
    </svg>
  ),
  frequency: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 7.5A5.5 5.5 0 0 1 2.1 10M2 7.5A5.5 5.5 0 0 1 12.9 5" />
      <path d="M11 3.5l2 1.5-2 1.5M4 8.5L2 10l2 1.5" />
    </svg>
  ),
}

function SummaryRow({
  icon, label, value, placeholder, sub,
}: {
  icon: keyof typeof SummaryIcons
  label?: string
  value?: string | null
  placeholder?: string
  sub?: { label: string; value: string }[]
}) {
  return (
    <div className="flex gap-3 items-start">
      <span className="mt-0.5 opacity-30 flex-shrink-0">{SummaryIcons[icon]}</span>
      <div className="flex-1 min-w-0">
        {value ? (
          <>
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-marcellus text-sm">{label ?? value}</span>
              {label && value && <span className="font-marcellus text-sm opacity-60 flex-shrink-0">{value}</span>}
            </div>
            {sub && sub.map(s => (
              <div key={s.label} className="flex justify-between items-baseline gap-2 pl-3 mt-1.5">
                <span className="font-marcellus text-xs opacity-40">{s.label}</span>
                <span className="font-marcellus text-xs opacity-40 flex-shrink-0">{s.value}</span>
              </div>
            ))}
          </>
        ) : (
          <span className="font-marcellus text-sm opacity-25">{placeholder ?? '—'}</span>
        )}
      </div>
    </div>
  )
}

function BookingSummary({ data }: { data: FormData }) {
  const { primaryLabel, primary, secondaryLabel, secondary } = getEstimates(data)
  const hasService = data.category === 'residential' ? !!data.frequency : !!data.serviceKey
  const hasSize = !!data.sizeKey

  const dateLabel = data.date
    ? new Date(data.date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="sticky top-8 rounded-2xl border border-dark-brown/12 overflow-hidden bg-stone">

      <div className="border-b border-dark-brown/10 px-6 py-4">
        <p className="font-marcellus text-xs uppercase tracking-[0.2em] opacity-50 text-center">Booking Summary</p>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        <SummaryRow
          icon="service"
          label={hasService ? primaryLabel : undefined}
          value={hasService && !primary.contactForQuote ? (primary.range ? `${formatMoney(primary.range.low)}–${formatMoney(primary.range.high)}` : formatMoney(primary.subtotal)) : (hasService ? '' : null)}
          placeholder="Choose a service…"
          sub={hasSize ? [{ label: primary.sizeLabel ?? '', value: '' }] : undefined}
        />

        {secondary && (
          <SummaryRow
            icon="frequency"
            label={secondaryLabel}
            value={!secondary.contactForQuote ? (secondary.range ? `${formatMoney(secondary.range.low)}–${formatMoney(secondary.range.high)}/mo` : `${formatMoney(secondary.subtotal)}/mo`) : ''}
          />
        )}

        <AnimatePresence>
          {data.addOns.map((sel) => {
            const opt = ADD_ONS.find((o) => o.id === sel.id)
            if (!opt) return null
            return (
              <motion.div
                key={sel.id}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <SummaryRow icon="addon" label={opt.name} value={`$${(opt.price * (opt.qtyRange ? sel.qty : 1)).toLocaleString()}`} />
              </motion.div>
            )
          })}
        </AnimatePresence>

        <SummaryRow
          icon="date"
          value={dateLabel ? `${dateLabel}${data.timeWindow ? ' · ' + data.timeWindow : ''}` : null}
          placeholder="Choose service date…"
        />
      </div>

      <div className="border-t border-dark-brown/10 px-6 py-5 flex flex-col gap-1">
        <div className="flex justify-between items-baseline mt-1">
          <span className="font-marcellus text-sm">Estimated total</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`${primary.subtotal}-${primary.contactForQuote}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={['font-marcellus', hasSize && !primary.contactForQuote ? 'text-2xl' : 'text-base opacity-25'].join(' ')}
            >
              {primary.contactForQuote ? 'Custom quote' : hasSize ? (primary.range ? `${formatMoney(primary.range.low)}–${formatMoney(primary.range.high)}` : formatMoney(primary.subtotal)) : '—'}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="font-marcellus text-xs opacity-30 mt-2 leading-relaxed">
          Final price confirmed after property review.
        </p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const EMPTY: FormData = {
  category: 'str', serviceKey: '', sizeKey: '', sqftInput: '', addOns: [],
  date: '', timeWindow: '', frequency: '', emergencySameDay: false,
  address: '', unit: '', city: '', state: '', zip: '',
  firstName: '', lastName: '', email: '', phone: '', notes: '',
  stripeCustomerId: '', stripePaymentMethodId: '', customerId: '',
}

export function BookingForm({ initialCategory }: { initialCategory?: PropertyCategory }) {
  const [currentStep, setCurrentStep]  = useState(1)
  const [completedSteps, setCompleted] = useState<Set<number>>(new Set())
  const [data, setData]                = useState<FormData>(() => ({ ...EMPTY, category: initialCategory ?? EMPTY.category }))
  const [submitting, setSubmitting]    = useState(false)
  const [submitted, setSubmitted]      = useState(false)
  const [error, setError]              = useState('')

  function update(patch: Partial<FormData>) { setData(prev => ({ ...prev, ...patch })) }

  function completeStep(step: number) {
    setCompleted(prev => new Set([...prev, step]))
    setCurrentStep(step + 1)
  }

  function editStep(step: number) { setCurrentStep(step) }

  async function handleSubmit() {
    setSubmitting(true); setError('')
    try {
      const { primary, secondary } = getEstimates(data)
      const estimatedLow = secondary
        ? (primary.range?.low ?? primary.subtotal) + (secondary.range?.low ?? secondary.subtotal)
        : primary.range?.low ?? primary.subtotal
      const estimatedHigh = secondary
        ? (primary.range?.high ?? primary.subtotal) + (secondary.range?.high ?? secondary.subtotal)
        : primary.range?.high ?? primary.subtotal

      await submitBooking({
        category: data.category,
        serviceKey: data.category === 'residential' ? 'residential_recurring' : (data.serviceKey as string),
        propertySize: data.sizeKey,
        addOns: data.addOns,
        date: data.date,
        timeWindow: data.timeWindow,
        frequency: data.frequency,
        emergencySameDay: data.emergencySameDay,
        address: data.address,
        unit: data.unit,
        city: data.city,
        state: data.state,
        zip: data.zip,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        notes: data.notes,
        estimatedLow,
        estimatedHigh,
        stripeCustomerId: data.stripeCustomerId || undefined,
        stripePaymentMethodId: data.stripePaymentMethodId && data.stripePaymentMethodId !== 'skipped' ? data.stripePaymentMethodId : undefined,
        customerId: data.customerId || undefined,
      })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 text-center"
      >
        <p className="font-marcellus text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] mb-5">Request received.</p>
        <p className="font-marcellus text-base opacity-50 max-w-sm mx-auto leading-relaxed">
          We'll reach out within 2 hours to confirm your booking and finalize any details.
        </p>
      </motion.div>
    )
  }

  const steps = (
    <div className="flex flex-col">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => {
        const isCompleted = completedSteps.has(step)
        const isActive    = currentStep === step
        if (!isCompleted && !isActive) return null

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-dark-brown/10 first:border-t-0"
          >
            <div className="flex items-start justify-between gap-4 py-6">
              <div className="flex items-start gap-4">
                <span className={[
                  'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-marcellus text-xs flex-shrink-0 transition-colors duration-300',
                  isActive ? 'bg-dark-brown text-stone' : 'bg-dark-brown/8 text-dark-brown/40',
                ].join(' ')}>
                  {isCompleted ? '✓' : step}
                </span>
                <div>
                  <p className={['font-marcellus text-base', isActive ? '' : 'opacity-50'].join(' ')}>
                    {STEP_TITLES[step]}
                  </p>
                  {isCompleted && !isActive && (
                    <p className="font-marcellus text-sm opacity-35 mt-0.5">{stepSummary(step, data)}</p>
                  )}
                </div>
              </div>
              {isCompleted && !isActive && (
                <button type="button" onClick={() => editStep(step)}
                  className="font-marcellus text-sm opacity-35 hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none flex-shrink-0 pt-0.5">
                  Edit
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-10 pl-10">
                    {step === 1 && <Step1 data={data} update={update} />}
                    {step === 2 && <Step2 data={data} update={update} />}
                    {step === 3 && <Step3 data={data} update={update} />}
                    {step === 4 && <Step4 data={data} update={update} />}
                    {step === 5 && <Step5 data={data} update={update} />}
                    {step === 6 && <Step6 data={data} update={update} onSubmit={handleSubmit} submitting={submitting} />}

                    {step < TOTAL_STEPS && (
                      <button
                        type="button" onClick={() => completeStep(step)}
                        disabled={!isStepValid(step, data)}
                        className="mt-8 px-12 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-base transition-opacity duration-200 disabled:opacity-25 hover:opacity-75 cursor-pointer disabled:cursor-default"
                      >
                        Continue
                      </button>
                    )}
                    {error && <p className="mt-4 font-marcellus text-sm text-red-600 opacity-80">{error}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <div className="flex gap-12 items-start">
      <div className="flex-1 min-w-0">{steps}</div>
      <div className="hidden lg:block w-[300px] flex-shrink-0">
        <BookingSummary data={data} />
      </div>
    </div>
  )
}
