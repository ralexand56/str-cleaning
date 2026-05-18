'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitBooking } from '@/app/actions/booking'

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = 'Regular Turnover' | 'Deep Cleaning' | 'Seasonal Cleaning' | 'StartUp Service' | 'Standard Subscription' | 'Premium Care'
type PropertySize = 'Studio / 1b1b' | '2b 1.5b' | '2b 2b' | '3b 2b' | '3b 2.5b' | '4b 3b' | '5b 4b' | '5b 5b+'
type TimeWindow  = 'Morning (8am–12pm)' | 'Afternoon (12pm–4pm)' | 'Flexible'
type Frequency   = 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly'

interface FormData {
  serviceType:  ServiceType | ''
  propertySize: PropertySize | ''
  extras:       string[]
  date:         string
  timeWindow:   TimeWindow | ''
  frequency:    Frequency | ''
  address:      string
  unit:         string
  city:         string
  state:        string
  zip:          string
  firstName:    string
  lastName:     string
  email:        string
  phone:        string
  notes:        string
}

// ─── Pricing tables ───────────────────────────────────────────────────────────

const PROPERTY_SIZES: { label: PropertySize; sqft: string }[] = [
  { label: 'Studio / 1b1b', sqft: '≤ 800 sqft' },
  { label: '2b 1.5b',       sqft: '800–1,200 sqft' },
  { label: '2b 2b',         sqft: '800–1,200 sqft' },
  { label: '3b 2b',         sqft: '1,200–1,500 sqft' },
  { label: '3b 2.5b',       sqft: '1,500–2,000 sqft' },
  { label: '4b 3b',         sqft: '2,000–2,500 sqft' },
  { label: '5b 4b',         sqft: '2,500–3,000 sqft' },
  { label: '5b 5b+',        sqft: '3,000+ sqft' },
]

const PRICING: Record<PropertySize, Record<ServiceType, number>> = {
  'Studio / 1b1b': { 'Regular Turnover': 175,  'Deep Cleaning': 265,  'Seasonal Cleaning': 1095, 'StartUp Service': 895,  'Standard Subscription': 875,  'Premium Care': 1125 },
  '2b 1.5b':       { 'Regular Turnover': 225,  'Deep Cleaning': 335,  'Seasonal Cleaning': 1295, 'StartUp Service': 895,  'Standard Subscription': 1125, 'Premium Care': 1375 },
  '2b 2b':         { 'Regular Turnover': 240,  'Deep Cleaning': 425,  'Seasonal Cleaning': 1495, 'StartUp Service': 895,  'Standard Subscription': 1200, 'Premium Care': 1500 },
  '3b 2b':         { 'Regular Turnover': 265,  'Deep Cleaning': 475,  'Seasonal Cleaning': 1595, 'StartUp Service': 895,  'Standard Subscription': 1325, 'Premium Care': 1625 },
  '3b 2.5b':       { 'Regular Turnover': 315,  'Deep Cleaning': 555,  'Seasonal Cleaning': 1795, 'StartUp Service': 895,  'Standard Subscription': 1575, 'Premium Care': 1925 },
  '4b 3b':         { 'Regular Turnover': 355,  'Deep Cleaning': 625,  'Seasonal Cleaning': 2395, 'StartUp Service': 1195, 'Standard Subscription': 1775, 'Premium Care': 2175 },
  '5b 4b':         { 'Regular Turnover': 430,  'Deep Cleaning': 865,  'Seasonal Cleaning': 3195, 'StartUp Service': 1195, 'Standard Subscription': 2150, 'Premium Care': 2600 },
  '5b 5b+':        { 'Regular Turnover': 495,  'Deep Cleaning': 995,  'Seasonal Cleaning': 3695, 'StartUp Service': 1195, 'Standard Subscription': 2475, 'Premium Care': 2975 },
}

type AtAGlanceRow = { label: string; value: string }

const AT_A_GLANCE: Record<ServiceType, { rows: AtAGlanceRow[]; note?: string }> = {
  'Regular Turnover': {
    rows: [
      { label: 'Frequency',     value: 'After every checkout' },
      { label: 'Time on site',  value: '2–5 hrs · 1 cleaner' },
      { label: 'Crew',          value: 'Professional, background-checked' },
      { label: 'Price range',   value: '$115 – $345 per clean' },
      { label: 'Depends on',    value: 'Bedrooms, bathrooms, sq ft' },
    ],
  },
  'Deep Cleaning': {
    rows: [
      { label: 'Frequency',     value: 'Every 3–6 months' },
      { label: 'Time on site',  value: 'Half / full day · 2 cleaners' },
      { label: 'Tiered rate',   value: '1.5× / 1.75× / 2× of Regular' },
      { label: 'Price range',   value: '$265 – $995 per visit' },
      { label: 'Best for',      value: 'Post-heavy-use, owner stays' },
    ],
  },
  'Seasonal Cleaning': {
    rows: [
      { label: 'Frequency',     value: '2–3× per year' },
      { label: 'Time on site',  value: '1–2 days · 2 + contractors' },
      { label: 'Cadence',       value: 'Spring + fall is most common' },
      { label: 'Price range',   value: '$1,095 – $3,695 per visit' },
      { label: 'Includes',      value: 'Preventive maintenance report' },
    ],
  },
  'StartUp Service': {
    rows: [
      { label: 'Type',          value: 'One-time onboarding' },
      { label: 'Includes',      value: 'Deep clean, supply setup, styling' },
      { label: 'Under 2,000 sf', value: '$895 flat' },
      { label: 'Over 2,000 sf',  value: '$1,195 flat' },
      { label: 'Optional',      value: 'Extra cleaning $50/hr · Organizing $70/hr' },
    ],
    note: 'Flat fee — no per-clean rate applies.',
  },
  'Standard Subscription': {
    rows: [
      { label: 'Includes',      value: '5 turnovers per month' },
      { label: 'Scheduling',    value: 'Priority over one-off bookings' },
      { label: 'Add-ons',       value: '10% off' },
      { label: 'Billing',       value: 'Monthly · predictable cash flow' },
      { label: 'Pricing',       value: 'Per-clean rate × 5 / month' },
    ],
  },
  'Premium Care': {
    rows: [
      { label: 'Includes',      value: 'Everything in Standard, plus:' },
      { label: 'Add-ons',       value: '15% off (vs 10%)' },
      { label: 'Cancellation',  value: 'No fee up to 12 hrs notice' },
      { label: 'Scheduling',    value: 'Top-of-queue on short notice' },
      { label: 'Support',       value: 'Dedicated account manager' },
    ],
    note: 'Standard rate + $250–$500 / month based on property size.',
  },
}

const SERVICE_OPTIONS: { type: ServiceType; tagline: string; group: string }[] = [
  { type: 'Regular Turnover',      tagline: 'Full turnover — inspection, cleaning, restocking, photo report.',                      group: 'Cleaning' },
  { type: 'Deep Cleaning',         tagline: 'Everything in Regular plus appliances, grout, baseboards, and more.',                  group: 'Cleaning' },
  { type: 'Seasonal Cleaning',     tagline: 'Most comprehensive — Regular + Deep + preventive maintenance.',                        group: 'Cleaning' },
  { type: 'StartUp Service',       tagline: 'One-time deep clean, supply setup, and guest-ready styling for new listings.',         group: 'One-Time' },
  { type: 'Standard Subscription', tagline: 'Five turnovers per month, same crew, priority scheduling, 10% off add-ons.',          group: 'Subscription' },
  { type: 'Premium Care',          tagline: 'Everything in Standard plus zero-friction scheduling and a dedicated account manager.', group: 'Subscription' },
]

const EXTRA_OPTIONS: { label: string; price: string; note: string }[] = [
  { label: 'Full Fridge Cleaning',         price: '$30',  note: 'Leftovers, spills, sorting & disposal' },
  { label: 'Oven Interior Deep Clean',     price: '$30',  note: 'Heavy grease / soiling' },
  { label: 'Stove Deep Clean',             price: '$15',  note: 'Burners + grease removal' },
  { label: 'Pet Hair Removal',             price: '$30',  note: 'Vacuum only' },
  { label: 'Pet Waste Removal',            price: '$30',  note: 'Yard, patio, lawn' },
  { label: 'Grill Deep Clean',             price: '$85',  note: 'Grates, drip tray, ash, polish' },
  { label: 'Wash & Dry Laundry',           price: '$20',  note: 'Per load, light items' },
  { label: 'Windows (inside + outside)',   price: '$10',  note: 'Per window, both sides' },
  { label: 'Ozone Odor Removal',           price: '$50',  note: 'Per hour, min 4 hrs, vacant property' },
  { label: 'Extra Trash Removal',          price: '$20',  note: 'Per 13-gal bag when bins are full' },
]

const STARTUP_FLAT: Record<PropertySize, number> = {
  'Studio / 1b1b': 895, '2b 1.5b': 895, '2b 2b': 895, '3b 2b': 895, '3b 2.5b': 895,
  '4b 3b': 1195, '5b 4b': 1195, '5b 5b+': 1195,
}

function isStartUp(t: ServiceType | ''): boolean { return t === 'StartUp Service' }

function calcTotal(data: FormData): number {
  if (!data.serviceType || !data.propertySize) return 0
  const base = isStartUp(data.serviceType)
    ? STARTUP_FLAT[data.propertySize]
    : PRICING[data.propertySize][data.serviceType]
  const extras = data.extras.reduce((sum, label) => {
    const opt = EXTRA_OPTIONS.find(o => o.label === label)
    if (!opt) return sum
    const n = parseInt(opt.price.replace(/[^0-9]/g, ''))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
  return base + extras
}

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_TITLES = ['', 'Service Type', 'Property Size', 'Schedule', 'Address', 'Contact', 'Review & Book']
const TOTAL_STEPS = 6

function isStepValid(step: number, data: FormData): boolean {
  switch (step) {
    case 1: return !!data.serviceType
    case 2: return !!data.propertySize
    case 3: return !!data.date && !!data.timeWindow && !!data.frequency
    case 4: return !!data.address.trim() && !!data.city.trim() && !!data.state.trim() && !!data.zip.trim()
    case 5: return !!data.firstName.trim() && !!data.lastName.trim() && !!data.email.trim() && !!data.phone.trim()
    default: return true
  }
}

function stepSummary(step: number, data: FormData): string {
  switch (step) {
    case 1: return data.serviceType
    case 2: {
      const ext = data.extras.length ? ` · ${data.extras.length} add-on${data.extras.length !== 1 ? 's' : ''}` : ''
      return `${data.propertySize}${ext}`
    }
    case 3: {
      const d  = new Date(data.date + 'T12:00')
      const ds = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${ds} · ${data.timeWindow} · ${data.frequency}`
    }
    case 4:
      return `${data.address}${data.unit ? ` #${data.unit}` : ''}, ${data.city}, ${data.state} ${data.zip}`
    case 5:
      return `${data.firstName} ${data.lastName} · ${data.email}`
    default: return ''
  }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-marcellus text-xs opacity-40 mb-3 uppercase tracking-widest">{children}</p>
  )
}

const inputCls = 'font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-full focus:outline-none focus:border-dark-brown transition-colors placeholder:opacity-30'

// ─── Step content ─────────────────────────────────────────────────────────────

function AtAGlanceSidebar({ type }: { type: ServiceType }) {
  const info = AT_A_GLANCE[type]
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-dark-brown/12 bg-stone/60 px-5 py-5 flex flex-col gap-2.5 min-w-[220px]"
    >
      <p className="font-marcellus text-xs opacity-40 uppercase tracking-widest mb-1">At a glance</p>
      {info.rows.map(row => (
        <div key={row.label} className="flex flex-col gap-0.5">
          <span className="font-marcellus text-xs opacity-35 uppercase tracking-wider">{row.label}</span>
          <span className="font-marcellus text-sm opacity-80">{row.value}</span>
        </div>
      ))}
      {info.note && (
        <p className="font-marcellus text-xs opacity-35 mt-1 border-t border-dark-brown/10 pt-2">{info.note}</p>
      )}
    </motion.div>
  )
}

const SERVICE_GROUPS = ['Cleaning', 'One-Time', 'Subscription'] as const

function Step1({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col gap-6 flex-1">
        {SERVICE_GROUPS.map(group => (
          <div key={group}>
            <p className="font-marcellus text-xs opacity-35 uppercase tracking-widest mb-2">{group}</p>
            <div className="flex flex-col gap-2">
              {SERVICE_OPTIONS.filter(s => s.group === group).map(svc => (
                <button
                  key={svc.type}
                  type="button"
                  onClick={() => update({ serviceType: svc.type })}
                  className={[
                    'text-left px-6 py-5 rounded-2xl border transition-all duration-200 cursor-pointer',
                    data.serviceType === svc.type
                      ? 'border-dark-brown bg-dark-brown/5'
                      : 'border-dark-brown/15 hover:border-dark-brown/35',
                  ].join(' ')}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-marcellus text-base">{svc.type}</span>
                    {data.propertySize && (
                      <span className="font-marcellus text-sm opacity-40 flex-shrink-0">
                        ${(isStartUp(svc.type) ? STARTUP_FLAT[data.propertySize] : PRICING[data.propertySize][svc.type]).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="font-marcellus text-sm opacity-40 mt-1">{svc.tagline}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {data.serviceType && (
          <div className="hidden md:block w-[240px] flex-shrink-0 sticky top-4">
            <AtAGlanceSidebar key={data.serviceType} type={data.serviceType} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step2({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  function toggleExtra(label: string) {
    update({
      extras: data.extras.includes(label)
        ? data.extras.filter(e => e !== label)
        : [...data.extras, label],
    })
  }
  return (
    <div className="flex gap-6 items-start">
    <div className="flex flex-col gap-8 flex-1">
      <div>
        <Label>Property size</Label>
        <div className="flex flex-col gap-2">
          {PROPERTY_SIZES.map(({ label, sqft }) => {
            const price = data.serviceType ? PRICING[label][data.serviceType] : null
            return (
              <button
                key={label}
                type="button"
                onClick={() => update({ propertySize: label })}
                className={[
                  'text-left px-5 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between',
                  data.propertySize === label
                    ? 'border-dark-brown bg-dark-brown/5'
                    : 'border-dark-brown/15 hover:border-dark-brown/35',
                ].join(' ')}
              >
                <span className="font-marcellus text-sm">{label}</span>
                <span className="font-marcellus text-sm opacity-40">
                  {sqft}{price ? ` · $${price.toLocaleString()}` : ''}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <Label>Add-ons (optional)</Label>
        <div className="flex flex-col gap-2">
          {EXTRA_OPTIONS.map(({ label, price, note }) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleExtra(label)}
              className={[
                'text-left px-5 py-3 rounded-xl border font-marcellus text-sm transition-all duration-150 cursor-pointer flex items-center justify-between gap-4',
                data.extras.includes(label)
                  ? 'border-dark-brown bg-dark-brown/5'
                  : 'border-dark-brown/15 hover:border-dark-brown/35',
              ].join(' ')}
            >
              <span>{label} <span className="opacity-40 text-xs">— {note}</span></span>
              <span className="opacity-50 flex-shrink-0">{price}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
    <AnimatePresence mode="wait">
      {data.serviceType && (
        <div className="hidden md:block w-[240px] flex-shrink-0 sticky top-4">
          <AtAGlanceSidebar key={data.serviceType} type={data.serviceType} />
        </div>
      )}
    </AnimatePresence>
    </div>
  )
}

function Step3({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const today  = new Date().toISOString().split('T')[0]
  const times: TimeWindow[] = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Flexible']
  const freqs: Frequency[]  = ['One-time', 'Weekly', 'Bi-weekly', 'Monthly']
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Label>Preferred date</Label>
        <input
          type="date"
          value={data.date}
          min={today}
          onChange={e => update({ date: e.target.value })}
          className="font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-44 focus:outline-none focus:border-dark-brown transition-colors"
        />
      </div>
      <div>
        <Label>Arrival window</Label>
        <div className="flex flex-wrap gap-3">
          {times.map(t => (
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
        <Label>Frequency</Label>
        <div className="flex flex-wrap gap-3">
          {freqs.map(f => (
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
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-5">
        <input type="text" value={data.firstName} onChange={e => update({ firstName: e.target.value })} placeholder="First name" className={inputCls} />
        <input type="text" value={data.lastName} onChange={e => update({ lastName: e.target.value })} placeholder="Last name" className={inputCls} />
      </div>
      <input type="email" value={data.email} onChange={e => update({ email: e.target.value })} placeholder="Email address" className={inputCls} />
      <input type="tel" value={data.phone} onChange={e => update({ phone: e.target.value })} placeholder="Phone number" className={inputCls} />
    </div>
  )
}

function Step6({ data, update, onSubmit, submitting }: {
  data: FormData; update: (p: Partial<FormData>) => void; onSubmit: () => void; submitting: boolean
}) {
  const base  = data.serviceType && data.propertySize
    ? (isStartUp(data.serviceType) ? STARTUP_FLAT[data.propertySize] : PRICING[data.propertySize][data.serviceType])
    : 0
  const total = calcTotal(data)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-dark-brown/12 px-6 py-5 flex flex-col gap-3">
        <div className="flex justify-between font-marcellus text-sm opacity-50">
          <span>{data.serviceType} — {data.propertySize}</span>
          <span>${base.toLocaleString()}</span>
        </div>
        {data.extras.map(label => {
          const opt = EXTRA_OPTIONS.find(o => o.label === label)
          return (
            <div key={label} className="flex justify-between font-marcellus text-sm opacity-50">
              <span>{label}</span>
              <span>{opt?.price}</span>
            </div>
          )
        })}
        <div className="border-t border-dark-brown/12 pt-3 flex justify-between font-marcellus text-base">
          <span>Estimated total</span>
          <span>${total.toLocaleString()}</span>
        </div>
        <p className="font-marcellus text-xs opacity-35">
          Final price confirmed after property review. Ozone/window add-ons quoted by unit count.
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
  const hasService = !!data.serviceType
  const hasSize    = !!data.propertySize
  const base       = hasService && hasSize
    ? (isStartUp(data.serviceType as ServiceType)
        ? STARTUP_FLAT[data.propertySize as PropertySize]
        : PRICING[data.propertySize as PropertySize][data.serviceType as ServiceType])
    : null
  const extrasTotal = data.extras.reduce((sum, label) => {
    const opt = EXTRA_OPTIONS.find(o => o.label === label)
    if (!opt) return sum
    const n = parseInt(opt.price.replace(/[^0-9]/g, ''))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
  const total = (base ?? 0) + extrasTotal

  const sizeInfo   = PROPERTY_SIZES.find(s => s.label === data.propertySize)
  const dateLabel  = data.date
    ? new Date(data.date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="sticky top-8 rounded-2xl border border-dark-brown/12 overflow-hidden bg-stone">

      {/* Title */}
      <div className="border-b border-dark-brown/10 px-6 py-4">
        <p className="font-marcellus text-xs uppercase tracking-[0.2em] opacity-50 text-center">Booking Summary</p>
      </div>

      {/* Rows */}
      <div className="px-6 py-5 flex flex-col gap-5">

        {/* Service + property */}
        <SummaryRow
          icon="service"
          label={data.serviceType || undefined}
          value={base !== null ? `$${base.toLocaleString()}` : (hasService ? '' : null)}
          placeholder="Choose a service…"
          sub={hasSize ? [
            { label: data.propertySize as string, value: sizeInfo?.sqft ?? '' },
          ] : undefined}
        />

        {/* Add-ons */}
        <AnimatePresence>
          {data.extras.map(label => {
            const opt = EXTRA_OPTIONS.find(o => o.label === label)
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <SummaryRow icon="addon" label={label} value={opt?.price ?? ''} />
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Date */}
        <SummaryRow
          icon="date"
          value={dateLabel ? `${dateLabel}${data.timeWindow ? ' · ' + data.timeWindow : ''}` : null}
          placeholder="Choose service date…"
        />

        {/* Frequency */}
        <SummaryRow
          icon="frequency"
          value={data.frequency || null}
          placeholder="Choose frequency…"
        />
      </div>

      {/* Total */}
      <div className="border-t border-dark-brown/10 px-6 py-5 flex flex-col gap-1">
        <div className="flex justify-between items-baseline font-marcellus text-sm opacity-60">
          <span>Estimated price</span>
          <span>{base !== null ? `$${base.toLocaleString()}` : '—'}</span>
        </div>
        {extrasTotal > 0 && (
          <div className="flex justify-between items-baseline font-marcellus text-sm opacity-60">
            <span>Add-ons</span>
            <span>+${extrasTotal.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline mt-2">
          <span className="font-marcellus text-sm">Total</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={total}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={['font-marcellus', total > 0 ? 'text-2xl' : 'text-base opacity-25'].join(' ')}
            >
              {total > 0 ? `$${total.toLocaleString()}` : '—'}
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
  serviceType: '', propertySize: '', extras: [],
  date: '', timeWindow: '', frequency: '',
  address: '', unit: '', city: '', state: '', zip: '',
  firstName: '', lastName: '', email: '', phone: '', notes: '',
}

export function BookingForm() {
  const [currentStep, setCurrentStep]  = useState(1)
  const [completedSteps, setCompleted] = useState<Set<number>>(new Set())
  const [data, setData]                = useState<FormData>(EMPTY)
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
      await submitBooking({ ...data, estimatedTotal: calcTotal(data) })
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
