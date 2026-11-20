import {
  ADD_ONS,
  FREQUENCIES,
  POST_CONSTRUCTION_ITEMS,
  POST_CONSTRUCTION_MINIMUM,
  POST_CONSTRUCTION_PASSES,
  RESIDENTIAL,
  RESIDENTIAL_PACKAGES,
  STR_PACKAGES,
  STR_PLAN,
  STR_SIZES,
  FIRST_TIME_DISCOUNT,
  TIMING_FEES,
  type AddOn,
  type StrPackage,
  type StrSize,
} from './prices'
import { isHolidayOrSunday } from './holidays'
import { SHOW_PROPOSED } from './visibility'
import type {
  PostConstructionQuoteInput,
  Quote,
  QuoteInput,
  QuoteLine,
  QuoteOptions,
  ResidentialQuoteInput,
  SelectedAddOn,
  ServiceType,
  StrQuoteInput,
  TimingInput,
} from './types'

/** Round to the nearest $5. */
export const r5 = (n: number) => Math.round(n / 5) * 5

export function formatMoney(n: number): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString('en-US')}`
}

const showProposed = (opts?: QuoteOptions) => opts?.includeProposed ?? SHOW_PROPOSED

// ─── What's visible ──────────────────────────────────────────────────────────

export function visibleStrPackages(opts?: QuoteOptions): StrPackage[] {
  return STR_PACKAGES.filter((p) => !p.proposed || showProposed(opts))
}

export function visibleFrequencies(opts?: QuoteOptions) {
  return FREQUENCIES.filter((f) => !f.proposed || showProposed(opts))
}

export function visibleAddOns(service: ServiceType, opts?: QuoteOptions): AddOn[] {
  if (service === 'post_construction') return []
  return ADD_ONS.filter(
    (a) =>
      (!a.proposed || showProposed(opts)) &&
      !(a.residentialOnly && service !== 'residential') &&
      !(a.strOnly && service !== 'str'),
  )
}

export function visiblePostConstructionItems(opts?: QuoteOptions) {
  return POST_CONSTRUCTION_ITEMS.filter((i) => !i.proposed || showProposed(opts))
}

export function getStrSize(key: string): StrSize | undefined {
  return STR_SIZES.find((s) => s.key === key)
}

export function strPackagePrice(size: StrSize, pkg: StrPackage): number {
  return size[pkg.priceField]
}

export function isStrPriceProposed(_size: StrSize, pkg: StrPackage): boolean {
  return !!pkg.proposed
}

/** Residential standard price before rounding: $50 + $0.09/sq ft + $25/bedroom + $40/bathroom. */
export function residentialStandard(sqft: number, beds: number, baths: number): number {
  return RESIDENTIAL.base + RESIDENTIAL.perSqft * sqft + RESIDENTIAL.perBedroom * beds + RESIDENTIAL.perBathroom * baths
}

export function residentialPackagePrice(sqft: number, beds: number, baths: number, multiplier: number): number {
  return r5(residentialStandard(sqft, beds, baths) * multiplier)
}

export function addOnUnitLabel(a: AddOn): string {
  return `${formatMoney(a.price)} ${a.unit}`
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function addOnQty(a: AddOn, qty: number): number {
  return a.perItem ? Math.max(a.min ?? 1, qty || 1) : 1
}

function addOnLines(
  selected: SelectedAddOn[],
  service: ServiceType,
  bundledIncluded: boolean,
  opts?: QuoteOptions,
): QuoteLine[] {
  const allowed = new Set(visibleAddOns(service, opts).map((a) => a.id))
  const lines: QuoteLine[] = []
  for (const sel of selected) {
    const a = ADD_ONS.find((x) => x.id === sel.id)
    if (!a || !allowed.has(a.id)) continue
    if (bundledIncluded && a.bundled) {
      lines.push({ label: a.name, amount: 0, included: true })
      continue
    }
    const q = addOnQty(a, sel.qty)
    lines.push({
      label: a.perItem ? `${a.name} × ${q}` : a.name,
      amount: a.price * q,
      proposed: a.proposed,
    })
  }
  return lines
}

function timingLines(t?: TimingInput): QuoteLine[] {
  if (!t) return []
  const lines: QuoteLine[] = []
  if (t.sameDay) lines.push({ label: TIMING_FEES.sameDay.label, amount: TIMING_FEES.sameDay.amount })
  if (t.sundayHoliday || (t.date && isHolidayOrSunday(t.date))) {
    lines.push({ label: TIMING_FEES.sundayHoliday.label, amount: TIMING_FEES.sundayHoliday.amount })
  }
  return lines
}

/** What the Standard plan saves a month against the same number of single (trial) turnovers. */
export function strPlanSavings(size: StrSize): number {
  return STR_PLAN.includedTurnovers * size.turnover - size.standardPlan
}

function firstTimeLine(base: number): QuoteLine {
  return { label: FIRST_TIME_DISCOUNT.label, amount: -Math.round(base * FIRST_TIME_DISCOUNT.percent) }
}

function finish(partial: Omit<Quote, 'total' | 'usesProposed'>): Quote {
  return {
    ...partial,
    total: partial.lines.reduce((s, l) => s + l.amount, 0),
    usesProposed: partial.lines.some((l) => l.proposed),
  }
}

function unavailable(reason: string, period: Quote['period'] = 'visit'): Quote {
  return { lines: [], total: 0, period, subs: [], notes: [], quoteRequired: true, quoteReason: reason, usesProposed: false }
}

/** Not enough information yet to show a price. */
function incomplete(reason: string): Quote {
  return { ...unavailable(reason), quoteRequired: false, incomplete: true }
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

function quoteStr(input: StrQuoteInput, opts?: QuoteOptions): Quote {
  const size = getStrSize(input.sizeKey)
  const pkg = STR_PACKAGES.find((p) => p.key === input.packageKey)
  if (!size || !pkg) return incomplete('Choose your property size to see a price.')
  const proposed = isStrPriceProposed(size, pkg)
  if (proposed && !showProposed(opts)) return unavailable('We’ll quote this package for you.')

  const lines: QuoteLine[] = []
  const addOns = addOnLines(input.addOns, 'str', false, opts)

  if (pkg.monthly) {
    lines.push({
      label: `${pkg.key === 'plan_standard' ? 'Standard' : 'Premium Care'} plan, ${STR_PLAN.includedTurnovers} turnovers`,
      amount: strPackagePrice(size, pkg),
    })
    const turns = Math.max(STR_PLAN.includedTurnovers, input.turnoversPerMonth ?? STR_PLAN.includedTurnovers)
    const extra = turns - STR_PLAN.includedTurnovers
    if (extra > 0) {
      lines.push({
        label: `${extra} extra turnover${extra > 1 ? 's' : ''} × ${formatMoney(size.extraTurnover)}`,
        amount: extra * size.extraTurnover,
      })
    }
    if (input.prepay) {
      const sub = lines.reduce((s, l) => s + l.amount, 0)
      lines.push({ label: 'Prepaid quarterly or yearly, 10% off', amount: -Math.round(sub * STR_PLAN.prepayDiscount) })
    }
    const planTotal = lines.reduce((s, l) => s + l.amount, 0)
    lines.push(...addOns)
    return finish({
      lines,
      period: 'month',
      subs: [{ label: 'Average per turnover', amount: Math.round(planTotal / turns) }],
      notes: [
        ...(pkg.key === 'plan_standard' && strPlanSavings(size) > 0
          ? [`Saves ${formatMoney(strPlanSavings(size))} a month compared with ${STR_PLAN.includedTurnovers} single turnovers.`]
          : []),
        `Monthly price. ${STR_PLAN.terms}`,
        `Had a trial turnover in the last ${STR_PLAN.trialCreditDays} days? We take it off your first month.`,
      ],
      quoteRequired: false,
    })
  }

  lines.push({ label: `${pkg.key === 'turnover' ? 'Trial turnover' : pkg.label}, ${size.label}`, amount: strPackagePrice(size, pkg), proposed })
  lines.push(...addOns, ...timingLines(input.timing))

  const notes: string[] = []
  if (pkg.key === 'turnover') {
    notes.push(
      `Join the Standard plan within ${STR_PLAN.trialCreditDays} days and we take this visit off your first month. ` +
        `The plan is ${formatMoney(size.standardPlan)}/mo for ${STR_PLAN.includedTurnovers} turnovers, ${formatMoney(strPlanSavings(size))} a month less than single visits.`,
    )
  }
  if (pkg.key === 'seasonal') notes.push('Best in the slow months: September–October and January–February. Premium Care includes one a year.')

  return finish({ lines, period: 'visit', subs: [], notes, quoteRequired: false })
}

function quoteResidential(input: ResidentialQuoteInput, opts?: QuoteOptions): Quote {
  const pkg = RESIDENTIAL_PACKAGES.find((p) => p.key === input.packageKey)
  if (!pkg) return unavailable('Choose a package.')
  if (!input.sqft || input.sqft <= 0) return incomplete('Enter the home’s square feet to see a price.')
  if (input.sqft > RESIDENTIAL.maxInstantSqft) {
    return unavailable(`Homes over ${RESIDENTIAL.maxInstantSqft.toLocaleString()} sq ft get a custom quote. Send a request and we’ll price it for you.`)
  }

  const std = residentialStandard(input.sqft, input.beds, input.baths)
  const lines: QuoteLine[] = []
  const home = `${input.sqft.toLocaleString()} sq ft, ${input.beds} bd / ${input.baths} ba`

  if (pkg.key === 'recurring') {
    lines.push({ label: `First visit, deep clean (${home})`, amount: r5(std * pkg.multiplier) })
    if (input.firstTime) lines.push(firstTimeLine(r5(std * pkg.multiplier)))
    lines.push(...addOnLines(input.addOns, 'residential', true, opts), ...timingLines(input.timing))

    const freq = visibleFrequencies(opts).find((f) => f.key === input.frequency)
    const freqLabel = FREQUENCIES.find((f) => f.key === input.frequency)?.label.toLowerCase() ?? 'recurring'
    if (!freq) {
      return finish({
        lines,
        period: 'visit',
        subs: [{ label: `Then per visit, ${freqLabel}`, amount: null }],
        notes: ['The first visit is a deep clean. We’ll confirm your recurring per-visit rate with you before your first clean. Add-ons on later visits are billed when done.'],
        quoteRequired: false,
      })
    }
    const visit = r5(std * (1 - freq.discount))
    const q = finish({
      lines,
      period: 'visit',
      subs: [
        { label: `Then per visit, ${freq.label.toLowerCase()}`, amount: visit },
        { label: 'About per month', amount: Math.round(visit * freq.visitsPerMonth) },
      ],
      notes: [
        `${freq.label} visits are ${Math.round(freq.discount * 100)}% off a one-time standard clean (${formatMoney(r5(std))}). Add-ons on later visits are billed when done.`,
      ],
      quoteRequired: false,
    })
    return { ...q, usesProposed: q.usesProposed || !!freq.proposed }
  }

  lines.push({ label: `${pkg.label} (${home})`, amount: r5(std * pkg.multiplier) })
  if (input.firstTime) lines.push(firstTimeLine(r5(std * pkg.multiplier)))
  lines.push(...addOnLines(input.addOns, 'residential', pkg.includesBundled, opts), ...timingLines(input.timing))
  return finish({ lines, period: 'visit', subs: [], notes: [], quoteRequired: false })
}

function quotePostConstruction(input: PostConstructionQuoteInput, opts?: QuoteOptions): Quote {
  const pass = POST_CONSTRUCTION_PASSES.find((p) => p.key === input.pass)
  if (!pass) return unavailable('Choose a clean.')
  if (!input.sqft || input.sqft <= 0) return incomplete('Enter the site’s square feet to see a price.')

  const lines: QuoteLine[] = []
  const base = input.sqft * pass.rate
  lines.push({ label: `${pass.label}, ${input.sqft.toLocaleString()} sq ft × $${pass.rate.toFixed(2)}`, amount: base })
  if (base < POST_CONSTRUCTION_MINIMUM.amount) {
    lines.push({ label: 'Job minimum', amount: POST_CONSTRUCTION_MINIMUM.amount - base })
  }
  for (const item of visiblePostConstructionItems(opts)) {
    const n = Math.max(0, Math.floor(input.counts[item.key] ?? 0))
    if (n > 0) lines.push({ label: `${item.label}, ${n} × ${formatMoney(item.price)}`, amount: n * item.price, proposed: item.proposed })
  }

  return finish({
    lines,
    period: 'visit',
    subs: [],
    notes: [
      'Windows are priced per window, on top of the sq ft price. If builders are still working and an area needs another pass, the extra pass is quoted separately.',
    ],
    quoteRequired: true,
    quoteReason: 'Post-construction jobs are confirmed after we review the site. This is an estimate.',
  })
}

export function calculateQuote(input: QuoteInput, opts?: QuoteOptions): Quote {
  switch (input.service) {
    case 'str':
      return quoteStr(input, opts)
    case 'residential':
      return quoteResidential(input, opts)
    case 'post_construction':
      return quotePostConstruction(input, opts)
  }
}

// ─── Labels for requests and emails ──────────────────────────────────────────

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  str: 'Short-term rental',
  residential: 'Residential',
  post_construction: 'Post-construction',
}

export function describePackage(input: QuoteInput): string {
  switch (input.service) {
    case 'str':
      return STR_PACKAGES.find((p) => p.key === input.packageKey)?.label ?? input.packageKey
    case 'residential': {
      const pkg = RESIDENTIAL_PACKAGES.find((p) => p.key === input.packageKey)?.label ?? input.packageKey
      const freq = input.packageKey === 'recurring' ? FREQUENCIES.find((f) => f.key === input.frequency)?.label : undefined
      return freq ? `${pkg}, ${freq.toLowerCase()}` : pkg
    }
    case 'post_construction':
      return POST_CONSTRUCTION_PASSES.find((p) => p.key === input.pass)?.label ?? input.pass
  }
}

export function describeProperty(input: QuoteInput): string {
  switch (input.service) {
    case 'str': {
      const s = getStrSize(input.sizeKey)
      return s ? `${s.label} (${s.sqft})` : input.sizeKey
    }
    case 'residential':
      return `${input.sqft.toLocaleString()} sq ft · ${input.beds} bd / ${input.baths} ba`
    case 'post_construction':
      return `${input.sqft.toLocaleString()} sq ft`
  }
}
