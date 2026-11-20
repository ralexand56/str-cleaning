import type {
  FrequencyKey,
  PostConstructionItemKey,
  PostConstructionPass,
  ResidentialPackageKey,
  StrPackageKey,
} from './prices'

export type ServiceType = 'str' | 'residential' | 'post_construction'

export interface SelectedAddOn {
  id: string
  qty: number
}

export interface TimingInput {
  sameDay?: boolean
  /** Tick box on the calculator; booking derives it from the date instead. */
  sundayHoliday?: boolean
  /** ISO date — Sunday or a US holiday adds the Sunday/holiday fee. */
  date?: string
}

export interface StrQuoteInput {
  service: 'str'
  sizeKey: string
  packageKey: StrPackageKey
  turnoversPerMonth?: number
  /** First-time client: 20% off a single-visit package's price. Ignored for monthly plans. */
  firstTime?: boolean
  prepay?: boolean
  addOns: SelectedAddOn[]
  timing?: TimingInput
}

export interface ResidentialQuoteInput {
  service: 'residential'
  sqft: number
  beds: number
  baths: number
  packageKey: ResidentialPackageKey
  frequency?: FrequencyKey
  /** First-time client: 20% off the first visit's clean price. */
  firstTime?: boolean
  addOns: SelectedAddOn[]
  timing?: TimingInput
}

export interface PostConstructionQuoteInput {
  service: 'post_construction'
  sqft: number
  pass: PostConstructionPass
  counts: Partial<Record<PostConstructionItemKey, number>>
}

export type QuoteInput = StrQuoteInput | ResidentialQuoteInput | PostConstructionQuoteInput

export interface QuoteLine {
  label: string
  amount: number
  /** Shown as "Included" instead of $0. */
  included?: boolean
  proposed?: boolean
}

export interface Quote {
  lines: QuoteLine[]
  /** Sum of lines. For STR monthly plans this is per month. */
  total: number
  period: 'visit' | 'month'
  /** Secondary figures under the total, e.g. "Then per visit, weekly". */
  subs: { label: string; amount: number | null }[]
  /** Client-facing notes under the quote. */
  notes: string[]
  /** True when an instant price isn't offered: the team sends a quote. */
  quoteRequired: boolean
  quoteReason?: string
  /** The visitor hasn't given enough to price it yet (e.g. no size chosen). Not a custom quote. */
  incomplete?: boolean
  /** True when any line uses a proposed price (only possible with includeProposed). */
  usesProposed: boolean
}

export interface QuoteOptions {
  /** Defaults to SHOW_PROPOSED. The admin quote builder passes true. */
  includeProposed?: boolean
}
