import Link from 'next/link'
import { STR_SIZES, POST_CONSTRUCTION_PASSES } from '@/lib/pricing/prices'
import { formatMoney } from '@/lib/pricing/engine'

const OPTIONS = [
  {
    service: 'str',
    title: 'Short-term rental',
    detail: `Turnovers from ${formatMoney(Math.min(...STR_SIZES.map((s) => s.turnover)))}, monthly plans, seasonal deep cleans`,
  },
  {
    service: 'residential',
    title: 'Residential',
    detail: 'Recurring, one-time, deep and move-in / move-out cleans, priced by size',
  },
  {
    service: 'post-construction',
    title: 'Post-construction',
    detail: `Rough and final cleans from $${Math.min(...POST_CONSTRUCTION_PASSES.map((p) => p.rate)).toFixed(2)} per sq ft`,
  },
]

/** Home page entry point into the booking flow at /book. */
export function BookingStartPanel() {
  return (
    <div className="bg-stone text-dark-brown rounded-2xl overflow-hidden w-full max-w-[460px] mx-auto">
      <div className="border-b border-dark-brown/10 px-6 py-4">
        <span className="font-marcellus text-sm tracking-wide">Book a cleaning</span>
      </div>
      <div className="px-6 py-2">
        {OPTIONS.map((o, i) => (
          <Link
            key={o.service}
            href={`/book?service=${o.service}`}
            className={`flex items-center justify-between gap-4 py-5 no-underline text-dark-brown group ${i > 0 ? 'border-t border-dark-brown/8' : ''}`}
          >
            <span>
              <span className="block font-marcellus text-base">{o.title}</span>
              <span className="block font-marcellus text-xs opacity-50 mt-0.5">{o.detail}</span>
            </span>
            <span className="px-5 py-2 bg-dark-brown text-stone font-marcellus text-[10px] tracking-widest uppercase rounded group-hover:opacity-80 transition-opacity flex-shrink-0">
              Book
            </span>
          </Link>
        ))}
      </div>
      <div className="border-t border-dark-brown/10 px-6 py-4 flex flex-wrap justify-between gap-2 font-marcellus text-xs">
        <Link href="/pricing" className="text-dark-brown underline">See all prices</Link>
        <Link href="/contact" className="text-dark-brown opacity-60 hover:opacity-100">Prefer to talk first? Free consultation</Link>
      </div>
    </div>
  )
}
