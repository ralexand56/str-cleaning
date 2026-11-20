import { Navbar } from '@/components/Navbar'
import { PriceCalculator } from '@/components/pricing/PriceCalculator'
import { ProposedTag } from '@/components/pricing/AddOnTiles'
import {
  ADD_ON_GROUPS,
  DEPOSIT,
  POLICY_FEES,
  POST_CONSTRUCTION_MINIMUM,
  POST_CONSTRUCTION_PASSES,
  STR_PLAN,
  STR_SIZES,
  TIMING_FEES,
} from '@/lib/pricing/prices'
import {
  addOnUnitLabel,
  formatMoney,
  r5,
  residentialStandard,
  visibleAddOns,
  visibleFrequencies,
  visiblePostConstructionItems,
} from '@/lib/pricing/engine'
import { SHOW_PROPOSED } from '@/lib/pricing/visibility'
import { serviceAreaText } from '@/lib/booking/serviceArea'

export const metadata = {
  title: 'Pricing — STR Cleaning Crew',
  description: 'Prices for short-term rental, residential and post-construction cleaning, with an instant estimate.',
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-dark-brown/12">
      <table className="w-full font-marcellus text-sm border-collapse">
        <thead>
          <tr className="bg-dark-brown/[0.04]">
            {head.map((h, i) => (
              <th key={h} scope="col" className={`px-4 py-3 font-normal opacity-60 whitespace-nowrap ${i ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-dark-brown/10">
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-3 ${j ? 'text-right whitespace-nowrap' : 'text-left'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const RES_EXAMPLES: [number, number, number][] = [
  [650, 1, 1],
  [1000, 2, 2],
  [1500, 3, 2],
  [2000, 3, 3],
  [2500, 4, 3],
  [3200, 5, 4],
]

export default function PricingPage() {
  const freqs = visibleFrequencies()
  const pcItems = visiblePostConstructionItems()
  const addOns = [...new Map([...visibleAddOns('str'), ...visibleAddOns('residential')].map((a) => [a.id, a])).values()]

  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <Navbar />

      <main className="flex-1 px-5 py-16 max-sm:py-10 pb-28 lg:pb-16">
        <div className="max-w-[1080px] mx-auto flex flex-col gap-20">
          <header>
            <h1 className="font-marcellus text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] mb-3 animate-rise">Pricing</h1>
            <p className="font-marcellus text-base opacity-60 max-w-2xl animate-rise-delay-1">
              Choose your service, size, package and add-ons to see your price. Booking is a request: we review it and
              confirm your final price and time.
            </p>
            <p className="font-marcellus text-sm opacity-60 max-w-2xl mt-3">Serving {serviceAreaText()}.</p>
            {SHOW_PROPOSED && (
              <p className="mt-4 font-sans text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 max-w-2xl">
                Review mode: prices tagged Proposed are not confirmed and are hidden on the live site.
              </p>
            )}
          </header>

          <section aria-labelledby="calc">
            <h2 id="calc" className="font-marcellus text-2xl mb-8">Price calculator</h2>
            <PriceCalculator />
          </section>

          <section aria-labelledby="str" className="flex flex-col gap-5">
            <h2 id="str" className="font-marcellus text-2xl">Short-term rentals</h2>
            <Table
              head={['Size', 'Turnover', 'Extra turnover on a plan', 'Standard plan /mo', 'Premium Care /mo']}
              rows={STR_SIZES.map((s) => [
                <span key="l">{s.label}<span className="block text-xs opacity-50">{s.sqft}</span></span>,
                formatMoney(s.turnover),
                formatMoney(s.extraTurnover),
                formatMoney(s.standardPlan),
                formatMoney(s.premiumPlan),
              ])}
            />
            <Table
              head={['Size', 'Seasonal deep clean', 'STR start-up']}
              rows={STR_SIZES.map((s) => [
                s.label,
                formatMoney(s.seasonal),
                formatMoney(s.startup),
              ])}
            />
            <ul className="font-marcellus text-sm opacity-70 list-disc pl-5 flex flex-col gap-1.5">
              <li>Monthly plans include {STR_PLAN.includedTurnovers} turnovers. In a month with fewer bookings the crew uses the time for a deeper clean.</li>
              <li>3-month minimum, then month to month with 30 days’ notice. Prepay quarterly or yearly for 10% off.</li>
              <li>Charging cameras, locks and smart devices is included in every turnover.</li>
            </ul>
          </section>

          <section aria-labelledby="res" className="flex flex-col gap-5">
            <h2 id="res" className="font-marcellus text-2xl">Residential</h2>
            <p className="font-marcellus text-sm opacity-70 max-w-3xl">
              Standard clean = $50 + $0.09 per sq ft + $25 per bedroom + $40 per bathroom, rounded to $5. Deep clean =
              standard × 1.7. Move-in / move-out = standard × 2. The first visit of a recurring plan is a deep clean.
              Homes over 3,500 sq ft get a custom quote. Examples:
            </p>
            <Table
              head={['Home', 'Standard', ...freqs.map((f) => f.label), 'Deep', 'Move-in / out']}
              rows={RES_EXAMPLES.map(([sq, b, ba]) => {
                const s = residentialStandard(sq, b, ba)
                return [
                  `${sq.toLocaleString()} sq ft · ${b} bd / ${ba} ba`,
                  formatMoney(r5(s)),
                  ...freqs.map((f) => <span key={f.key}>{formatMoney(r5(s * (1 - f.discount)))}</span>),
                  formatMoney(r5(s * 1.7)),
                  formatMoney(r5(s * 2)),
                ]
              })}
            />
            {freqs.length > 0 && (
              <p className="font-marcellus text-sm opacity-70">
                Recurring visits: {freqs.map((f) => `${f.label.toLowerCase()} ${Math.round(f.discount * 100)}% off`).join(', ')} a one-time standard clean.
                {freqs.some((f) => f.proposed) && <ProposedTag />}
              </p>
            )}
          </section>

          <section aria-labelledby="pc" className="flex flex-col gap-5">
            <h2 id="pc" className="font-marcellus text-2xl">Post-construction</h2>
            <Table
              head={['Service', 'Price']}
              rows={[
                ...POST_CONSTRUCTION_PASSES.map((p) => [
                  <span key="l">{p.label}<span className="block text-xs opacity-50">{p.description}</span></span>,
                  `$${p.rate.toFixed(2)} / sq ft`,
                ]),
                ...pcItems.map((i) => [
                  <span key={i.key}>{i.label}{i.proposed && <ProposedTag />}</span>,
                  `${formatMoney(i.price)} ${i.unit.startsWith('per') ? i.unit.split(',')[0] : i.unit}`,
                ]),
                ['Job minimum', formatMoney(POST_CONSTRUCTION_MINIMUM.amount)],
              ]}
            />
            <p className="font-marcellus text-sm opacity-70 max-w-3xl">
              Windows are always priced on top of the sq ft price. If builders are still working and an area needs another
              pass, the extra pass is quoted separately. Not included: debris haul-away, paint or grout removal beyond light
              scraping.
            </p>
          </section>

          <section aria-labelledby="addons" className="flex flex-col gap-5">
            <h2 id="addons" className="font-marcellus text-2xl">Add-ons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ADD_ON_GROUPS.map((g) => {
                const list = addOns.filter((a) => a.group === g)
                if (!list.length) return null
                return (
                  <Table
                    key={g}
                    head={[g, 'Price']}
                    rows={list.map((a) => [
                      <span key={a.id}>
                        {a.name}
                        {a.residentialOnly ? ' (residential)' : a.strOnly ? ' (short-term rentals)' : ''}
                        {a.proposed && <ProposedTag />}
                        {a.note && <span className="block text-xs opacity-50">{a.note}</span>}
                      </span>,
                      addOnUnitLabel(a),
                    ])}
                  />
                )
              })}
            </div>
            <p className="font-marcellus text-sm opacity-70">
              In a residential deep clean, move-in / move-out and the first recurring visit, the kitchen appliances, inside
              windows, blinds, baseboards and doors are included.
            </p>
          </section>

          <section aria-labelledby="policies" className="flex flex-col gap-5">
            <h2 id="policies" className="font-marcellus text-2xl">Timing fees and policies</h2>
            <Table
              head={['Item', 'Price']}
              rows={[
                [TIMING_FEES.sameDay.label, `+${formatMoney(TIMING_FEES.sameDay.amount)}`],
                [TIMING_FEES.sundayHoliday.label, `+${formatMoney(TIMING_FEES.sundayHoliday.amount)}`],
                [POLICY_FEES.lateCancel.label, formatMoney(POLICY_FEES.lateCancel.amount)],
                [POLICY_FEES.waiting.label, `${formatMoney(POLICY_FEES.waiting.amount)} ${POLICY_FEES.waiting.unit}`],
                ['Reschedule 48+ hours before', 'Free'],
                ['Lockout (crew can’t get in)', 'Treated as a late cancellation'],
                ...(!DEPOSIT.proposed || SHOW_PROPOSED
                  ? [
                      [<span key="d">Deposit at booking{DEPOSIT.proposed && <ProposedTag />}</span>, `${formatMoney(DEPOSIT.flat)}, or ${Math.round(DEPOSIT.percent * 100)}% on move-out and post-construction jobs over ${formatMoney(DEPOSIT.percentOver)}. Goes toward your bill; kept if you cancel less than 48 hours before.`],
                    ]
                  : []),
              ]}
            />
            <div className="font-marcellus text-sm opacity-80 max-w-3xl flex flex-col gap-3">
              <h3 className="text-lg">Products</h3>
              <p>By default we clean with our own professional products. That’s how we keep our quality standard.</p>
              <p>Your own products: if you’d like eco-friendly or specific products, we can use yours on request. Leave them out where the crew can find them.</p>
              <p>Short-term rentals: toilets, showers and kitchens are always disinfected with our own disinfectant, whatever else is used, for guest safety.</p>
              <p>We don’t use harsh or strong chemicals supplied by the client. When your own products are used, we can’t guarantee the cleaning result.</p>
              <h3 className="text-lg mt-3">Re-clean promise</h3>
              <p>If something on the checklist was missed, tell us within 24 hours with photos and we come back to fix it at no charge.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
