import type {
  FrequencyKey,
  PostConstructionItemKey,
  PostConstructionPass,
  ResidentialPackageKey,
  StrPackageKey,
} from './prices'
import { POST_CONSTRUCTION_PASSES, RESIDENTIAL_PACKAGES, STR_PACKAGES, STR_SIZES, FREQUENCIES } from './prices'
import type { QuoteInput, SelectedAddOn, ServiceType } from './types'

/** Everything the calculator and the booking form let a visitor choose. */
export interface CalcState {
  service: ServiceType
  strSize: string
  strPackage: StrPackageKey
  turnovers: number
  prepay: boolean
  sqft: number
  beds: number
  /** Full bathrooms. */
  baths: number
  /** Half baths, counted separately; each prices as 0.5 bathroom. */
  halfBaths: number
  resPackage: ResidentialPackageKey
  frequency: FrequencyKey
  pcSqft: number
  pcPass: PostConstructionPass
  pcCounts: Partial<Record<PostConstructionItemKey, number>>
  addOns: SelectedAddOn[]
  sameDay: boolean
  sundayHoliday: boolean
  /** First time booking with us: 20% off the first visit. */
  firstTime: boolean
}

export const DEFAULT_CALC_STATE: CalcState = {
  service: 'str',
  strSize: '3b2b',
  strPackage: 'turnover',
  turnovers: 5,
  prepay: false,
  sqft: 1500,
  beds: 3,
  baths: 2,
  halfBaths: 0,
  resPackage: 'recurring',
  frequency: 'biweekly',
  pcSqft: 2000,
  pcPass: 'rough',
  pcCounts: {},
  addOns: [],
  sameDay: false,
  sundayHoliday: false,
  firstTime: false,
}

/** Residential deep, move-in/out and the first recurring visit include the bundled add-ons. */
export function bundledIncluded(s: CalcState): boolean {
  return s.service === 'residential' && !!RESIDENTIAL_PACKAGES.find((p) => p.key === s.resPackage)?.includesBundled
}

export function isMonthlyPlan(s: CalcState): boolean {
  return s.service === 'str' && !!STR_PACKAGES.find((p) => p.key === s.strPackage)?.monthly
}

export function toQuoteInput(s: CalcState, date?: string): QuoteInput {
  const timing = { sameDay: s.sameDay, sundayHoliday: date ? false : s.sundayHoliday, date }
  switch (s.service) {
    case 'str':
      return {
        service: 'str',
        sizeKey: s.strSize,
        packageKey: s.strPackage,
        turnoversPerMonth: s.turnovers,
        prepay: s.prepay,
        addOns: s.addOns,
        firstTime: s.firstTime,
        timing,
      }
    case 'residential':
      return {
        service: 'residential',
        sqft: s.sqft,
        beds: s.beds,
        baths: s.baths + 0.5 * s.halfBaths,
        packageKey: s.resPackage,
        frequency: s.resPackage === 'recurring' ? s.frequency : undefined,
        addOns: s.addOns,
        firstTime: s.firstTime,
        timing,
      }
    case 'post_construction':
      return { service: 'post_construction', sqft: s.pcSqft, pass: s.pcPass, counts: s.pcCounts }
  }
}

// ─── Hand-off from the Pricing page calculator to /book ──────────────────────

const SERVICE_PARAM: Record<string, ServiceType> = {
  str: 'str',
  residential: 'residential',
  'post-construction': 'post_construction',
  post_construction: 'post_construction',
}

export function serviceParam(s: ServiceType): string {
  return s === 'post_construction' ? 'post-construction' : s
}

export function encodeCalcState(s: CalcState): string {
  const p = new URLSearchParams({ service: serviceParam(s.service), q: JSON.stringify(s) })
  return p.toString()
}

const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback)
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback

/** Reads ?service= and the optional ?q= state; anything malformed falls back to defaults. */
export function decodeCalcState(params: { service?: string; q?: string }): CalcState {
  const base: CalcState = { ...DEFAULT_CALC_STATE, service: SERVICE_PARAM[params.service ?? ''] ?? DEFAULT_CALC_STATE.service }
  if (!params.q) return base
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(params.q)
    if (!raw || typeof raw !== 'object') return base
  } catch {
    return base
  }
  const d = DEFAULT_CALC_STATE
  const addOns = Array.isArray(raw.addOns)
    ? (raw.addOns as unknown[])
        .filter((a): a is SelectedAddOn => !!a && typeof (a as SelectedAddOn).id === 'string')
        .map((a) => ({ id: a.id, qty: num(a.qty, 1) }))
    : []
  const counts: CalcState['pcCounts'] = {}
  if (raw.pcCounts && typeof raw.pcCounts === 'object') {
    for (const [k, v] of Object.entries(raw.pcCounts as Record<string, unknown>)) {
      counts[k as PostConstructionItemKey] = num(v, 0)
    }
  }
  return {
    service: base.service,
    strSize: oneOf(raw.strSize, STR_SIZES.map((x) => x.key), d.strSize),
    strPackage: oneOf(raw.strPackage, STR_PACKAGES.map((x) => x.key), d.strPackage),
    turnovers: num(raw.turnovers, d.turnovers),
    prepay: raw.prepay === true,
    sqft: num(raw.sqft, d.sqft),
    beds: num(raw.beds, d.beds),
    baths: num(raw.baths, d.baths),
    halfBaths: num(raw.halfBaths, d.halfBaths),
    resPackage: oneOf(raw.resPackage, RESIDENTIAL_PACKAGES.map((x) => x.key), d.resPackage),
    frequency: oneOf(raw.frequency, FREQUENCIES.map((x) => x.key), d.frequency),
    pcSqft: num(raw.pcSqft, d.pcSqft),
    pcPass: oneOf(raw.pcPass, POST_CONSTRUCTION_PASSES.map((x) => x.key), d.pcPass),
    pcCounts: counts,
    addOns,
    sameDay: raw.sameDay === true,
    sundayHoliday: raw.sundayHoliday === true,
    firstTime: raw.firstTime === true,
  }
}
