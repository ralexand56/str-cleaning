import raw from './config.json'
import type { AddOnItem, PricingConfig } from './types'

const config = (raw as unknown as PricingConfig).calculator_config

export const ADD_ONS: AddOnItem[] = config.add_ons.items.map((item) => ({
  id: item.id,
  category: item.category,
  name: item.name,
  price: item.price,
  unit: item.unit,
  qtyRange: item.qty,
  note: item.note,
  passThrough: item.pass_through,
}))

/**
 * Curated allowlist for the customer-facing calculator.
 * Excludes pass-through-at-cost items (awkward to price transparently up front) — those
 * two customers instead get quoted manually. Admin's quote builder always gets the full list.
 */
export const PUBLIC_ADD_ON_IDS = new Set(ADD_ONS.filter((a) => !a.passThrough).map((a) => a.id))

export function getAddOn(id: string): AddOnItem | undefined {
  return ADD_ONS.find((a) => a.id === id)
}
