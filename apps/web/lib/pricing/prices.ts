/**
 * Every price the site quotes, in one place.
 *
 * Source: calculator-spec.md + pricing-calculator.html (Nov 2026 handoff from Tatiana).
 * To change a price, edit this file only — the Pricing page, the calculator, booking and
 * the admin quote builder all read from here.
 *
 * Anything marked `proposed: true` is NOT confirmed by Tatiana yet. Those items are hidden
 * from the public site unless NEXT_PUBLIC_SHOW_PROPOSED_PRICES=true (see visibility.ts).
 * When she confirms one, delete its `proposed` flag.
 */

// ─── Short-term rentals ──────────────────────────────────────────────────────

export interface StrSize {
  key: string
  label: string
  sqft: string
  turnover: number
  extraTurnover: number
  standardPlan: number
  premiumPlan: number
  seasonal: number
  startup: number
}

export const STR_SIZES: StrSize[] = [
  { key: 'studio', label: 'Studio / 1 bed 1 bath', sqft: 'up to 800 sq ft',    turnover: 175, extraTurnover: 160, standardPlan: 875,  premiumPlan: 1125, seasonal: 1095, startup: 895 },
  { key: '2b15b',  label: '2 bed 1.5 bath',        sqft: '800–1,200 sq ft',    turnover: 225, extraTurnover: 200, standardPlan: 1125, premiumPlan: 1425, seasonal: 1295, startup: 895 },
  { key: '2b2b',   label: '2 bed 2 bath',          sqft: '800–1,200 sq ft',    turnover: 240, extraTurnover: 215, standardPlan: 1200, premiumPlan: 1500, seasonal: 1495, startup: 895 },
  { key: '3b2b',   label: '3 bed 2 bath',          sqft: '1,200–1,500 sq ft',  turnover: 265, extraTurnover: 240, standardPlan: 1325, premiumPlan: 1625, seasonal: 1595, startup: 895 },
  { key: '3b25b',  label: '3 bed 2.5 bath',        sqft: '1,500–2,000 sq ft',  turnover: 315, extraTurnover: 285, standardPlan: 1575, premiumPlan: 1925, seasonal: 1795, startup: 895 },
  { key: '4b3b',   label: '4 bed 3 bath',          sqft: '2,000–2,500 sq ft',  turnover: 355, extraTurnover: 320, standardPlan: 1775, premiumPlan: 2175, seasonal: 2395, startup: 1195 },
  { key: '5b4b',   label: '5 bed 4 bath',          sqft: '2,500–3,000 sq ft',  turnover: 430, extraTurnover: 385, standardPlan: 2150, premiumPlan: 2600, seasonal: 3195, startup: 1195 },
  { key: '5b5b',   label: '5 bed 5+ bath',         sqft: '3,000+ sq ft',       turnover: 495, extraTurnover: 445, standardPlan: 2475, premiumPlan: 2975, seasonal: 3695, startup: 1195 },
]

export type StrPackageKey = 'turnover' | 'plan_standard' | 'plan_premium' | 'seasonal' | 'startup'

export interface StrPackage {
  key: StrPackageKey
  label: string
  description: string
  monthly: boolean
  /** Which STR_SIZES column holds this package's price. */
  priceField: 'turnover' | 'standardPlan' | 'premiumPlan' | 'seasonal' | 'startup'
  proposed?: boolean
}

export const STR_PACKAGES: StrPackage[] = [
  { key: 'turnover',      label: 'Turnover, single visit',     monthly: false, priceField: 'turnover',
    description: 'Inspection, full clean, linens and towels, photo report, restock check.' },
  { key: 'plan_standard', label: 'Monthly plan: Standard',     monthly: true,  priceField: 'standardPlan',
    description: '5 turnovers a month included. Extra turnovers at the extra-turnover rate.' },
  { key: 'plan_premium',  label: 'Monthly plan: Premium Care', monthly: true,  priceField: 'premiumPlan',
    description: 'Standard plus same-day priority, maintenance issue reporting, an account manager and 1 seasonal deep clean a year.' },
  { key: 'seasonal',      label: 'Seasonal deep clean',        monthly: false, priceField: 'seasonal',
    description: 'Off-season full reset over 1–2 days: curtains, carpet, upholstery, inside cabinets and appliances.' },
  { key: 'startup',       label: 'STR start-up',               monthly: false, priceField: 'startup',
    description: 'One time. Property book, standards and photos for your home, supply audit and first-guest setup.' },
]

export const STR_PLAN = {
  includedTurnovers: 5,
  prepayDiscount: 0.1,
  terms:
    '3-month minimum, then month to month with 30 days’ notice. In a slower month the crew uses the time for a deeper clean. Add-ons are billed on the visit they’re done.',
}

// ─── Residential ─────────────────────────────────────────────────────────────

export const RESIDENTIAL = {
  base: 50,
  perSqft: 0.09,
  perBedroom: 25,
  perBathroom: 40,
  /** Homes over this size go to Get a Quote instead of an instant price. */
  maxInstantSqft: 3500,
}

export type ResidentialPackageKey = 'recurring' | 'standard' | 'deep' | 'move'

export interface ResidentialPackage {
  key: ResidentialPackageKey
  label: string
  description: string
  /** Multiplier on the standard price. For recurring this is the first visit (always a deep clean). */
  multiplier: number
  /** Bundled add-ons are included at $0 in this package. */
  includesBundled: boolean
}

export const RESIDENTIAL_PACKAGES: ResidentialPackage[] = [
  { key: 'recurring', label: 'Recurring cleaning',      multiplier: 1.7, includesBundled: true,
    description: 'Weekly, every 2 weeks or monthly. The first visit is a deep clean.' },
  { key: 'standard',  label: 'One-time standard clean', multiplier: 1,   includesBundled: false,
    description: 'Surfaces, kitchen and baths, dusting, floors, beds made, trash.' },
  { key: 'deep',      label: 'Deep clean',              multiplier: 1.7, includesBundled: true,
    description: 'Standard plus inside fridge, oven and microwave, windows and blinds inside, baseboards by hand, doors and frames, tile and grout.' },
  { key: 'move',      label: 'Move-in / move-out',      multiplier: 2,   includesBundled: true,
    description: 'Deep clean plus inside every cabinet, shelf and closet in an empty home.' },
]

export type FrequencyKey = 'weekly' | 'biweekly' | 'monthly'

export interface FrequencyOption {
  key: FrequencyKey
  label: string
  discount: number
  visitsPerMonth: number
  proposed?: boolean
}

/** Recurring discounts, confirmed by Tatiana Nov 19 2026. */
export const FREQUENCIES: FrequencyOption[] = [
  { key: 'weekly',   label: 'Weekly',        discount: 0.2,  visitsPerMonth: 4.33 },
  { key: 'biweekly', label: 'Every 2 weeks', discount: 0.15, visitsPerMonth: 2.17 },
  { key: 'monthly',  label: 'Monthly',       discount: 0.05, visitsPerMonth: 1 },
]

/** Square-foot bands for a booking platform (spec §6). The 0.09 × sq ft part, rounded up per band. */
export const SQFT_BANDS: { upTo: number; add: number }[] = [
  { upTo: 1000, add: 90 },
  { upTo: 1500, add: 135 },
  { upTo: 2000, add: 180 },
  { upTo: 2500, add: 225 },
  { upTo: 3000, add: 270 },
  { upTo: 3500, add: 315 },
]

// ─── Post-construction ───────────────────────────────────────────────────────

export type PostConstructionPass = 'rough' | 'final' | 'both'

export const POST_CONSTRUCTION_PASSES: { key: PostConstructionPass; label: string; rate: number; description: string }[] = [
  { key: 'rough', label: 'Rough clean',   rate: 0.75,
    description: 'Heavy dust, film and debris. Includes appliance film, cabinets inside and out, sills and tracks, floors.' },
  { key: 'final', label: 'Final clean',   rate: 0.55,
    description: 'Site already swept and cleared. Wash, wipe and polish everything.' },
  { key: 'both',  label: 'Rough + final', rate: 1.3,
    description: 'Both passes, for a full build or remodel.' },
]

export type PostConstructionItemKey = 'window_film' | 'window_regular' | 'stickers' | 'fixtures'

export const POST_CONSTRUCTION_ITEMS: { key: PostConstructionItemKey; label: string; price: number; unit: string; proposed?: boolean }[] = [
  { key: 'window_film',    label: 'Windows with film, glue or stickers', price: 40, unit: 'per window, removal included' },
  { key: 'window_regular', label: 'Windows, regular wash',               price: 25, unit: 'per window, inside and out' },
  { key: 'stickers',       label: 'Cabinet doors or appliances with stickers', price: 3, unit: 'each' },
  { key: 'fixtures',       label: 'High or outdoor light fixtures',      price: 25, unit: 'each' },
]

export const POST_CONSTRUCTION_MINIMUM = { amount: 495 }

// ─── Add-ons (STR and residential) ───────────────────────────────────────────

export type AddOnIcon =
  | 'fridge' | 'oven' | 'microwave' | 'stove' | 'cabinet' | 'dishes'
  | 'window' | 'window-both' | 'blinds' | 'baseboard' | 'door' | 'wall' | 'fan' | 'spot'
  | 'alert' | 'paw' | 'poop' | 'trash-bag' | 'odor'
  | 'bed' | 'laundry' | 'bag'
  | 'trash-can' | 'garage' | 'patio' | 'grill' | 'stain' | 'crib' | 'flower'

export interface AddOn {
  id: string
  group: string
  name: string
  price: number
  unit: string
  icon: AddOnIcon
  /** Counted per item (shows a + / − counter). */
  perItem?: boolean
  /** Minimum quantity when perItem. */
  min?: number
  note?: string
  /** Included at $0 in residential deep, move-in/out and the first recurring visit. */
  bundled?: boolean
  residentialOnly?: boolean
  strOnly?: boolean
  /** Price is a fee plus a cost passed through at actual cost (shown as "plus cost"). */
  passThrough?: boolean
  proposed?: boolean
}

export const ADD_ON_GROUPS = ['Kitchen', 'Windows and detail', 'Mess and pets', 'Laundry', 'Outdoor and other'] as const

export const ADD_ONS: AddOn[] = [
  { id: 'ao_fridge',        group: 'Kitchen', name: 'Inside fridge',            price: 30, unit: 'each',       icon: 'fridge',    bundled: true },
  { id: 'ao_oven',          group: 'Kitchen', name: 'Inside oven',              price: 30, unit: 'each',       icon: 'oven',      bundled: true },
  { id: 'ao_microwave',     group: 'Kitchen', name: 'Inside microwave',         price: 10, unit: 'each',       icon: 'microwave', bundled: true },
  { id: 'ao_stove',         group: 'Kitchen', name: 'Stove deep clean',         price: 15, unit: 'each',       icon: 'stove',     bundled: true },
  { id: 'ao_cabinet_fronts',group: 'Kitchen', name: 'Greasy cabinet fronts, full degrease', price: 40, unit: 'per kitchen', icon: 'cabinet' },
  { id: 'ao_dish_extra',    group: 'Kitchen', name: 'Dishwashing, extra loads', price: 15, unit: 'per load',   icon: 'dishes',    perItem: true, note: 'First load included' },

  { id: 'ao_win_in',   group: 'Windows and detail', name: 'Windows, inside',             price: 5,  unit: 'per window',    icon: 'window',      perItem: true, bundled: true },
  { id: 'ao_win_both', group: 'Windows and detail', name: 'Windows, inside and outside', price: 10, unit: 'per window',    icon: 'window-both', perItem: true },
  { id: 'ao_blinds',   group: 'Windows and detail', name: 'Blinds',                      price: 5,  unit: 'per window',    icon: 'blinds',      perItem: true, bundled: true },
  { id: 'ao_baseboards', group: 'Windows and detail', name: 'Baseboards by hand',        price: 8,  unit: 'per room',      icon: 'baseboard',   perItem: true, bundled: true },
  { id: 'ao_doors',    group: 'Windows and detail', name: 'Doors and frames',            price: 5,  unit: 'per door',      icon: 'door',        perItem: true, bundled: true },
  { id: 'ao_walls',    group: 'Windows and detail', name: 'Wipe walls',                  price: 25, unit: 'per wall side', icon: 'wall',        perItem: true },
  { id: 'ao_spot',     group: 'Windows and detail', name: 'Fabric or carpet spot',       price: 20, unit: 'per spot',      icon: 'spot',        perItem: true },
  { id: 'ao_ceiling_fans', group: 'Windows and detail', name: 'Ceiling fans',            price: 10, unit: 'per fan',       icon: 'fan',         perItem: true },

  { id: 'ao_accident',  group: 'Mess and pets', name: 'Vomit or pet accident indoors, disinfect', price: 50, unit: 'per area', icon: 'alert', perItem: true },
  { id: 'ao_pet_hair',  group: 'Mess and pets', name: 'Heavy pet hair',              price: 30, unit: 'per visit',      icon: 'paw' },
  { id: 'ao_pet_waste', group: 'Mess and pets', name: 'Pet waste, yard or patio',    price: 30, unit: 'per visit',      icon: 'poop' },
  { id: 'ao_trash',     group: 'Mess and pets', name: 'Extra trash bags',            price: 20, unit: 'per 13-gal bag', icon: 'trash-bag', perItem: true },
  { id: 'ao_ozone',     group: 'Mess and pets', name: 'Ozone odor treatment',        price: 50, unit: 'per hour',       icon: 'odor', perItem: true, min: 4, note: '4-hour minimum' },

  { id: 'ao_linens',      group: 'Laundry', name: 'Linens: strip, wash, remake', price: 15, unit: 'per bed',  icon: 'bed',     perItem: true, residentialOnly: true },
  { id: 'ao_laundry',     group: 'Laundry', name: 'Wash and dry light items',    price: 20, unit: 'per load', icon: 'laundry', perItem: true },
  { id: 'ao_laundry_run', group: 'Laundry', name: 'Laundromat run, bulky items', price: 30, unit: 'plus cost', icon: 'bag', passThrough: true },

  { id: 'ao_trash_can',     group: 'Outdoor and other', name: 'Outdoor trash can wash',  price: 15, unit: 'per can',   icon: 'trash-can', perItem: true, note: 'Needs a hose and a place to drain' },
  { id: 'ao_garage',        group: 'Outdoor and other', name: 'Sweep garage',            price: 30, unit: 'each',      icon: 'garage' },
  { id: 'ao_patio',         group: 'Outdoor and other', name: 'Sweep patio or balcony, wipe outdoor furniture', price: 25, unit: 'each', icon: 'patio' },
  { id: 'ao_grill',         group: 'Outdoor and other', name: 'Grill deep clean',        price: 85, unit: 'each',      icon: 'grill' },
  { id: 'ao_outdoor_stain', group: 'Outdoor and other', name: 'Outdoor stain washing',   price: 15, unit: 'per spot',  icon: 'stain', perItem: true },
  { id: 'ao_crib',          group: 'Outdoor and other', name: 'Crib or fold-out bed setup', price: 10, unit: 'each',   icon: 'crib' },
  { id: 'ao_flower',        group: 'Outdoor and other', name: 'Flower or fruit pickup',  price: 20, unit: 'plus receipt', icon: 'flower', passThrough: true, strOnly: true },
]

// ─── Timing fees and policies ────────────────────────────────────────────────

export const TIMING_FEES = {
  sameDay: { label: 'Same-day call-out', amount: 50 },
  sundayHoliday: { label: 'Sunday or holiday', amount: 50 },
}

/**
 * Policy fees, charged by the team to the card on file (Tatiana, Nov 19 2026). The late-cancellation
 * fee is per cleaner booked; the team sets the crew size when confirming, so the client sees the
 * exact amount in their confirmation.
 */
export const POLICY_FEES = {
  lateCancel: { label: 'Cancellation less than 24 hours before', amount: 50, unit: 'per cleaner booked' },
  waiting: { label: 'Waiting on site over 15 minutes', amount: 25, unit: 'per 30 minutes' },
}

/** No deposit (Tatiana, Nov 19 2026): a card is saved at booking and charged after the clean. */
export const CARD_POLICY = {
  rescheduleChanges: 2,
  lines: [
    'Nothing is charged when you book. We charge your card after the clean, once you have your photo report.',
    'Reschedule for free, up to 2 changes per booking.',
    'Cancelling less than 24 hours before is $50 per cleaner booked: for example $50 for a small clean, $100–$150 for a large move-out with 2–3 cleaners. We confirm your crew size with your booking.',
    'If we can’t get in at the booked time, it counts as a late cancellation.',
  ],
}

/**
 * First-time client discount (Tatiana, Nov 19 2026): 20% off the first visit's clean price only,
 * not add-ons, timing fees, STR monthly plans or post-construction. The client ticks a box; the
 * team checks they really are new before confirming.
 */
export const FIRST_TIME_DISCOUNT = { percent: 0.2, label: 'First-time client, 20% off your first visit' }
