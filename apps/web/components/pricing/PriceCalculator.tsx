'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { calculateQuote, formatMoney } from '@/lib/pricing/engine'
import {
  DEFAULT_CALC_STATE,
  bundledIncluded,
  encodeCalcState,
  isMonthlyPlan,
  toQuoteInput,
  type CalcState,
} from '@/lib/pricing/calcState'
import { AddOnTiles } from './AddOnTiles'
import { QuoteSummary } from './QuoteSummary'
import { FirstTimeToggle, ServiceInputs, ServiceTabs, TimingInputs, fieldLabel } from './ServiceInputs'

/** Public price calculator (Pricing page). Choose service, size, package, add-ons; see a running total. */
export function PriceCalculator({ initial }: { initial?: Partial<CalcState> }) {
  const [state, setState] = useState<CalcState>({ ...DEFAULT_CALC_STATE, ...initial })
  const update = (patch: Partial<CalcState>) => setState((prev) => ({ ...prev, ...patch }))
  const quote = useMemo(() => calculateQuote(toQuoteInput(state)), [state])
  const bookHref = `/book?${encodeCalcState(state)}`
  const showTiming = state.service !== 'post_construction' && !isMonthlyPlan(state)

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      <div className="flex-1 min-w-0 w-full flex flex-col gap-10">
        <ServiceTabs value={state.service} onChange={(service) => update({ service, addOns: [] })} />
        <ServiceInputs state={state} update={update} />
        {state.service !== 'post_construction' && (
          <div>
            <span className={fieldLabel}>Add-ons</span>
            <AddOnTiles
              service={state.service}
              selected={state.addOns}
              onChange={(addOns) => update({ addOns })}
              bundledIncluded={bundledIncluded(state)}
            />
          </div>
        )}
        {showTiming && (
          <div className="flex flex-col gap-4">
            <span className={fieldLabel}>Timing and discounts</span>
            <TimingInputs state={state} update={update} withSundayToggle />
            <FirstTimeToggle state={state} update={update} />
          </div>
        )}
      </div>

      {/* Desktop: sticky side panel. Phones: the panel follows the form, plus a sticky total bar. */}
      <aside className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-8 flex flex-col gap-4">
        <QuoteSummary quote={quote} />
        <div className="flex gap-3">
          <Link
            href={bookHref}
            className="flex-1 text-center px-6 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-sm no-underline hover:opacity-80 transition-opacity"
          >
            Book now
          </Link>
          <Link
            href={`/contact`}
            className="flex-1 text-center px-6 py-4 rounded-full border border-dark-brown/30 font-marcellus text-sm no-underline hover:border-dark-brown transition-colors"
          >
            Get a quote
          </Link>
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-stone/95 backdrop-blur border-t border-dark-brown/15 px-4 py-3 flex items-center justify-between gap-4">
        <span className="font-marcellus text-sm">
          {quote.lines.length ? (
            <>
              {quote.quoteRequired ? 'Estimate ' : 'Total '}
              <span className="text-lg">{formatMoney(quote.total)}</span>
              {quote.period === 'month' ? '/mo' : ''}
            </>
          ) : (
            'Custom quote'
          )}
        </span>
        <Link href={bookHref} className="px-5 py-2.5 rounded-full bg-dark-brown text-stone font-marcellus text-sm no-underline">
          Book now
        </Link>
      </div>
    </div>
  )
}
