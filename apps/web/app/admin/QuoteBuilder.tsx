'use client'

import { useMemo, useState } from 'react'
import { AddOnTiles } from '@/components/pricing/AddOnTiles'
import { QuoteSummary } from '@/components/pricing/QuoteSummary'
import { FirstTimeToggle, ServiceInputs, ServiceTabs, TimingInputs } from '@/components/pricing/ServiceInputs'
import { ADD_ONS, POST_CONSTRUCTION_ITEMS } from '@/lib/pricing/prices'
import { calculateQuote, describePackage, describeProperty } from '@/lib/pricing/engine'
import { DEFAULT_CALC_STATE, bundledIncluded, isMonthlyPlan, toQuoteInput, type CalcState } from '@/lib/pricing/calcState'
import { packageKeyOf } from '@/lib/pricing/jobType'
import { createManualJob } from '@/app/actions/admin/createManualJob'

/** Admins always see proposed prices (tagged), so they can quote them by hand if Tatiana agrees. */
const ADMIN_OPTIONS = { includeProposed: true }

export function QuoteBuilder({ onCreated }: { onCreated?: (jobId: string) => void }) {
  const [calc, setCalc] = useState<CalcState>(DEFAULT_CALC_STATE)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState('')

  const update = (patch: Partial<CalcState>) => setCalc((prev) => ({ ...prev, ...patch }))
  const input = useMemo(() => toQuoteInput(calc), [calc])
  const quote = useMemo(() => calculateQuote(input, ADMIN_OPTIONS), [input])

  async function handleCreate() {
    if (!firstName || !lastName || !email || !quote.lines.length) return
    setSubmitting(true)
    try {
      const addOns =
        input.service === 'post_construction'
          ? POST_CONSTRUCTION_ITEMS.filter((i) => (input.counts[i.key] ?? 0) > 0).map((i) => ({
              id: `pc_${i.key}`, qty: input.counts[i.key] ?? 0, label: i.label, unitPrice: i.price,
            }))
          : input.addOns.map((s) => {
              const a = ADD_ONS.find((x) => x.id === s.id)
              return { id: s.id, qty: s.qty, label: a?.name ?? s.id, unitPrice: a?.price ?? 0 }
            })
      const id = await createManualJob({
        service: calc.service,
        packageKey: packageKeyOf(calc),
        propertySize: `${describePackage(input)} · ${describeProperty(input)}`,
        beds: calc.service === 'residential' ? calc.beds : undefined,
        baths: calc.service === 'residential' ? calc.baths : undefined,
        sqft: calc.service === 'residential' ? calc.sqft : calc.service === 'post_construction' ? calc.pcSqft : undefined,
        addOns,
        firstName,
        lastName,
        email,
        phone,
        quotedTotal: Math.round(quote.total),
      })
      setCreatedId(id)
      onCreated?.(id)
    } finally {
      setSubmitting(false)
    }
  }

  const field = 'font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2'

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-dark-brown/12 p-6">
      <p className="font-marcellus text-lg">Build a quote</p>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          <ServiceTabs value={calc.service} onChange={(service) => update({ service, addOns: [] })} />
          <ServiceInputs state={calc} update={update} options={ADMIN_OPTIONS} />
          {calc.service !== 'post_construction' && (
            <AddOnTiles
              service={calc.service}
              selected={calc.addOns}
              onChange={(addOns) => update({ addOns })}
              bundledIncluded={bundledIncluded(calc)}
              options={ADMIN_OPTIONS}
            />
          )}
          {calc.service !== 'post_construction' && !isMonthlyPlan(calc) && (
            <TimingInputs state={calc} update={update} withSundayToggle />
          )}
          {calc.service !== 'post_construction' && !isMonthlyPlan(calc) && (
            <FirstTimeToggle state={calc} update={update} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={field} />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={field} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={field} />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting || !quote.lines.length || !firstName || !lastName || !email}
            className="self-start px-8 py-3 rounded-full bg-accent text-dark-brown font-marcellus text-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Creating…' : 'Create job'}
          </button>
          {createdId && <p className="font-marcellus text-sm opacity-50">Created job {createdId}.</p>}
        </div>
        <div className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-8">
          <QuoteSummary quote={quote} title="Quote" />
          {quote.usesProposed && (
            <p className="font-sans text-xs text-amber-800 mt-3">This quote uses a proposed price that isn’t confirmed yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
