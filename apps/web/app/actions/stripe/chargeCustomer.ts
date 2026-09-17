'use server'

import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { getGroupsFromServerComponent, getCurrentUserSub } from '@/lib/authGroups'
import { serverDataClient as client } from '@/lib/data/serverClient'

export type ChargeCustomerInput = {
  jobId?: string
  customerId: string
  amountCents: number
  description: string
}

export type ChargeCustomerResult = {
  status: 'succeeded' | 'requires_action' | 'failed'
  chargeId: string
  message?: string
}

export async function chargeCustomer(input: ChargeCustomerInput): Promise<ChargeCustomerResult> {
  const groups = await getGroupsFromServerComponent()
  if (!groups.includes('Admins')) {
    throw new Error('Not authorized')
  }

  const { data: methods } = await client.models.PaymentMethod.list({
    filter: { customerId: { eq: input.customerId }, isDefault: { eq: true } },
  })
  const paymentMethod = methods[0]
  const { data: customer } = await client.models.Customer.get({ id: input.customerId })

  if (!paymentMethod || !customer?.stripeCustomerId) {
    throw new Error('No saved payment method on file for this customer')
  }

  const createdBySub = (await getCurrentUserSub()) ?? undefined
  let status: ChargeCustomerResult['status'] = 'failed'
  let message: string | undefined
  let paymentIntentId = ''

  try {
    const intent = await stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: 'usd',
      customer: customer.stripeCustomerId,
      payment_method: paymentMethod.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      description: input.description,
    })
    paymentIntentId = intent.id
    status = intent.status === 'succeeded' ? 'succeeded' : intent.status === 'requires_action' ? 'requires_action' : 'failed'
  } catch (err) {
    if (err instanceof Stripe.errors.StripeCardError) {
      status = 'failed'
      message = err.message
      paymentIntentId = err.payment_intent?.id ?? ''
    } else {
      throw err
    }
  }

  const charge = await client.models.Charge.create({
    jobId: input.jobId,
    customerId: input.customerId,
    stripePaymentIntentId: paymentIntentId,
    amountCents: input.amountCents,
    status: status === 'succeeded' ? 'SUCCEEDED' : status === 'requires_action' ? 'PENDING' : 'FAILED',
    description: input.description,
    createdBySub,
  })

  return { status, chargeId: charge.data?.id ?? '', message }
}
