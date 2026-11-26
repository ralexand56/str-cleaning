/**
 * Booking intake: everything the request form asks beyond price (plan §6 and §10, "Data each
 * request must carry"). Stored on Job.intake as JSON; the admin job page renders it.
 */

import type { SmsConsentRecord } from './smsConsent'

export const HOME_TYPES = ['House', 'Condo', 'Apartment', 'Townhouse'] as const
export const STR_PLATFORMS = ['Airbnb', 'Vrbo', 'Booking.com', 'Direct bookings', 'Other'] as const
export const PC_STAGES = ['Rough (construction just finished)', 'Final (site already swept)', 'Not sure'] as const
export const ACCESS_METHODS = ['Someone will be home', 'Lockbox', 'Smart lock or keypad', 'Code given later by phone'] as const
export const HEARD_ABOUT = ['Google', 'Instagram', 'Facebook', 'Referral from a friend', 'Airbnb or host group', 'Repeat client', 'Other'] as const
export const TIME_WINDOWS = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Flexible'] as const

/**
 * "Before we finalize" checklist (plan §6 step 6). Items with `addOnIds` add those add-ons
 * (when they're available on the site and not already included).
 */
export const CHECKLIST: { key: string; label: string; addOnIds?: string[]; prompt?: string }[] = [
  { key: 'front_door', label: 'Front door, lock, doorbell and outside light' },
  { key: 'high_touch', label: 'Light switches and door handles that need extra attention (included)' },
  { key: 'cabinet_grease', label: 'Kitchen cabinet fronts with grease', addOnIds: ['ao_cabinet_fronts'] },
  { key: 'trash_cans', label: 'Outdoor trash cans (do you have a hose?)', addOnIds: ['ao_trash_can'] },
  { key: 'garage_patio', label: 'Garage, patio or balcony', addOnIds: ['ao_garage', 'ao_patio'] },
  { key: 'pet_areas', label: 'Pet areas, litter box area, pet bowls' },
  { key: 'fridge_oven', label: 'Inside fridge or oven', addOnIds: ['ao_fridge', 'ao_oven'] },
  { key: 'stains', label: 'Specific stains or problem spots', prompt: 'Add photos of them in the next step.' },
  { key: 'do_not_touch', label: 'Anything we should NOT touch or move', prompt: 'Tell us below.' },
]

export interface DateWindow {
  date: string
  window: string
}

export interface BookingIntake {
  /** Old single consent box (bookings before the separate SMS boxes). Kept so old records still display. */
  contactConsent?: boolean
  /** Optional SMS consent, recorded separately for marketing and transactional texts. */
  smsConsent?: SmsConsentRecord
  homeType?: string
  occupied?: 'occupied' | 'empty'
  pets?: { has: boolean; kind?: string }
  str?: {
    platform?: string
    checkoutTime?: string
    checkinTime?: string
    icalLink?: string
    linenSetup?: string
  }
  postConstruction?: {
    stage?: string
    buildersOnSite?: boolean
    debrisRemoved?: boolean
  }
  checklist: string[]
  /** Up to 3 preferred date-and-time windows; the team confirms one. */
  dateWindows: DateWindow[]
  access?: { method?: string; parking?: string; notes?: string }
  products: 'ours' | 'theirs'
  productsToAvoid?: string
  heardAbout?: string
  /** Agreed to the payment and cancellation policy on the card step. */
  policyAccepted?: boolean
  /** Ticked "first time booking with us" (20% off the first visit). The team checks it. */
  firstTimeClient?: boolean
  /** Campaign tag from the landing link (?src=mail, ?src=instagram), or "direct". */
  source?: string
  /** The "started a booking" lead created at step 0, so the admin list can fold it into this request. */
  leadJobId?: string
}

export const EMPTY_INTAKE: BookingIntake = {
  smsConsent: { marketing: false, transactional: false },
  checklist: [],
  dateWindows: [{ date: '', window: '' }],
  products: 'ours',
  pets: { has: false },
}

/** Plain-text lines for the team email and the admin job page. */
export function intakeLines(i: BookingIntake): [string, string][] {
  const rows: [string, string | undefined][] = [
    ['Booking source', i.source],
    ['Preferred dates', (i.dateWindows ?? []).filter((d) => d.date).map((d) => `${d.date} ${d.window}`.trim()).join(' · ')],
    ['Home type', i.homeType],
    ['Occupied', i.occupied === 'empty' ? 'Empty' : i.occupied === 'occupied' ? 'Occupied' : undefined],
    ['Pets', i.pets ? (i.pets.has ? `Yes${i.pets.kind ? `: ${i.pets.kind}` : ''}` : 'No') : undefined],
    ['Platform', i.str?.platform],
    ['Check-out / check-in', i.str && (i.str.checkoutTime || i.str.checkinTime) ? `${i.str.checkoutTime ?? '?'} / ${i.str.checkinTime ?? '?'}` : undefined],
    ['iCal link', i.str?.icalLink],
    ['Linens', i.str?.linenSetup],
    ['Job stage', i.postConstruction?.stage],
    ['Builders on site', i.postConstruction?.buildersOnSite === undefined ? undefined : i.postConstruction.buildersOnSite ? 'Yes' : 'No'],
    ['Debris removed', i.postConstruction?.debrisRemoved === undefined ? undefined : i.postConstruction.debrisRemoved ? 'Yes' : 'No'],
    ['Pay attention to', (i.checklist ?? []).map((k) => CHECKLIST.find((c) => c.key === k)?.label ?? k).join('; ')],
    ['Access', i.access?.method],
    ['Parking', i.access?.parking],
    ['Access notes', i.access?.notes],
    ['Products', i.products === 'theirs' ? 'Use the client’s own products' : i.products === 'ours' ? 'Our professional products' : undefined],
    ['Products to avoid', i.productsToAvoid],
    ['Heard about us', i.heardAbout],
    ['First-time client', i.firstTimeClient ? 'Yes (20% off applies to a first residential clean). Check they are new.' : undefined],
    ['Contact consent', i.contactConsent === undefined ? undefined : i.contactConsent ? 'Yes' : 'No'],
    ['SMS: marketing', i.smsConsent ? (i.smsConsent.marketing ? 'Yes, opted in' : 'No') : undefined],
    ['SMS: booking updates', i.smsConsent ? (i.smsConsent.transactional ? 'Yes, opted in' : 'No') : undefined],
    ['Cancellation policy', i.policyAccepted ? 'Accepted' : undefined],
  ]
  return rows.filter((r): r is [string, string] => !!r[1])
}
