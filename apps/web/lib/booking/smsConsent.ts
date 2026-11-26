/**
 * SMS consent wording for A2P 10DLC registration. The wording is exact: the carrier review
 * compares it with what was registered, so change it only together with the registration.
 */
export const SMS_CONSENT = {
  marketing: {
    title: 'Marketing / Promotional SMS Consent',
    text: 'I consent to receive marketing text messages about special offers, discounts, and cleaning service promotions from STR CLEANING CREW at the phone number provided. Message frequency may vary. Message and data rates may apply. Text HELP for assistance, reply STOP to opt out.',
  },
  transactional: {
    title: 'Informational / Transactional SMS Consent',
    text: 'I consent to receive non-marketing text messages from STR CLEANING CREW about booking confirmations, appointment reminders, schedule updates, and service notifications. Message frequency may vary. Message and data rates may apply. Text HELP for assistance, reply STOP to opt out.',
  },
} as const

/** What the visitor ticked, recorded separately per message type, with when they ticked it. */
export interface SmsConsentRecord {
  marketing: boolean
  transactional: boolean
  /** ISO time the choices were saved. */
  at?: string
}
