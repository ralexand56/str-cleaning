import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { publicDataClient } from '@/lib/data/publicClient'

export const runtime = 'nodejs'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

async function findChargeByPaymentIntent(paymentIntentId: string) {
  const { data } = await publicDataClient.models.Charge.list({
    filter: { stripePaymentIntentId: { eq: paymentIntentId } },
  })
  return data[0]
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    if (!signature) throw new Error('Missing stripe-signature header')
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      const charge = await findChargeByPaymentIntent(intent.id)
      if (charge) {
        await publicDataClient.models.Charge.update({
          id: charge.id,
          status: event.type === 'payment_intent.succeeded' ? 'SUCCEEDED' : 'FAILED',
        })
      }
      break
    }
    case 'charge.refunded': {
      const stripeCharge = event.data.object as Stripe.Charge
      const paymentIntentId = typeof stripeCharge.payment_intent === 'string' ? stripeCharge.payment_intent : stripeCharge.payment_intent?.id
      if (paymentIntentId) {
        const charge = await findChargeByPaymentIntent(paymentIntentId)
        if (charge) {
          await publicDataClient.models.Charge.update({ id: charge.id, status: 'REFUNDED' })
        }
      }
      break
    }
    case 'setup_intent.succeeded':
      // Card capture is persisted synchronously in the booking flow (see app/actions/booking.ts);
      // this case is a backstop for observability only, no-op for now.
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}
