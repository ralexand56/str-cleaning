import { formatMoney } from '@/lib/pricing/engine'
import type { Quote } from '@/lib/pricing/types'
import { ProposedTag } from './AddOnTiles'

/** Line items, total, follow-on figures and notes for a quote. Used by the calculator and booking. */
export function QuoteSummary({ quote, title = 'Your estimate' }: { quote: Quote; title?: string }) {
  const hasPrice = quote.lines.length > 0
  return (
    <div className="rounded-2xl border border-dark-brown/12 bg-stone overflow-hidden">
      <div className="border-b border-dark-brown/10 px-6 py-4">
        <p className="font-marcellus text-xs uppercase tracking-[0.2em] opacity-50">{title}</p>
      </div>
      <div className="px-6 py-5 flex flex-col gap-2.5">
        {quote.lines.map((l, i) => (
          <div key={`${l.label}-${i}`} className="flex justify-between gap-4 font-marcellus text-sm">
            <span className="opacity-70">
              {l.label}
              {l.proposed && <ProposedTag />}
            </span>
            <span className="flex-shrink-0 opacity-80">{l.included ? 'Included' : formatMoney(l.amount)}</span>
          </div>
        ))}
        {!hasPrice && <p className="font-marcellus text-sm opacity-60">{quote.quoteReason ?? 'Make a few choices to see a price.'}</p>}
      </div>
      {hasPrice && (
        <div className="border-t border-dark-brown/10 px-6 py-5 flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="font-marcellus text-sm">{quote.quoteRequired ? 'Estimated total' : 'Total'}</span>
            <span className="font-marcellus text-2xl">
              {formatMoney(quote.total)}
              {quote.period === 'month' ? <span className="text-sm opacity-60">/mo</span> : null}
            </span>
          </div>
          {quote.subs.map((s) => (
            <div key={s.label} className="flex justify-between font-marcellus text-sm opacity-60">
              <span>{s.label}</span>
              <span>{s.amount === null ? 'Confirmed with you' : formatMoney(s.amount)}</span>
            </div>
          ))}
          {quote.quoteRequired && quote.quoteReason && (
            <p className="font-marcellus text-xs opacity-60 mt-2 leading-relaxed">{quote.quoteReason}</p>
          )}
          {quote.notes.map((n) => (
            <p key={n} className="font-marcellus text-xs opacity-50 leading-relaxed">{n}</p>
          ))}
          <p className="font-marcellus text-xs opacity-40 leading-relaxed">
            Booking is a request: we confirm your final price and time before the visit.
          </p>
        </div>
      )}
    </div>
  )
}
