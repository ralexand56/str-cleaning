export type PropertyCategory = 'str' | 'residential'

export type STRServiceKey =
  | 'str_turnover'
  | 'str_deep'
  | 'str_seasonal'
  | 'str_startup'
  | 'str_subscription_standard'
  | 'str_subscription_premium'

export type ResidentialServiceKey = 'residential_first_visit' | 'residential_recurring'

export type SpecialtyServiceKey = 'move_in_out' | 'post_construction'

export type ServiceKey = STRServiceKey | ResidentialServiceKey | SpecialtyServiceKey

export type Frequency = 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly'

/** A selectable "property size" row, normalized from whichever pricing table backs the active service. */
export interface SizeOption {
  key: string
  label: string
  sqftMin: number
  sqftMax: number
  /** Flat price for this size under the active service, or null when it must be custom-quoted. */
  price: number | null
}

export interface AddOnItem {
  id: string
  category: string
  name: string
  price: number
  unit: string
  qtyRange: [number, number] | false
  note: string
  passThrough?: boolean
}

export interface SelectedAddOn {
  id: string
  qty: number
}

export interface EstimateInput {
  category: PropertyCategory
  serviceKey: ServiceKey
  sizeKey: string | null
  frequency?: Frequency
  addOns: SelectedAddOn[]
  emergencySameDay?: boolean
  serviceDate?: string
}

export interface EstimateResult {
  sizeLabel: string | null
  base: number | null
  addOnsTotal: number
  surcharge: number
  surchargeBreakdown: { label: string; amount: number }[]
  subtotal: number
  range: { low: number; high: number } | null
  contactForQuote: boolean
}

// ─── Raw config shape (mirrors apps/web/lib/pricing/config.json's `calculator_config`) ──

export interface SizeRow {
  key?: string
  label: string
  sqft_min: number
  sqft_max: number
  price?: number
}

export interface PricingConfig {
  calculator_config: {
    version: string
    source: string
    tax_rate: number
    display: {
      show_range: boolean
      range_percent: number
      starting_at_uses_smallest_size: boolean
      round_to: number
    }
    property_type_mapping: {
      str_turnover_types: Array<{
        key: string
        label: string
        beds: number
        baths: number
        sqft_min: number
        sqft_max: number
      }>
    }
    str_turnover_per_clean: Record<string, number>
    str_subscription: {
      sizes: Array<{
        key: string
        label: string
        standard: number
        premium_care: number
        per_clean: number
        extra_clean: number
      }>
    }
    residential: {
      first_visit_deep_clean: { rows: Array<{ key: string; label: string; sqft_min: number; sqft_max: number; price: number }> }
      recurring_per_visit: { rows: Array<{ key: string; weekly: number; biweekly: number; monthly: number }> }
      monthly_cost_to_client: { rows: Array<{ key: string; weekly_4x: number; biweekly_2x: number; monthly_1x: number }> }
    }
    seasonal_per_service: Record<string, number>
    deep_clean_per_service: { rows: SizeRow[] }
    move_in_out: { rows: SizeRow[] }
    post_construction: { rows: SizeRow[] }
    str_startup_onboarding: {
      base_le_2000_sqft: number
      base_gt_2000_sqft: number
    }
    add_ons: {
      items: Array<{
        id: string
        category: string
        name: string
        price: number
        unit: string
        qty: [number, number] | false
        note: string
        pass_through?: boolean
      }>
    }
    surcharges: {
      emergency_sameday: { label: string; amount: number }
      sunday_holiday: { label: string; amount: number }
    }
  }
}
