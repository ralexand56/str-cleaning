import Stripe from 'stripe'

/**
 * Server-only Stripe client. Never import this from a client component —
 * it reads the secret key and is only usable inside 'use server' files / route handlers.
 *
 * Lazily constructed: the Stripe SDK throws at construction time if given an empty key, and
 * several server actions that only *sometimes* touch Stripe (e.g. booking.ts, which only calls
 * it when a card was actually captured) import this module unconditionally. A real call still
 * fails clearly once STRIPE_SECRET_KEY is actually needed and missing.
 */
let cached: Stripe | null = null

function getStripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    cached = new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  }
  return cached
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripe()
    return Reflect.get(instance, prop, instance)
  },
})
