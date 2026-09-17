import raw from './config.json'
import { ADD_ONS } from './addOns'
import { isHolidayOrSunday } from './holidays'
import type {
  EstimateInput,
  EstimateResult,
  Frequency,
  PricingConfig,
  PropertyCategory,
  ServiceKey,
  SizeOption,
} from './types'

const config = (raw as unknown as PricingConfig).calculator_config

export const DISPLAY = config.display

export function roundToStep(n: number, step: number = config.display.round_to): number {
  return Math.round(n / step) * step
}

export function priceRange(n: number, pct: number = config.display.range_percent): { low: number; high: number } {
  return {
    low: roundToStep(n * (1 - pct)),
    high: roundToStep(n * (1 + pct)),
  }
}

/** Every service, mapped to the human label used in the booking form. */
export const SERVICE_LABELS: Record<ServiceKey, string> = {
  str_turnover: 'Regular Turnover',
  str_deep: 'Deep Cleaning',
  str_seasonal: 'Seasonal Cleaning',
  str_startup: 'StartUp Service',
  str_subscription_standard: 'Standard Subscription',
  str_subscription_premium: 'Premium Care',
  residential_first_visit: 'First-Visit Deep Clean',
  residential_recurring: 'Recurring Cleaning',
  move_in_out: 'Move-In / Move-Out',
  post_construction: 'Post-Construction',
}

export const SERVICES_BY_CATEGORY: Record<PropertyCategory, ServiceKey[]> = {
  str: ['str_turnover', 'str_deep', 'str_seasonal', 'str_startup', 'str_subscription_standard', 'str_subscription_premium'],
  residential: ['residential_first_visit', 'residential_recurring'],
}

/** Returns the selectable size rows (and their flat price) for a given category + service. */
export function getSizeOptions(category: PropertyCategory, serviceKey: ServiceKey): SizeOption[] {
  switch (serviceKey) {
    case 'str_turnover':
      return config.property_type_mapping.str_turnover_types.map((row) => ({
        key: row.key,
        label: row.label,
        sqftMin: row.sqft_min,
        sqftMax: row.sqft_max,
        price: config.str_turnover_per_clean[row.key] ?? null,
      }))
    case 'str_seasonal':
      return config.property_type_mapping.str_turnover_types.map((row) => ({
        key: row.key,
        label: row.label,
        sqftMin: row.sqft_min,
        sqftMax: row.sqft_max,
        price: config.seasonal_per_service[row.key] ?? null,
      }))
    case 'str_subscription_standard':
      return config.str_subscription.sizes.map((row) => ({
        key: row.key,
        label: row.label,
        sqftMin: config.property_type_mapping.str_turnover_types.find((t) => t.key === row.key)?.sqft_min ?? 0,
        sqftMax: config.property_type_mapping.str_turnover_types.find((t) => t.key === row.key)?.sqft_max ?? 0,
        price: row.standard,
      }))
    case 'str_subscription_premium':
      return config.str_subscription.sizes.map((row) => ({
        key: row.key,
        label: row.label,
        sqftMin: config.property_type_mapping.str_turnover_types.find((t) => t.key === row.key)?.sqft_min ?? 0,
        sqftMax: config.property_type_mapping.str_turnover_types.find((t) => t.key === row.key)?.sqft_max ?? 0,
        price: row.premium_care,
      }))
    case 'str_deep':
      return config.deep_clean_per_service.rows.map((row, i) => ({
        key: row.key ?? `deep_${i}`,
        label: row.label,
        sqftMin: row.sqft_min,
        sqftMax: row.sqft_max,
        price: row.price ?? null,
      }))
    case 'str_startup':
      return [
        { key: 'le2000', label: 'Up to 2,000 sqft', sqftMin: 0, sqftMax: 2000, price: config.str_startup_onboarding.base_le_2000_sqft },
        { key: 'gt2000', label: '2,000–3,500 sqft', sqftMin: 2000, sqftMax: 3500, price: config.str_startup_onboarding.base_gt_2000_sqft },
      ]
    case 'residential_first_visit':
    case 'residential_recurring':
      return config.residential.first_visit_deep_clean.rows.map((row) => ({
        key: row.key,
        label: row.label,
        sqftMin: row.sqft_min,
        sqftMax: row.sqft_max,
        price:
          serviceKey === 'residential_first_visit'
            ? row.price
            : null, // recurring's displayed price depends on frequency — resolved in calculateEstimate
      }))
    case 'move_in_out':
      return config.move_in_out.rows.map((row, i) => ({
        key: row.key ?? `mio_${i}`,
        label: row.label,
        sqftMin: row.sqft_min,
        sqftMax: row.sqft_max,
        price: row.price ?? null,
      }))
    case 'post_construction':
      return config.post_construction.rows.map((row, i) => ({
        key: row.key ?? `pc_${i}`,
        label: row.label,
        sqftMin: row.sqft_min,
        sqftMax: row.sqft_max,
        price: row.price ?? null,
      }))
    default:
      return []
  }
}

/** Finds the nearest size row for a given sqft value, if any row's range contains it. */
export function mapSqftToSizeKey(category: PropertyCategory, serviceKey: ServiceKey, sqft: number): string | null {
  const options = getSizeOptions(category, serviceKey)
  const match = options.find((o) => sqft >= o.sqftMin && sqft <= o.sqftMax)
  return match?.key ?? null
}

function frequencyToRecurringKey(freq?: Frequency): 'weekly' | 'biweekly' | 'monthly' {
  switch (freq) {
    case 'Weekly':
      return 'weekly'
    case 'Bi-weekly':
      return 'biweekly'
    case 'Monthly':
      return 'monthly'
    default:
      return 'monthly'
  }
}

function frequencyToMonthlyCostKey(freq?: Frequency): 'weekly_4x' | 'biweekly_2x' | 'monthly_1x' {
  switch (freq) {
    case 'Weekly':
      return 'weekly_4x'
    case 'Bi-weekly':
      return 'biweekly_2x'
    case 'Monthly':
      return 'monthly_1x'
    default:
      return 'monthly_1x'
  }
}

function resolveBase(input: EstimateInput): { base: number | null; sizeLabel: string | null } {
  const { category, serviceKey, sizeKey, frequency } = input
  const options = getSizeOptions(category, serviceKey)
  const row = options.find((o) => o.key === sizeKey)
  if (!row) return { base: null, sizeLabel: null }

  if (serviceKey === 'residential_recurring') {
    const monthlyRow = config.residential.monthly_cost_to_client.rows.find((r) => r.key === sizeKey)
    const base = monthlyRow ? monthlyRow[frequencyToMonthlyCostKey(frequency)] : null
    return { base, sizeLabel: row.label }
  }

  return { base: row.price, sizeLabel: row.label }
}

export function calcAddOnsTotal(selected: EstimateInput['addOns']): number {
  return selected.reduce((sum, sel) => {
    const item = ADD_ONS.find((a) => a.id === sel.id)
    if (!item) return sum
    const qty = item.qtyRange ? Math.max(sel.qty, 1) : 1
    return sum + item.price * qty
  }, 0)
}

export function applySurcharges(opts: {
  emergencySameDay?: boolean
  serviceDate?: string
}): { total: number; breakdown: { label: string; amount: number }[] } {
  const breakdown: { label: string; amount: number }[] = []
  if (opts.emergencySameDay) {
    breakdown.push({ label: config.surcharges.emergency_sameday.label, amount: config.surcharges.emergency_sameday.amount })
  }
  if (opts.serviceDate && isHolidayOrSunday(opts.serviceDate)) {
    breakdown.push({ label: config.surcharges.sunday_holiday.label, amount: config.surcharges.sunday_holiday.amount })
  }
  return { total: breakdown.reduce((s, b) => s + b.amount, 0), breakdown }
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const { base, sizeLabel } = resolveBase(input)
  const addOnsTotal = calcAddOnsTotal(input.addOns)
  const { total: surcharge, breakdown: surchargeBreakdown } = applySurcharges(input)

  if (base === null) {
    return {
      sizeLabel,
      base: null,
      addOnsTotal,
      surcharge,
      surchargeBreakdown,
      subtotal: 0,
      range: null,
      contactForQuote: true,
    }
  }

  const subtotal = base + addOnsTotal + surcharge
  const range = config.display.show_range ? priceRange(subtotal) : null

  return {
    sizeLabel,
    base,
    addOnsTotal,
    surcharge,
    surchargeBreakdown,
    subtotal,
    range,
    contactForQuote: false,
  }
}

/** "Starting at $X" — uses the smallest size's price for a given service. */
export function startingAtPrice(category: PropertyCategory, serviceKey: ServiceKey, frequency?: Frequency): number | null {
  const options = getSizeOptions(category, serviceKey)
  if (options.length === 0) return null
  const smallest = options[0]
  if (serviceKey === 'residential_recurring') {
    const monthlyRow = config.residential.monthly_cost_to_client.rows.find((r) => r.key === smallest.key)
    return monthlyRow ? monthlyRow[frequencyToMonthlyCostKey(frequency)] : null
  }
  return smallest.price
}
