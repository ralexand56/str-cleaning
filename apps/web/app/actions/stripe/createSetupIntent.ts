'use server'

import { stripe } from '@/lib/stripe/server'
import { publicDataClient } from '@/lib/data/publicClient'

export type CreateSetupIntentInput = {
  email: string
  firstName: string
  lastName: string
  phone: string
}

export type CreateSetupIntentResult = {
  clientSecret: string
  stripeCustomerId: string
  customerId: string
}

/**
 * Starts card capture for the booking flow. The public booking form only has `create`
 * access to our Customer table (no read/list), so we can't dedupe against an existing
 * local Customer record here — we dedupe the Stripe Customer by email instead (Stripe is
 * the source of truth for billing identity) and always create a fresh local Customer row.
 * Known v1 limitation: repeat bookings from the same email create multiple Customer rows;
 * admin-side dedup is a reasonable fast-follow once /admin has authenticated read access.
 */
export async function createSetupIntent(input: CreateSetupIntentInput): Promise<CreateSetupIntentResult> {
  const found = await stripe.customers.list({ email: input.email, limit: 1 })
  const stripeCustomer = found.data[0] ?? (await stripe.customers.create({
    email: input.email,
    name: `${input.firstName} ${input.lastName}`.trim(),
    phone: input.phone || undefined,
  }))

  const customer = await publicDataClient.models.Customer.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    stripeCustomerId: stripeCustomer.id,
  })

  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomer.id,
    payment_method_types: ['card'],
    usage: 'off_session',
  })

  if (!setupIntent.client_secret) {
    throw new Error('Stripe did not return a client secret for the SetupIntent')
  }

  return {
    clientSecret: setupIntent.client_secret,
    stripeCustomerId: stripeCustomer.id,
    customerId: customer.data?.id ?? '',
  }
}
