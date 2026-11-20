'use client'

import { useState } from 'react'
import {
  FREQUENCIES,
  RESIDENTIAL_PACKAGES,
  STR_PACKAGES,
  FIRST_TIME_DISCOUNT,
  STR_PLAN,
  STR_SIZES,
  POST_CONSTRUCTION_PASSES,
  type StrPackage,
} from '@/lib/pricing/prices'
import {
  formatMoney,
  getStrSize,
  isStrPriceProposed,
  r5,
  residentialStandard,
  strPlanSavings,
  visibleFrequencies,
  visiblePostConstructionItems,
  visibleStrPackages,
} from '@/lib/pricing/engine'
import type { CalcState } from '@/lib/pricing/calcState'
import type { QuoteOptions, ServiceType } from '@/lib/pricing/types'
import { ProposedTag } from './AddOnTiles'

export const SERVICE_TABS: { value: ServiceType; label: string }[] = [
  { value: 'str', label: 'Short-term rental' },
  { value: 'residential', label: 'Residential' },
  { value: 'post_construction', label: 'Post-construction' },
]

export const fieldLabel = 'font-marcellus text-xs opacity-50 uppercase tracking-widest mb-3 block'
const numberInput =
  'font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-full focus:outline-none focus:border-dark-brown transition-colors'

export function ServiceTabs({ value, onChange }: { value: ServiceType; onChange: (s: ServiceType) => void }) {
  return (
    <div role="tablist" aria-label="Service" className="flex flex-wrap gap-2">
      {SERVICE_TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={[
            'px-5 py-2.5 rounded-full border font-marcellus text-sm transition-colors cursor-pointer',
            value === t.value ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function OptionCard({
  selected,
  onSelect,
  title,
  description,
  price,
  proposed,
  name,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  price?: string
  proposed?: boolean
  name: string
}) {
  return (
    <label
      className={[
        'flex items-start gap-4 px-5 py-4 rounded-2xl border cursor-pointer transition-colors',
        selected ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35',
      ].join(' ')}
    >
      <input type="radio" name={name} checked={selected} onChange={onSelect} className="mt-1.5 accent-[#44362a]" />
      <span className="flex-1 min-w-0">
        <span className="font-marcellus text-base">
          {title}
          {proposed && <ProposedTag />}
        </span>
        {description && <span className="block font-marcellus text-sm opacity-55 mt-1">{description}</span>}
      </span>
      {price && <span className="font-marcellus text-sm opacity-70 flex-shrink-0 mt-0.5">{price}</span>}
    </label>
  )
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  id: string
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="flex-1 min-w-[120px]">
      <label htmlFor={id} className="font-marcellus text-sm opacity-60 block mb-2">{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const n = parseFloat(e.target.value)
          onChange(Number.isNaN(n) ? 0 : Math.max(min, n))
        }}
        className={numberInput}
      />
    </div>
  )
}

/** The two main STR choices, side by side: try one turnover or join the monthly plan. */
function PlanCard({
  selected,
  onSelect,
  title,
  badge,
  price,
  highlight,
  description,
  footnote,
  proposed,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  badge?: string
  price?: string
  highlight?: string
  description: string
  footnote: string
  proposed?: boolean
}) {
  return (
    <label
      className={[
        'relative flex flex-col gap-2 px-5 pt-5 pb-4 rounded-2xl border cursor-pointer transition-colors',
        selected ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35',
      ].join(' ')}
    >
      <input type="radio" name="strPackage" checked={selected} onChange={onSelect} className="sr-only" />
      {badge && (
        <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-dark-brown text-stone font-marcellus text-[11px] tracking-wide">
          {badge}
        </span>
      )}
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-marcellus text-lg">
          {title}
          {proposed && <ProposedTag />}
        </span>
        <span aria-hidden className={['w-4 h-4 rounded-full border flex-shrink-0 self-center', selected ? 'border-dark-brown border-[5px]' : 'border-dark-brown/30'].join(' ')} />
      </span>
      <span className="font-marcellus text-2xl">{price ?? <span className="text-sm opacity-50">Choose your size for a price</span>}</span>
      {highlight && <span className="font-marcellus text-sm text-[#3f6b3a]">{highlight}</span>}
      <span className="font-marcellus text-sm opacity-60">{description}</span>
      <span className="font-marcellus text-xs opacity-50 mt-auto pt-1">{footnote}</span>
    </label>
  )
}

const HELPER_QUESTIONS = [
  'Has it been more than 2 months since a professional clean?',
  'Do you see grease on cabinet fronts or the range hood, or buildup on baseboards?',
  'Are there hard-water stains or soap scum in showers?',
]

/** "Which package do I need?" (plan §2): any yes recommends a deep clean. */
function PackageHelper({ onRecommend }: { onRecommend: () => void }) {
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null])
  const anyYes = answers.some((a) => a === true)
  const allAnswered = answers.every((a) => a !== null)
  return (
    <details className="rounded-2xl border border-dark-brown/12 px-5 py-4">
      <summary className="font-marcellus text-sm cursor-pointer">Which package do I need?</summary>
      <div className="flex flex-col gap-3 mt-4">
        {HELPER_QUESTIONS.map((q, i) => (
          <div key={q} className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-marcellus text-sm opacity-70 flex-1 min-w-[200px]">{q}</span>
            <span className="flex gap-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={answers[i] === v}
                  onClick={() => setAnswers((prev) => prev.map((p, j) => (j === i ? v : p)))}
                  className={[
                    'px-4 py-1.5 rounded-full border font-marcellus text-xs cursor-pointer',
                    answers[i] === v ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20',
                  ].join(' ')}
                >
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </span>
          </div>
        ))}
        {anyYes && (
          <p className="font-marcellus text-sm">
            We recommend a <strong>Deep clean</strong> (or Standard plus the add-ons you need).{' '}
            <button type="button" onClick={onRecommend} className="underline cursor-pointer bg-transparent border-none p-0 font-marcellus">
              Choose Deep clean
            </button>
          </p>
        )}
        {!anyYes && allAnswered && <p className="font-marcellus text-sm">A Standard clean should be right for your home.</p>}
      </div>
    </details>
  )
}

const selectCls =
  'font-marcellus text-base bg-transparent border-b border-dark-brown/25 pb-2 w-full max-w-md focus:outline-none focus:border-dark-brown'

type InputsProps = {
  state: CalcState
  update: (patch: Partial<CalcState>) => void
  options?: QuoteOptions
}

/** The property: STR size, residential sq ft / bedrooms / bathrooms, post-construction site and extras. */
export function HomeInputs({ state, update, options }: InputsProps) {
  if (state.service === 'str') {
    return (
      <div>
        <label htmlFor="strSize" className={fieldLabel}>Property size</label>
        <select id="strSize" value={state.strSize} onChange={(e) => update({ strSize: e.target.value })} className={selectCls}>
          {!state.strSize && <option value="" disabled>Choose bedrooms and bathrooms</option>}
          {STR_SIZES.map((s) => (
            <option key={s.key} value={s.key}>{s.label} · {s.sqft}</option>
          ))}
        </select>
      </div>
    )
  }

  if (state.service === 'residential') {
    return (
      <div>
        <span className={fieldLabel}>The home</span>
        <div className="flex flex-wrap gap-6">
          <NumberField id="sqft" label="Square feet" value={state.sqft} min={0} max={20000} step={50} onChange={(n) => update({ sqft: Math.round(n) })} />
          <NumberField id="beds" label="Bedrooms" value={state.beds} min={0} max={10} onChange={(n) => update({ beds: Math.round(n) })} />
          <NumberField id="baths" label="Full bathrooms" value={state.baths} min={0} max={10} onChange={(n) => update({ baths: Math.round(n) })} />
          <NumberField id="halfBaths" label="Half baths" value={state.halfBaths} min={0} max={5} onChange={(n) => update({ halfBaths: Math.round(n) })} />
        </div>
      </div>
    )
  }

  const items = visiblePostConstructionItems(options)
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-xs">
        <NumberField id="pcSqft" label="Square feet" value={state.pcSqft} min={0} max={50000} step={50} onChange={(n) => update({ pcSqft: Math.round(n) })} />
      </div>
      <div>
        <span className={fieldLabel}>Extras, always priced separately</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.key}>
              <NumberField
                id={`pc-${item.key}`}
                label={`${item.label} (${formatMoney(item.price)} ${item.unit})`}
                value={state.pcCounts[item.key] ?? 0}
                max={1000}
                onChange={(n) => update({ pcCounts: { ...state.pcCounts, [item.key]: Math.round(n) } })}
              />
              {item.proposed && <ProposedTag />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Package choice with the price next to each one. */
export function PackageInputs({ state, update, options }: InputsProps) {
  if (state.service === 'str') {
    const size = getStrSize(state.strSize)
    const packages = visibleStrPackages(options)
    const main = packages.filter((p) => p.key === 'turnover' || p.key === 'plan_standard')
    const more = packages.filter((p) => !main.includes(p))
    const price = (p: StrPackage) => (size ? `${formatMoney(size[p.priceField])}${p.monthly ? '/mo' : ''}` : undefined)
    const savings = size ? strPlanSavings(size) : 0
    return (
      <div className="flex flex-col gap-4">
        <span className={`${fieldLabel} !mb-0`}>Package</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-6 pt-1">
          {main.map((p) => (
            <PlanCard
              key={p.key}
              selected={state.strPackage === p.key}
              onSelect={() => update({ strPackage: p.key })}
              title={p.key === 'plan_standard' ? 'Monthly plan' : p.label}
              badge={p.key === 'plan_standard' ? 'Most popular' : undefined}
              price={price(p)}
              highlight={p.key === 'plan_standard' && savings > 0 ? `Save ${formatMoney(savings)} a month` : undefined}
              description={p.description}
              footnote={
                p.key === 'turnover'
                  ? `Join the plan within ${STR_PLAN.trialCreditDays} days and we take this visit off your first month.`
                  : '3-month minimum, then month to month.'
              }
              proposed={!!size && isStrPriceProposed(size, p)}
            />
          ))}
        </div>
        {more.length > 0 && (
          <details className="group" open={more.some((p) => p.key === state.strPackage)}>
            <summary className="font-marcellus text-sm cursor-pointer w-fit opacity-70 hover:opacity-100">More options</summary>
            <div className="flex flex-col gap-2 mt-3">
              {more.map((p) => (
                <OptionCard
                  key={p.key}
                  name="strPackage"
                  selected={state.strPackage === p.key}
                  onSelect={() => update({ strPackage: p.key })}
                  title={p.label}
                  description={p.description}
                  price={price(p)}
                  proposed={!!size && isStrPriceProposed(size, p)}
                />
              ))}
            </div>
          </details>
        )}
      </div>
    )
  }

  if (state.service === 'residential') {
    const std = residentialStandard(state.sqft, state.beds, state.baths + 0.5 * state.halfBaths)
    const freqs = visibleFrequencies(options)
    const bestFreq = freqs.reduce<number | null>((best, f) => (best === null || f.discount > best ? f.discount : best), null)
    return (
      <div className="flex flex-col gap-6">
        <PackageHelper onRecommend={() => update({ resPackage: 'deep' })} />
        <div>
          <span className={fieldLabel}>Package</span>
          <div className="flex flex-col gap-2">
            {RESIDENTIAL_PACKAGES.map((p) => {
              const price =
                p.key === 'recurring'
                  ? bestFreq !== null
                    ? `from ${formatMoney(r5(std * (1 - bestFreq)))}/visit`
                    : `first visit ${formatMoney(r5(std * p.multiplier))}`
                  : formatMoney(r5(std * p.multiplier))
              return (
                <OptionCard
                  key={p.key}
                  name="resPackage"
                  selected={state.resPackage === p.key}
                  onSelect={() => update({ resPackage: p.key })}
                  title={p.label}
                  description={p.description}
                  price={price}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <span className={fieldLabel}>Clean</span>
      <div className="flex flex-col gap-2">
        {POST_CONSTRUCTION_PASSES.map((p) => (
          <OptionCard
            key={p.key}
            name="pcPass"
            selected={state.pcPass === p.key}
            onSelect={() => update({ pcPass: p.key })}
            title={p.label}
            description={`${p.description} Window washing is separate.`}
            price={`$${p.rate.toFixed(2)}/sq ft`}
          />
        ))}
      </div>
    </div>
  )
}

/** Whether there's a "how often" choice: residential recurring or an STR monthly plan. */
export function hasFrequencyChoice(state: CalcState): boolean {
  if (state.service === 'residential') return state.resPackage === 'recurring'
  if (state.service === 'str') return !!STR_PACKAGES.find((p) => p.key === state.strPackage)?.monthly
  return false
}

/** How often: residential frequency, or STR turnovers per month and prepay. */
export function FrequencyInputs({ state, update, options }: InputsProps) {
  if (state.service === 'str') {
    return (
      <div className="flex flex-wrap gap-6 items-end">
        <NumberField
          id="turnovers"
          label="Turnovers expected per month"
          value={state.turnovers}
          min={STR_PLAN.includedTurnovers}
          max={31}
          onChange={(n) => update({ turnovers: Math.round(n) })}
        />
        <label className="flex items-center gap-3 cursor-pointer font-marcellus text-sm">
          <input type="checkbox" checked={state.prepay} onChange={(e) => update({ prepay: e.target.checked })} className="w-4 h-4" />
          Prepay quarterly or yearly (10% off)
        </label>
      </div>
    )
  }
  const std = residentialStandard(state.sqft, state.beds, state.baths + 0.5 * state.halfBaths)
  const freqs = visibleFrequencies(options)
  return (
    <div>
      <span className={fieldLabel}>How often</span>
      <div className="flex flex-col gap-2">
        {FREQUENCIES.map((f) => {
          const shown = freqs.find((v) => v.key === f.key)
          return (
            <OptionCard
              key={f.key}
              name="frequency"
              selected={state.frequency === f.key}
              onSelect={() => update({ frequency: f.key })}
              title={f.label}
              description={shown ? `${Math.round(f.discount * 100)}% off a standard clean` : undefined}
              price={shown ? `${formatMoney(r5(std * (1 - f.discount)))}/visit` : undefined}
              proposed={!!shown?.proposed}
            />
          )
        })}
      </div>
    </div>
  )
}

/** All service choices in one column (Pricing page calculator, admin quote builder). */
export function ServiceInputs(props: InputsProps) {
  return (
    <div className="flex flex-col gap-8">
      <HomeInputs {...props} />
      <PackageInputs {...props} />
      {hasFrequencyChoice(props.state) && <FrequencyInputs {...props} />}
    </div>
  )
}

/** First-time client tick box: 20% off the first residential visit (not short-term rentals or post-construction). */
export function FirstTimeToggle({ state, update }: { state: CalcState; update: (patch: Partial<CalcState>) => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer w-fit font-marcellus text-sm">
      <input type="checkbox" checked={state.firstTime} onChange={(e) => update({ firstTime: e.target.checked })} className="w-4 h-4 mt-0.5" />
      <span>
        This is my first time booking with STR Cleaning Crew
        <span className="block text-xs opacity-60">{Math.round(FIRST_TIME_DISCOUNT.percent * 100)}% off your first residential clean</span>
      </span>
    </label>
  )
}

export function TimingInputs({ state, update, withSundayToggle }: {
  state: CalcState
  update: (patch: Partial<CalcState>) => void
  /** The calculator has no date, so it offers a Sunday/holiday tick box. Booking derives it from the date. */
  withSundayToggle: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-3 cursor-pointer w-fit font-marcellus text-sm">
        <input type="checkbox" checked={state.sameDay} onChange={(e) => update({ sameDay: e.target.checked })} className="w-4 h-4" />
        Same-day call-out (+$50)
      </label>
      {withSundayToggle && (
        <label className="flex items-center gap-3 cursor-pointer w-fit font-marcellus text-sm">
          <input type="checkbox" checked={state.sundayHoliday} onChange={(e) => update({ sundayHoliday: e.target.checked })} className="w-4 h-4" />
          Sunday or holiday (+$50)
        </label>
      )}
    </div>
  )
}
