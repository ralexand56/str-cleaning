'use client'

import { SmsConsentBoxes } from './booking/SmsConsentBoxes'
import { getSource } from '@/lib/tracking/source'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitBooking } from '@/app/actions/booking'
import { startBooking } from '@/app/actions/startBooking'
import { BookingCardCapture, type CardCaptureResult } from '@/components/BookingCardCapture'
import { PhotoUpload } from '@/components/booking/PhotoUpload'
import { AddOnTiles } from '@/components/pricing/AddOnTiles'
import { QuoteSummary } from '@/components/pricing/QuoteSummary'
import {
  FrequencyInputs,
  HomeInputs,
  PackageInputs,
  FirstTimeToggle,
  ServiceTabs,
  TimingInputs,
  hasFrequencyChoice,
} from '@/components/pricing/ServiceInputs'
import { ADD_ONS, CARD_POLICY, FIRST_TIME_DISCOUNT, FREQUENCIES, POST_CONSTRUCTION_ITEMS } from '@/lib/pricing/prices'
import {
  SERVICE_TYPE_LABELS,
  calculateQuote,
  describePackage,
  describeProperty,
  formatMoney,
  visibleAddOns,
} from '@/lib/pricing/engine'
import { DEFAULT_CALC_STATE, bundledIncluded, isMonthlyPlan, toQuoteInput, type CalcState } from '@/lib/pricing/calcState'
import { packageKeyOf } from '@/lib/pricing/jobType'
import {
  ACCESS_METHODS,
  CHECKLIST,
  EMPTY_INTAKE,
  HEARD_ABOUT,
  HOME_TYPES,
  PC_STAGES,
  STR_PLATFORMS,
  TIME_WINDOWS,
  type BookingIntake,
} from '@/lib/booking/intake'
import { inServiceArea, serviceAreaText } from '@/lib/booking/serviceArea'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Contact {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  unit: string
  city: string
  state: string
  zip: string
  notes: string
  stripeCustomerId: string
  stripePaymentMethodId: string
  customerId: string
}

type StepId =
  | 'contact' | 'service' | 'home' | 'package' | 'frequency' | 'addons'
  | 'checklist' | 'photos' | 'dates' | 'access' | 'card' | 'review'

const STEP_TITLES: Record<StepId, string> = {
  contact: 'Your contact details',
  service: 'Service',
  home: 'The home',
  package: 'Package',
  frequency: 'How often',
  addons: 'Add-ons',
  checklist: 'Anything else we should pay attention to?',
  photos: 'Photos',
  dates: 'Preferred dates',
  access: 'Access and products',
  card: 'Card and cancellation policy',
  review: 'Review and send',
}

function stepsFor(calc: CalcState): StepId[] {
  const steps: StepId[] = ['contact', 'service', 'home', 'package']
  if (hasFrequencyChoice(calc)) steps.push('frequency')
  if (calc.service !== 'post_construction') steps.push('addons', 'checklist')
  steps.push('photos', 'dates', 'access', 'card', 'review')
  return steps
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isStepValid(step: StepId, calc: CalcState, c: Contact, intake: BookingIntake): boolean {
  switch (step) {
    case 'contact':
      return !!c.firstName.trim() && EMAIL_RE.test(c.email.trim()) && c.phone.replace(/\D/g, '').length >= 10 && /^\d{5}$/.test(c.zip.trim())
    case 'home': {
      const address = !!c.address.trim() && !!c.city.trim() && !!c.state.trim() && /^\d{5}$/.test(c.zip.trim())
      if (calc.service === 'residential') return address && calc.sqft > 0 && !!intake.homeType && !!intake.occupied
      if (calc.service === 'post_construction') return address && calc.pcSqft > 0
      return address && !!calc.strSize
    }
    case 'dates':
      return !!intake.dateWindows[0]?.date && !!intake.dateWindows[0]?.window
    case 'access':
      return !!c.lastName.trim() && !!intake.access?.method
    case 'card':
      return !!c.stripePaymentMethodId && !!intake.policyAccepted
    default:
      return true
  }
}

/** What's still needed on a step, shown under a disabled Continue button. */
function missingFor(step: StepId, calc: CalcState, c: Contact, intake: BookingIntake): string {
  const need: string[] = []
  switch (step) {
    case 'contact':
      if (!c.firstName.trim()) need.push('your first name')
      if (c.phone.replace(/\D/g, '').length < 10) need.push('a phone number')
      if (!EMAIL_RE.test(c.email.trim())) need.push('an email address')
      if (!/^\d{5}$/.test(c.zip.trim())) need.push('a 5-digit ZIP code')
      break
    case 'home':
      if (!c.address.trim()) need.push('a street address')
      if (!c.city.trim()) need.push('a city')
      if (!c.state.trim()) need.push('a state')
      if (!/^\d{5}$/.test(c.zip.trim())) need.push('a 5-digit ZIP code')
      if (calc.service === 'str' && !calc.strSize) need.push('the property size (bedrooms and bathrooms)')
      if (calc.service === 'residential') {
        if (!(calc.sqft > 0)) need.push('the square feet')
        if (!intake.homeType) need.push('the home type')
        if (!intake.occupied) need.push('whether the home is occupied or empty')
      }
      if (calc.service === 'post_construction' && !(calc.pcSqft > 0)) need.push('the square feet')
      break
    case 'dates':
      if (!intake.dateWindows[0]?.date) need.push('a date for choice 1 (tap “Choose a date”)')
      if (!intake.dateWindows[0]?.window) need.push('a time for choice 1')
      break
    case 'access':
      if (!c.lastName.trim()) need.push('your last name')
      if (!intake.access?.method) need.push('how we get in')
      break
    case 'card':
      if (!c.stripePaymentMethodId) need.push('to save a card')
      if (!intake.policyAccepted) need.push('to tick the box agreeing to the policy')
      break
  }
  return need.length ? `To continue, we need ${need.join(', ')}.` : ''
}

function hasFirstTimeDiscount(q: { lines: { label: string }[] }): boolean {
  return q.lines.some((l) => l.label === FIRST_TIME_DISCOUNT.label)
}

function stepSummary(step: StepId, calc: CalcState, c: Contact, intake: BookingIntake, photoCount: number): string {
  const input = toQuoteInput(calc)
  switch (step) {
    case 'contact': return `${c.firstName} · ${c.phone} · ${c.email}`
    case 'service': return SERVICE_TYPE_LABELS[calc.service]
    case 'home': return `${describeProperty(input)} · ${c.address}, ${c.city}`
    case 'package': return describePackage(input)
    case 'frequency': return calc.service === 'str' ? `${calc.turnovers} turnovers a month${calc.prepay ? ', prepaid' : ''}` : FREQUENCIES.find((f) => f.key === calc.frequency)?.label ?? ''
    case 'addons': return calc.addOns.length ? `${calc.addOns.length} add-on${calc.addOns.length !== 1 ? 's' : ''}` : 'None'
    case 'checklist': return intake.checklist.length ? `${intake.checklist.length} item${intake.checklist.length !== 1 ? 's' : ''}` : 'Nothing extra'
    case 'photos': return photoCount ? `${photoCount} photo${photoCount !== 1 ? 's' : ''}` : 'None'
    case 'dates': return intake.dateWindows.filter((d) => d.date).map((d) => new Date(d.date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(', ')
    case 'access': return `${intake.access?.method ?? ''} · ${intake.products === 'theirs' ? 'your products' : 'our products'}`
    case 'card': return c.stripePaymentMethodId === 'unavailable' ? 'We’ll call to take your card' : 'Card saved, policy accepted'
    default: return ''
  }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-marcellus text-xs opacity-50 mb-3 uppercase tracking-widest">{children}</p>
}

const inputCls =
  'font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-full focus:outline-none focus:border-dark-brown transition-colors placeholder:opacity-40'

function Chips<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value?: T | string; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={[
            'px-4 py-2 rounded-full border font-marcellus text-sm cursor-pointer transition-colors',
            value === o ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50',
          ].join(' ')}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function YesNo({ value, onChange, label }: { value?: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 max-w-lg">
      <span className="font-marcellus text-sm">{label}</span>
      <Chips options={['Yes', 'No'] as const} value={value === undefined ? undefined : value ? 'Yes' : 'No'} onChange={(v) => onChange(v === 'Yes')} label={label} />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const EMPTY_CONTACT: Contact = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', unit: '', city: '', state: 'CA', zip: '', notes: '',
  stripeCustomerId: '', stripePaymentMethodId: '', customerId: '',
}

export function BookingForm({ initial }: { initial?: CalcState }) {
  const [calc, setCalc] = useState<CalcState>(() => initial ?? DEFAULT_CALC_STATE)
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT)
  const [intake, setIntake] = useState<BookingIntake>(EMPTY_INTAKE)
  const [photoKeys, setPhotoKeys] = useState<string[]>([])
  const [requestId] = useState(() => crypto.randomUUID())
  const [currentStep, setCurrentStep] = useState<StepId>('contact')
  const [completed, setCompleted] = useState<Set<StepId>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const updateCalc = (patch: Partial<CalcState>) => setCalc((prev) => ({ ...prev, ...patch }))
  const update = (patch: Partial<Contact>) => setContact((prev) => ({ ...prev, ...patch }))
  const updateIntake = (patch: Partial<BookingIntake>) => setIntake((prev) => ({ ...prev, ...patch }))

  const steps = stepsFor(calc)
  const firstDate = intake.dateWindows[0]?.date ?? ''
  const quoteInput = useMemo(() => toQuoteInput(calc, firstDate), [calc, firstDate])
  const quote = useMemo(() => calculateQuote(quoteInput), [quoteInput])
  const timingApplies = calc.service !== 'post_construction' && !isMonthlyPlan(calc)

  function completeStep(step: StepId) {
    if (step === 'contact' && !intake.leadJobId) {
      startBooking({
        firstName: contact.firstName,
        phone: contact.phone,
        email: contact.email,
        zip: contact.zip,
        service: SERVICE_TYPE_LABELS[calc.service],
        smsConsent: { ...(intake.smsConsent ?? { marketing: false, transactional: false }), at: new Date().toISOString() },
        source: getSource(),
      })
        .then((id) => id && updateIntake({ leadJobId: id }))
        .catch(() => {})
    }
    setCompleted((prev) => new Set([...prev, step]))
    const next = steps[steps.indexOf(step) + 1]
    if (next) setCurrentStep(next)
  }

  // ── Checklist ticks add the matching add-on, when it's on the site and not already included.
  function toggleChecklist(key: string) {
    const item = CHECKLIST.find((c) => c.key === key)
    const on = !intake.checklist.includes(key)
    updateIntake({ checklist: on ? [...intake.checklist, key] : intake.checklist.filter((k) => k !== key) })
    if (!item?.addOnIds || calc.service === 'post_construction') return
    const available = new Set(visibleAddOns(calc.service).map((a) => a.id))
    const incl = bundledIncluded(calc)
    const ids = item.addOnIds.filter((id) => available.has(id) && !(incl && ADD_ONS.find((a) => a.id === id)?.bundled))
    if (!ids.length) return
    const rest = calc.addOns.filter((a) => !ids.includes(a.id))
    updateCalc({ addOns: on ? [...rest, ...ids.map((id) => ({ id, qty: 1 }))] : rest })
  }

  function checklistPrice(key: string): string | null {
    const item = CHECKLIST.find((c) => c.key === key)
    if (!item?.addOnIds || calc.service === 'post_construction') return null
    const available = visibleAddOns(calc.service).filter((a) => item.addOnIds!.includes(a.id))
    if (!available.length) return null
    if (bundledIncluded(calc) && available.every((a) => a.bundled)) return 'Included'
    return available.map((a) => `${formatMoney(a.price)} ${a.unit}`).join(' / ')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const addOnLines =
        quoteInput.service === 'post_construction'
          ? POST_CONSTRUCTION_ITEMS.filter((i) => (quoteInput.counts[i.key] ?? 0) > 0).map((i) => ({
              id: `pc_${i.key}`, qty: quoteInput.counts[i.key] ?? 0, label: i.label, unitPrice: i.price,
            }))
          : quoteInput.addOns.map((sel) => {
              const a = ADD_ONS.find((x) => x.id === sel.id)
              return { id: sel.id, qty: sel.qty, label: a?.name ?? sel.id, unitPrice: a?.price ?? 0 }
            })

      await submitBooking({
        service: calc.service,
        packageKey: packageKeyOf(calc),
        packageLabel: describePackage(quoteInput),
        propertySize: describeProperty(quoteInput),
        beds: calc.service === 'residential' ? calc.beds : undefined,
        baths: calc.service === 'residential' ? calc.baths + 0.5 * calc.halfBaths : undefined,
        sqft: calc.service === 'residential' ? calc.sqft : calc.service === 'post_construction' ? calc.pcSqft : undefined,
        frequency:
          calc.service === 'residential' && calc.resPackage === 'recurring'
            ? FREQUENCIES.find((f) => f.key === calc.frequency)?.label ?? ''
            : isMonthlyPlan(calc)
              ? `Monthly plan, ${calc.turnovers} turnovers${calc.prepay ? ', prepaid' : ''}`
              : 'One-time',
        intake: {
          ...intake,
          dateWindows: intake.dateWindows.filter((d) => d.date),
          pets: calc.service === 'post_construction' ? undefined : intake.pets,
          firstTimeClient: calc.firstTime,
          source: getSource(),
        },
        photoKeys,
        addOns: addOnLines,
        quoteLines: quote.lines.map((l) => `${l.label}: ${l.included ? 'Included' : formatMoney(l.amount)}`),
        quoteSubs: quote.subs.map((s) => `${s.label}: ${s.amount === null ? 'to confirm' : formatMoney(s.amount)}`),
        estimate: quote.lines.length ? quote.total : null,
        estimatePeriod: quote.period,
        quoteRequired: quote.quoteRequired,
        emergencySameDay: timingApplies && calc.sameDay,
        date: firstDate,
        timeWindow: intake.dateWindows[0]?.window ?? '',
        address: contact.address,
        unit: contact.unit,
        city: contact.city,
        state: contact.state,
        zip: contact.zip,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        notes: contact.notes,
        stripeCustomerId: contact.stripeCustomerId || undefined,
        stripePaymentMethodId:
          contact.stripePaymentMethodId && contact.stripePaymentMethodId !== 'unavailable' ? contact.stripePaymentMethodId : undefined,
        customerId: contact.customerId || undefined,
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <p className="font-marcellus text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] mb-5">Request received.</p>
        <p className="font-marcellus text-base opacity-60 max-w-md mx-auto leading-relaxed">
          We’ll get back to you to confirm your price and time. A copy of your request is on its way to {contact.email}.
        </p>
      </motion.div>
    )
  }

  // ── Step bodies ────────────────────────────────────────────────────────────

  function renderStep(step: StepId) {
    switch (step) {
      case 'contact':
        return (
          <div className="flex flex-col gap-6 max-w-lg">
            <p className="font-marcellus text-sm opacity-60">Start here so we can reach you, even if you don’t finish today.</p>
            <input type="text" autoComplete="given-name" value={contact.firstName} onChange={(e) => update({ firstName: e.target.value })} placeholder="First name" className={inputCls} />
            <input type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="Phone" className={inputCls} />
            <input type="email" autoComplete="email" value={contact.email} onChange={(e) => update({ email: e.target.value })} placeholder="Email" className={inputCls} />
            <input type="text" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={contact.zip} onChange={(e) => update({ zip: e.target.value.replace(/\D/g, '') })} placeholder="ZIP code" className={`${inputCls} w-36`} />
            <SmsConsentBoxes
              value={intake.smsConsent ?? { marketing: false, transactional: false }}
              onChange={(smsConsent) => updateIntake({ smsConsent: { ...smsConsent, at: new Date().toISOString() } })}
            />
            <FirstTimeToggle state={calc} update={updateCalc} />
          </div>
        )

      case 'service':
        return <ServiceTabs value={calc.service} onChange={(service) => updateCalc({ service, addOns: [] })} />

      case 'home':
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5 max-w-xl">
              <Label>Address</Label>
              <input type="text" autoComplete="street-address" value={contact.address} onChange={(e) => update({ address: e.target.value })} placeholder="Street address" className={inputCls} />
              <input type="text" value={contact.unit} onChange={(e) => update({ unit: e.target.value })} placeholder="Unit / Apt (optional)" className={`${inputCls} w-44`} />
              <div className="grid grid-cols-[1fr_56px_80px] gap-5 items-end">
                <input type="text" autoComplete="address-level2" value={contact.city} onChange={(e) => update({ city: e.target.value })} placeholder="City" className={inputCls} />
                <input type="text" value={contact.state} onChange={(e) => update({ state: e.target.value.toUpperCase() })} placeholder="State" className={inputCls} maxLength={2} />
                <input type="text" inputMode="numeric" maxLength={5} value={contact.zip} onChange={(e) => update({ zip: e.target.value.replace(/\D/g, '') })} placeholder="ZIP" className={inputCls} />
              </div>
              {contact.city.trim().length > 2 && !inServiceArea(contact.city) && (
                <p className="font-marcellus text-sm rounded-xl border border-dark-brown/15 px-4 py-3">
                  We mainly serve {serviceAreaText()}. You can still send your request and we’ll let you know if we can reach you.
                </p>
              )}
            </div>

            <HomeInputs state={calc} update={updateCalc} />

            {calc.service !== 'post_construction' && (
              <div className="flex flex-col gap-5">
                <div>
                  <Label>Home type</Label>
                  <Chips options={HOME_TYPES} value={intake.homeType} onChange={(homeType) => updateIntake({ homeType })} label="Home type" />
                </div>
                {calc.service === 'residential' && (
                  <div>
                    <Label>Will the home be occupied or empty?</Label>
                    <Chips
                      options={['Occupied', 'Empty'] as const}
                      value={intake.occupied === 'empty' ? 'Empty' : intake.occupied === 'occupied' ? 'Occupied' : undefined}
                      onChange={(v) => updateIntake({ occupied: v === 'Empty' ? 'empty' : 'occupied' })}
                      label="Occupied or empty"
                    />
                  </div>
                )}
                <YesNo label="Any pets?" value={intake.pets?.has} onChange={(has) => updateIntake({ pets: { ...intake.pets, has } })} />
                {intake.pets?.has && (
                  <input type="text" value={intake.pets.kind ?? ''} onChange={(e) => updateIntake({ pets: { has: true, kind: e.target.value } })} placeholder="What kind? (e.g. 2 dogs, 1 cat)" className={`${inputCls} max-w-lg`} />
                )}
              </div>
            )}

            {calc.service === 'str' && (
              <div className="flex flex-col gap-5">
                <div>
                  <Label>Where is it listed?</Label>
                  <Chips options={STR_PLATFORMS} value={intake.str?.platform} onChange={(platform) => updateIntake({ str: { ...intake.str, platform } })} label="Platform" />
                </div>
                <div className="flex flex-wrap gap-6 max-w-lg">
                  <label className="flex-1 min-w-[140px] font-marcellus text-sm opacity-80">
                    Usual check-out time
                    <input type="time" value={intake.str?.checkoutTime ?? ''} onChange={(e) => updateIntake({ str: { ...intake.str, checkoutTime: e.target.value } })} className={`${inputCls} mt-2`} />
                  </label>
                  <label className="flex-1 min-w-[140px] font-marcellus text-sm opacity-80">
                    Usual check-in time
                    <input type="time" value={intake.str?.checkinTime ?? ''} onChange={(e) => updateIntake({ str: { ...intake.str, checkinTime: e.target.value } })} className={`${inputCls} mt-2`} />
                  </label>
                </div>
              </div>
            )}

            {calc.service === 'post_construction' && (
              <div className="flex flex-col gap-5">
                <div>
                  <Label>Stage of the job</Label>
                  <Chips options={PC_STAGES} value={intake.postConstruction?.stage} onChange={(stage) => updateIntake({ postConstruction: { ...intake.postConstruction, stage } })} label="Job stage" />
                </div>
                <YesNo label="Are builders still working on site?" value={intake.postConstruction?.buildersOnSite} onChange={(buildersOnSite) => updateIntake({ postConstruction: { ...intake.postConstruction, buildersOnSite } })} />
                <YesNo label="Has the debris been removed?" value={intake.postConstruction?.debrisRemoved} onChange={(debrisRemoved) => updateIntake({ postConstruction: { ...intake.postConstruction, debrisRemoved } })} />
              </div>
            )}
          </div>
        )

      case 'package':
        return <PackageInputs state={calc} update={updateCalc} />

      case 'frequency':
        return <FrequencyInputs state={calc} update={updateCalc} />

      case 'addons':
        return calc.service === 'post_construction' ? null : (
          <div className="flex flex-col gap-4">
            <p className="font-marcellus text-sm opacity-70">Optional. Tap anything you’d like added, or just press Continue if you don’t need any.</p>
            <AddOnTiles service={calc.service} selected={calc.addOns} onChange={(addOns) => updateCalc({ addOns })} bundledIncluded={bundledIncluded(calc)} />
          </div>
        )

      case 'checklist':
        return (
          <div className="flex flex-col gap-3 max-w-xl">
            <p className="font-marcellus text-sm opacity-60 mb-1">Things people often forget. Tick anything that applies.</p>
            {CHECKLIST.map((item) => {
              const price = checklistPrice(item.key)
              const on = intake.checklist.includes(item.key)
              return (
                <label key={item.key} className="flex items-start gap-3 cursor-pointer font-marcellus text-sm">
                  <input type="checkbox" checked={on} onChange={() => toggleChecklist(item.key)} className="w-4 h-4 mt-0.5" />
                  <span className="flex-1">
                    {item.label}
                    {on && item.prompt && <span className="block text-xs opacity-50 mt-0.5">{item.prompt}</span>}
                  </span>
                  {price && <span className="opacity-60 text-xs flex-shrink-0">{price}</span>}
                </label>
              )
            })}
            <textarea
              value={contact.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Tell us anything else"
              rows={3}
              className="mt-3 font-marcellus text-sm bg-transparent border border-dark-brown/20 rounded-xl px-4 py-3 w-full focus:outline-none focus:border-dark-brown placeholder:opacity-40 resize-none"
            />
          </div>
        )

      case 'photos':
        return <PhotoUpload requestId={requestId} onChange={setPhotoKeys} />

      case 'dates': {
        const today = new Date().toISOString().split('T')[0]
        return (
          <div className="flex flex-col gap-6">
            <p className="font-marcellus text-sm opacity-60 max-w-lg">
              Pick up to 3 dates and times that work for you. We’ll confirm one.
              {timingApplies && ' Sundays and holidays add $50.'}
            </p>
            {intake.dateWindows.map((w, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="font-marcellus text-sm opacity-60 w-20">Choice {i + 1}</span>
                  <label
                    className={[
                      'relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full border font-marcellus text-sm cursor-pointer min-w-[11rem]',
                      w.date ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/40',
                    ].join(' ')}
                  >
                    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                      <rect x="1" y="3" width="13" height="11" rx="1.5" />
                      <path d="M1 7h13M5 1v4M10 1v4" />
                    </svg>
                    {w.date
                      ? new Date(w.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      : 'Choose a date'}
                    <input
                      type="date"
                      min={today}
                      value={w.date}
                      aria-label={`Date, choice ${i + 1}`}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker?.()
                        } catch {
                          // Older browsers: the native input still opens on tap.
                        }
                      }}
                      onChange={(e) => updateIntake({ dateWindows: intake.dateWindows.map((d, j) => (j === i ? { ...d, date: e.target.value } : d)) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                  {i > 0 && (
                    <button type="button" onClick={() => updateIntake({ dateWindows: intake.dateWindows.filter((_, j) => j !== i) })} className="font-marcellus text-xs opacity-50 hover:opacity-100 cursor-pointer bg-transparent border-none">
                      Remove
                    </button>
                  )}
                </div>
                <div className="sm:pl-24">
                  <Chips options={TIME_WINDOWS} value={w.window} label={`Time, choice ${i + 1}`} onChange={(window) => updateIntake({ dateWindows: intake.dateWindows.map((d, j) => (j === i ? { ...d, window } : d)) })} />
                </div>
              </div>
            ))}
            {intake.dateWindows.length < 3 && (
              <button type="button" onClick={() => updateIntake({ dateWindows: [...intake.dateWindows, { date: '', window: '' }] })} className="self-start font-marcellus text-sm underline cursor-pointer bg-transparent border-none p-0">
                + Add another choice
              </button>
            )}
            {timingApplies && <TimingInputs state={calc} update={updateCalc} withSundayToggle={false} />}
          </div>
        )
      }

      case 'access':
        return (
          <div className="flex flex-col gap-8 max-w-xl">
            <div className="flex flex-col gap-5">
              <Label>Your name</Label>
              <div className="grid grid-cols-2 gap-5">
                <input type="text" autoComplete="given-name" value={contact.firstName} onChange={(e) => update({ firstName: e.target.value })} placeholder="First name" className={inputCls} />
                <input type="text" autoComplete="family-name" value={contact.lastName} onChange={(e) => update({ lastName: e.target.value })} placeholder="Last name" className={inputCls} />
              </div>
            </div>
            <div>
              <Label>How do we get in?</Label>
              <Chips options={ACCESS_METHODS} value={intake.access?.method} onChange={(method) => updateIntake({ access: { ...intake.access, method } })} label="Access method" />
            </div>
            <input type="text" value={intake.access?.parking ?? ''} onChange={(e) => updateIntake({ access: { ...intake.access, parking: e.target.value } })} placeholder="Parking (driveway, street, permit, garage…)" className={inputCls} />
            <input type="text" value={intake.access?.notes ?? ''} onChange={(e) => updateIntake({ access: { ...intake.access, notes: e.target.value } })} placeholder="Gate code, stairs or elevator, anything else (optional)" className={inputCls} />

            {calc.service === 'str' && (
              <div className="flex flex-col gap-5">
                <input type="url" value={intake.str?.icalLink ?? ''} onChange={(e) => updateIntake({ str: { ...intake.str, icalLink: e.target.value } })} placeholder="Calendar (iCal) link for scheduling turnovers (optional)" className={inputCls} />
                <input type="text" value={intake.str?.linenSetup ?? ''} onChange={(e) => updateIntake({ str: { ...intake.str, linenSetup: e.target.value } })} placeholder="Linens: kept on site? how many sets? washer on site?" className={inputCls} />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Label>Products</Label>
              <Chips
                options={['Use your professional products', 'Use my own products'] as const}
                value={intake.products === 'theirs' ? 'Use my own products' : 'Use your professional products'}
                onChange={(v) => updateIntake({ products: v === 'Use my own products' ? 'theirs' : 'ours' })}
                label="Products"
              />
              {intake.products === 'theirs' && (
                <div className="font-marcellus text-sm opacity-80 flex flex-col gap-2 rounded-2xl border border-dark-brown/12 px-5 py-4">
                  <p>By default we clean with our own professional products. That’s how we keep our quality standard.</p>
                  <p>We’re happy to use yours: leave them out where the crew can find them.</p>
                  {calc.service === 'str' && <p>For guest safety, toilets, showers and kitchens are always disinfected with our own disinfectant.</p>}
                  <p>We don’t use harsh or strong chemicals supplied by the client. When your own products are used, we can’t guarantee the cleaning result.</p>
                </div>
              )}
              <input type="text" value={intake.productsToAvoid ?? ''} onChange={(e) => updateIntake({ productsToAvoid: e.target.value })} placeholder="Any products to avoid? (allergies, stone counters, wood floors…)" className={inputCls} />
            </div>

            <div>
              <Label>How did you hear about us?</Label>
              <Chips options={HEARD_ABOUT} value={intake.heardAbout} onChange={(heardAbout) => updateIntake({ heardAbout })} label="How did you hear about us" />
            </div>
          </div>
        )

      case 'card': {
        const status = contact.stripePaymentMethodId
        return (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="font-marcellus text-sm flex flex-col gap-2 rounded-2xl border border-dark-brown/12 px-5 py-4">
              <p className="opacity-60 uppercase tracking-widest text-xs">No deposit. Here’s how payment works</p>
              <ul className="list-disc pl-5 flex flex-col gap-1.5">
                {CARD_POLICY.lines.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>

            {!status && (
              <BookingCardCapture
                email={contact.email}
                firstName={contact.firstName}
                lastName={contact.lastName}
                phone={contact.phone}
                onSaved={(r: CardCaptureResult) =>
                  update({ stripeCustomerId: r.stripeCustomerId, stripePaymentMethodId: r.stripePaymentMethodId, customerId: r.customerId })
                }
                onUnavailable={() => update({ stripePaymentMethodId: 'unavailable' })}
              />
            )}
            {status && status !== 'unavailable' && <p className="font-marcellus text-sm opacity-70">Card saved. Nothing has been charged.</p>}
            {status === 'unavailable' && (
              <p className="font-marcellus text-sm opacity-70">
                We couldn’t load the card form right now. Send your request anyway and we’ll call you to take your card.
              </p>
            )}

            <label className="flex items-start gap-3 cursor-pointer font-marcellus text-sm">
              <input
                type="checkbox"
                checked={!!intake.policyAccepted}
                onChange={(e) => updateIntake({ policyAccepted: e.target.checked })}
                className="w-4 h-4 mt-0.5"
              />
              I agree to the payment and cancellation policy above.
            </label>
          </div>
        )
      }

      case 'review':
        return (
          <div className="flex flex-col gap-6">
            <div className="lg:hidden">
              <QuoteSummary quote={quote} />
            </div>
            <p className="font-marcellus text-sm opacity-60 max-w-lg">
              This is a request, not a confirmed booking. We review it and confirm your final price and time.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-14 py-5 rounded-full bg-accent text-dark-brown font-marcellus text-base transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer disabled:cursor-default self-start"
            >
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </div>
        )
    }
  }

  const stepList = (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const isCompleted = completed.has(step)
        const isActive = currentStep === step
        if (!isCompleted && !isActive) return null
        const isLast = i === steps.length - 1
        const hideContinue = isLast

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-dark-brown/10 first:border-t-0"
          >
            <div className="flex items-start justify-between gap-4 py-6">
              <div className="flex items-start gap-4 min-w-0">
                <span
                  className={[
                    'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-marcellus text-xs flex-shrink-0 transition-colors duration-300',
                    isActive ? 'bg-dark-brown text-stone' : 'bg-dark-brown/8 text-dark-brown/40',
                  ].join(' ')}
                >
                  {isCompleted && !isActive ? '✓' : i + 1}
                </span>
                <div className="min-w-0">
                  <p className={['font-marcellus text-base', isActive ? '' : 'opacity-50'].join(' ')}>{STEP_TITLES[step]}</p>
                  {isCompleted && !isActive && (
                    <p className="font-marcellus text-sm opacity-40 mt-0.5 truncate">{stepSummary(step, calc, contact, intake, photoKeys.length)}</p>
                  )}
                </div>
              </div>
              {isCompleted && !isActive && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(step)}
                  className="font-marcellus text-sm opacity-40 hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none flex-shrink-0 pt-0.5"
                >
                  Edit
                </button>
              )}
            </div>

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
                  <div className="pb-10 pl-10 max-sm:pl-0">
                    {renderStep(step)}
                    {!hideContinue && (
                      <>
                        <button
                          type="button"
                          onClick={() => completeStep(step)}
                          disabled={!isStepValid(step, calc, contact, intake)}
                          className="mt-8 px-12 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-base transition-opacity duration-200 disabled:opacity-25 hover:opacity-75 cursor-pointer disabled:cursor-default"
                        >
                          Continue
                        </button>
                        {!isStepValid(step, calc, contact, intake) && (
                          <p className="mt-3 font-marcellus text-sm opacity-70">{missingFor(step, calc, contact, intake)}</p>
                        )}
                      </>
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
    <div className="flex gap-12 items-start pb-20 lg:pb-0">
      <div className="flex-1 min-w-0">{stepList}</div>
      <div className="hidden lg:block w-[320px] flex-shrink-0 sticky top-8">
        <QuoteSummary quote={quote} title="Your request" />
      </div>
      {/* Phones: running total always visible. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-stone/95 backdrop-blur border-t border-dark-brown/15 px-4 py-3 font-marcellus text-sm flex justify-between items-baseline gap-3">
        <span>
          {quote.quoteRequired ? 'Estimate' : 'Total'}
          {hasFirstTimeDiscount(quote) && <span className="block text-xs opacity-60">incl. 20% first-visit discount</span>}
        </span>
        <span className="text-lg text-right">
          {quote.lines.length
            ? `${formatMoney(quote.total)}${quote.period === 'month' ? '/mo' : ''}`
            : quote.incomplete
              ? <span className="text-sm opacity-60">Choose your size to see a price</span>
              : 'Custom quote'}
        </span>
      </div>
    </div>
  )
}
