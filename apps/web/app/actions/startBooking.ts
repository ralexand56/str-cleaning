'use server'

import { publicDataClient } from '@/lib/data/publicClient'

/**
 * Step 0 of booking (plan §6): save first name, phone, email and ZIP before anything else, so the
 * team can follow up if the visitor stops halfway. Creates a lightweight lead job; when the full
 * request arrives it carries this id (intake.leadJobId) and the admin list folds the lead into it.
 */
export async function startBooking(input: {
  firstName: string
  phone: string
  email: string
  zip: string
  service: string
  contactConsent: boolean
}): Promise<string | null> {
  const clip = (s: string, n: number) => s.trim().slice(0, n)
  if (!input.firstName.trim() || !input.email.trim() || !input.phone.trim()) return null
  try {
    const created = await publicDataClient.models.Job.create({
      type: 'CONTACT_INQUIRY',
      source: 'BOOKING_FORM',
      status: 'NEW',
      firstName: clip(input.firstName, 80),
      email: clip(input.email, 200),
      phone: clip(input.phone, 40),
      zip: clip(input.zip, 10),
      rawMessage: `Started an online booking (${clip(input.service, 40)}) but hasn't sent the request yet. Agreed to calls, texts and emails: ${input.contactConsent ? 'yes' : 'no'}.`,
    })
    return created.data?.id ?? null
  } catch (err) {
    // A lead is a nice-to-have: never block the visitor's booking on it.
    console.error('startBooking: could not save lead', err)
    return null
  }
}
