'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitBooking } from '@/app/actions/booking'

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = 'Standard Turnover' | 'Deep Clean' | 'Move-Out / Move-In'
type TimeWindow  = 'Morning (8am–12pm)' | 'Afternoon (12pm–4pm)' | 'Flexible'
type Frequency   = 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly'

interface FormData {
  serviceType: ServiceType | ''
  bedrooms:    number
  bathrooms:   number
  extras:      string[]
  date:        string
  timeWindow:  TimeWindow | ''
  frequency:   Frequency | ''
  address:     string
  unit:        string
  city:        string
  state:       string
  zip:         string
  firstName:   string
  lastName:    string
  email:       string
  phone:       string
  notes:       string
}

// ─── Pricing config ───────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  {
    type:    'Standard Turnover' as ServiceType,
    tagline: 'Regular turnover between guests.',
    base: 85, perBed: 15, perBath: 20,
  },
  {
    type:    'Deep Clean' as ServiceType,
    tagline: 'Thorough reset after extended stays.',
    base: 130, perBed: 25, perBath: 30,
  },
  {
    type:    'Move-Out / Move-In' as ServiceType,
    tagline: 'Top-to-bottom property transition.',
    base: 150, perBed: 30, perBath: 35,
  },
]

const EXTRA_OPTIONS = [
  { label: 'Laundry (wash & fold)', price: 25 },
  { label: 'Inside refrigerator',   price: 20 },
  { label: 'Inside oven',           price: 20 },
  { label: 'Interior windows',      price: 30 },
  { label: 'Garage',                price: 40 },
]

function calcTotal(data: FormData): number {
  if (!data.serviceType) return 0
  const svc    = SERVICE_OPTIONS.find(s => s.type === data.serviceType)!
  const extras = data.extras.reduce(
    (sum, e) => sum + (EXTRA_OPTIONS.find(o => o.label === e)?.price ?? 0), 0
  )
  return svc.base + svc.perBed * data.bedrooms + svc.perBath * data.bathrooms + extras
}

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_TITLES = ['', 'Service Type', 'Property Size', 'Schedule', 'Address', 'Contact', 'Review & Book']
const TOTAL_STEPS = 6

function isStepValid(step: number, data: FormData): boolean {
  switch (step) {
    case 1: return !!data.serviceType
    case 2: return data.bedrooms > 0 && data.bathrooms > 0
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
      const ext = data.extras.length ? ` · ${data.extras.length} extra${data.extras.length !== 1 ? 's' : ''}` : ''
      return `${data.bedrooms} bed · ${data.bathrooms} bath${ext}`
    }
    case 3: {
      const d = new Date(data.date + 'T12:00')
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
    <p className="font-marcellus text-xs opacity-40 mb-3 uppercase tracking-widest">
      {children}
    </p>
  )
}

function Stepper({ value, onChange, min = 1, max = 10 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div className="inline-flex items-center gap-5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-9 h-9 rounded-full border border-dark-brown/20 flex items-center justify-center font-marcellus text-xl leading-none hover:opacity-60 disabled:opacity-20 cursor-pointer disabled:cursor-default bg-transparent transition-opacity"
      >
        −
      </button>
      <span className="font-marcellus text-xl w-5 text-center select-none">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-9 h-9 rounded-full border border-dark-brown/20 flex items-center justify-center font-marcellus text-xl leading-none hover:opacity-60 disabled:opacity-20 cursor-pointer disabled:cursor-default bg-transparent transition-opacity"
      >
        +
      </button>
    </div>
  )
}

const inputCls = 'font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-full focus:outline-none focus:border-dark-brown transition-colors placeholder:opacity-30'

function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-5 py-2.5 rounded-full border font-marcellus text-sm transition-all duration-150 cursor-pointer',
        active
          ? 'border-dark-brown bg-dark-brown text-stone'
          : 'border-dark-brown/20 hover:border-dark-brown/50',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ─── Step content components ──────────────────────────────────────────────────

function Step1Content({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {SERVICE_OPTIONS.map(svc => {
        const from = svc.base + svc.perBed + svc.perBath
        return (
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
              <span className="font-marcellus text-sm opacity-40 flex-shrink-0">from ${from}</span>
            </div>
            <p className="font-marcellus text-sm opacity-40 mt-1">{svc.tagline}</p>
          </button>
        )
      })}
    </div>
  )
}

function Step2Content({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  function toggleExtra(label: string) {
    update({
      extras: data.extras.includes(label)
        ? data.extras.filter(e => e !== label)
        : [...data.extras, label],
    })
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Label>Bedrooms</Label>
          <Stepper value={data.bedrooms} onChange={v => update({ bedrooms: v })} max={8} />
        </div>
        <div>
          <Label>Bathrooms</Label>
          <Stepper value={data.bathrooms} onChange={v => update({ bathrooms: v })} max={6} />
        </div>
      </div>
      <div>
        <Label>Add-ons (optional)</Label>
        <div className="flex flex-wrap gap-3">
          {EXTRA_OPTIONS.map(({ label, price }) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleExtra(label)}
              className={[
                'px-5 py-2.5 rounded-full border font-marcellus text-sm transition-all duration-150 cursor-pointer',
                data.extras.includes(label)
                  ? 'border-dark-brown bg-dark-brown text-stone'
                  : 'border-dark-brown/20 hover:border-dark-brown/50',
              ].join(' ')}
            >
              {label} <span className="opacity-40">+${price}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step3Content({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  const today = new Date().toISOString().split('T')[0]
  const times: TimeWindow[]  = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Flexible']
  const freqs: Frequency[]   = ['One-time', 'Weekly', 'Bi-weekly', 'Monthly']
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
            <PillButton key={t} label={t} active={data.timeWindow === t} onClick={() => update({ timeWindow: t })} />
          ))}
        </div>
      </div>
      <div>
        <Label>Frequency</Label>
        <div className="flex flex-wrap gap-3">
          {freqs.map(f => (
            <PillButton key={f} label={f} active={data.frequency === f} onClick={() => update({ frequency: f })} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Step4Content({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <input
        type="text"
        value={data.address}
        onChange={e => update({ address: e.target.value })}
        placeholder="Street address"
        className={inputCls}
      />
      <input
        type="text"
        value={data.unit}
        onChange={e => update({ unit: e.target.value })}
        placeholder="Unit / Apt (optional)"
        className={`${inputCls} w-44`}
      />
      <div className="grid grid-cols-[1fr_56px_80px] gap-5 items-end">
        <input
          type="text"
          value={data.city}
          onChange={e => update({ city: e.target.value })}
          placeholder="City"
          className={inputCls}
        />
        <input
          type="text"
          value={data.state}
          onChange={e => update({ state: e.target.value })}
          placeholder="State"
          className={inputCls}
          maxLength={2}
        />
        <input
          type="text"
          value={data.zip}
          onChange={e => update({ zip: e.target.value })}
          placeholder="ZIP"
          className={inputCls}
          maxLength={10}
        />
      </div>
    </div>
  )
}

function Step5Content({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-5">
        <input
          type="text"
          value={data.firstName}
          onChange={e => update({ firstName: e.target.value })}
          placeholder="First name"
          className={inputCls}
        />
        <input
          type="text"
          value={data.lastName}
          onChange={e => update({ lastName: e.target.value })}
          placeholder="Last name"
          className={inputCls}
        />
      </div>
      <input
        type="email"
        value={data.email}
        onChange={e => update({ email: e.target.value })}
        placeholder="Email address"
        className={inputCls}
      />
      <input
        type="tel"
        value={data.phone}
        onChange={e => update({ phone: e.target.value })}
        placeholder="Phone number"
        className={inputCls}
      />
    </div>
  )
}

function Step6Content({ data, update, onSubmit, submitting }: {
  data: FormData
  update: (p: Partial<FormData>) => void
  onSubmit: () => void
  submitting: boolean
}) {
  const svc   = SERVICE_OPTIONS.find(s => s.type === data.serviceType)!
  const total = calcTotal(data)

  return (
    <div className="flex flex-col gap-6">
      {/* Price breakdown */}
      <div className="rounded-2xl border border-dark-brown/12 px-6 py-5 flex flex-col gap-3">
        <div className="flex justify-between font-marcellus text-sm opacity-50">
          <span>{data.serviceType} (base)</span>
          <span>${svc.base}</span>
        </div>
        <div className="flex justify-between font-marcellus text-sm opacity-50">
          <span>{data.bedrooms} bed × ${svc.perBed}</span>
          <span>${svc.perBed * data.bedrooms}</span>
        </div>
        <div className="flex justify-between font-marcellus text-sm opacity-50">
          <span>{data.bathrooms} bath × ${svc.perBath}</span>
          <span>${svc.perBath * data.bathrooms}</span>
        </div>
        {data.extras.map(e => {
          const price = EXTRA_OPTIONS.find(o => o.label === e)?.price ?? 0
          return (
            <div key={e} className="flex justify-between font-marcellus text-sm opacity-50">
              <span>{e}</span>
              <span>${price}</span>
            </div>
          )
        })}
        <div className="border-t border-dark-brown/12 pt-3 flex justify-between font-marcellus text-base">
          <span>Estimated total</span>
          <span>${total}</span>
        </div>
        <p className="font-marcellus text-xs opacity-35">
          Final price confirmed after property review.
        </p>
      </div>

      {/* Notes */}
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

// ─── Main component ───────────────────────────────────────────────────────────

const EMPTY: FormData = {
  serviceType: '',
  bedrooms: 1, bathrooms: 1,
  extras: [],
  date: '', timeWindow: '', frequency: '',
  address: '', unit: '', city: '', state: '', zip: '',
  firstName: '', lastName: '', email: '', phone: '',
  notes: '',
}

export function BookingForm() {
  const [currentStep, setCurrentStep]     = useState(1)
  const [completedSteps, setCompleted]    = useState<Set<number>>(new Set())
  const [data, setData]                   = useState<FormData>(EMPTY)
  const [submitting, setSubmitting]       = useState(false)
  const [submitted, setSubmitted]         = useState(false)
  const [error, setError]                 = useState('')
  const stepRefs = useRef<Record<number, HTMLDivElement | null>>({})

  function update(patch: Partial<FormData>) {
    setData(prev => ({ ...prev, ...patch }))
  }

  function scrollTo(step: number) {
    setTimeout(() => {
      stepRefs.current[step]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 80)
  }

  function completeStep(step: number) {
    setCompleted(prev => new Set([...prev, step]))
    setCurrentStep(step + 1)
    scrollTo(step + 1)
  }

  function editStep(step: number) {
    setCurrentStep(step)
    scrollTo(step)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
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
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="py-20 text-center"
      >
        <p className="font-marcellus text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] mb-5">
          Request received.
        </p>
        <p className="font-marcellus text-base opacity-50 max-w-sm mx-auto leading-relaxed">
          We'll reach out within 2 hours to confirm your booking and finalize any details.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => {
        const isCompleted = completedSteps.has(step)
        const isActive    = currentStep === step
        if (!isCompleted && !isActive) return null

        return (
          <motion.div
            key={step}
            ref={el => { stepRefs.current[step] = el }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-dark-brown/10 first:border-t-0"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 py-6">
              <div className="flex items-start gap-4">
                {/* Step badge */}
                <span
                  className={[
                    'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-marcellus text-xs flex-shrink-0 transition-colors duration-300',
                    isActive    ? 'bg-dark-brown text-stone' : 'bg-dark-brown/8 text-dark-brown/40',
                  ].join(' ')}
                >
                  {isCompleted ? '✓' : step}
                </span>

                <div>
                  <p className={['font-marcellus text-base', isActive ? '' : 'opacity-50'].join(' ')}>
                    {STEP_TITLES[step]}
                  </p>
                  {isCompleted && !isActive && (
                    <p className="font-marcellus text-sm opacity-35 mt-0.5">
                      {stepSummary(step, data)}
                    </p>
                  )}
                </div>
              </div>

              {isCompleted && !isActive && (
                <button
                  type="button"
                  onClick={() => editStep(step)}
                  className="font-marcellus text-sm opacity-35 hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none flex-shrink-0 pt-0.5"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Step content — expands/collapses */}
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-10 pl-10">
                    {step === 1 && <Step1Content data={data} update={update} />}
                    {step === 2 && <Step2Content data={data} update={update} />}
                    {step === 3 && <Step3Content data={data} update={update} />}
                    {step === 4 && <Step4Content data={data} update={update} />}
                    {step === 5 && <Step5Content data={data} update={update} />}
                    {step === 6 && (
                      <Step6Content
                        data={data}
                        update={update}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                      />
                    )}

                    {step < TOTAL_STEPS && (
                      <button
                        type="button"
                        onClick={() => completeStep(step)}
                        disabled={!isStepValid(step, data)}
                        className="mt-8 px-12 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-base transition-opacity duration-200 disabled:opacity-25 hover:opacity-75 cursor-pointer disabled:cursor-default"
                      >
                        Continue
                      </button>
                    )}

                    {error && (
                      <p className="mt-4 font-marcellus text-sm text-red-600 opacity-80">{error}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
