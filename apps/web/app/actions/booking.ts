'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { publicDataClient } from '@/lib/data/publicClient'
import { stripe } from '@/lib/stripe/server'
import type { SelectedAddOn } from '@/lib/pricing/types'

const region = process.env.AWS_REGION ?? 'us-east-1'
const ses    = new SESClient({ region })

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'info@str-cleaningcrew.com'

const SERVICE_KEY_TO_JOB_TYPE: Record<string, string> = {
  str_turnover: 'STR_TURNOVER',
  str_deep: 'STR_DEEP',
  str_seasonal: 'STR_SEASONAL',
  str_startup: 'STR_STARTUP',
  str_subscription_standard: 'STR_SUBSCRIPTION_STANDARD',
  str_subscription_premium: 'STR_SUBSCRIPTION_PREMIUM',
  residential_recurring: 'RESIDENTIAL_RECURRING',
}

export type BookingFormData = {
  category:     'str' | 'residential'
  serviceKey:   string
  propertySize: string
  addOns:       SelectedAddOn[]
  date:         string
  timeWindow:   string
  frequency:    string
  emergencySameDay: boolean
  address:      string
  unit:         string
  city:         string
  state:        string
  zip:          string
  firstName:    string
  lastName:     string
  email:        string
  phone:        string
  notes:        string
  estimatedLow:  number
  estimatedHigh: number
  stripeCustomerId?:       string
  stripePaymentMethodId?:  string
  customerId?:             string
}

export async function submitBooking(form: BookingFormData) {
  const now = new Date().toISOString()
  const fullAddress = `${form.address}${form.unit ? ` #${form.unit}` : ''}, ${form.city}, ${form.state} ${form.zip}`
  const addOnsSummary = form.addOns.map((a) => `${a.id} x${a.qty}`).join(', ') || 'None'

  const created = await publicDataClient.models.Job.create({
    type: (SERVICE_KEY_TO_JOB_TYPE[form.serviceKey] ?? 'STR_TURNOVER') as never,
    source: 'BOOKING_FORM',
    status: 'NEW',
    category: form.category === 'residential' ? 'RESIDENTIAL' : 'STR',
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    propertySize: form.propertySize,
    address: form.address,
    unit: form.unit,
    city: form.city,
    state: form.state,
    zip: form.zip,
    frequency: form.frequency,
    addOns: form.addOns,
    emergencySameDay: form.emergencySameDay,
    scheduledDate: form.date || undefined,
    scheduledTimeWindow: form.timeWindow,
    estimatedLow: form.estimatedLow,
    estimatedHigh: form.estimatedHigh,
    notes: form.notes,
    customerId: form.customerId,
  })

  if (form.stripePaymentMethodId && form.customerId) {
    const method = await stripe.paymentMethods.retrieve(form.stripePaymentMethodId)
    await publicDataClient.models.PaymentMethod.create({
      customerId: form.customerId,
      stripePaymentMethodId: form.stripePaymentMethodId,
      brand: method.card?.brand,
      last4: method.card?.last4,
      expMonth: method.card?.exp_month,
      expYear: method.card?.exp_year,
      isDefault: true,
    })
  }

  await ses.send(new SendEmailCommand({
    Source:      NOTIFY_EMAIL,
    Destination: { ToAddresses: [NOTIFY_EMAIL] },
    Message: {
      Subject: { Data: `New Booking Request — ${form.firstName} ${form.lastName}` },
      Body: {
        Text: {
          Data: [
            `Name:      ${form.firstName} ${form.lastName}`,
            `Email:     ${form.email}`,
            `Phone:     ${form.phone}`,
            ``,
            `Category:  ${form.category}`,
            `Service:   ${form.serviceKey}`,
            `Property:  ${form.propertySize}`,
            `Add-ons:   ${addOnsSummary}`,
            ``,
            `Date:      ${form.date}`,
            `Arrival:   ${form.timeWindow}`,
            `Frequency: ${form.frequency}`,
            `Emergency: ${form.emergencySameDay ? 'Yes' : 'No'}`,
            ``,
            `Address:   ${fullAddress}`,
            ``,
            `Estimated: $${form.estimatedLow} – $${form.estimatedHigh}`,
            ``,
            `Notes:     ${form.notes || 'None'}`,
            ``,
            `Submitted: ${now}`,
            `Job ID:    ${created.data?.id ?? 'unknown'}`,
          ].join('\n'),
        },
      },
    },
  }))
}
