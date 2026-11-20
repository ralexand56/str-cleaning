'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { publicDataClient } from '@/lib/data/publicClient'
import { stripe } from '@/lib/stripe/server'
import { jobTypeFor } from '@/lib/pricing/jobType'
import { intakeLines, type BookingIntake } from '@/lib/booking/intake'

const region = process.env.AWS_REGION ?? 'us-east-1'
const ses    = new SESClient({ region })

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'info@str-cleaningcrew.com'

export type BookingAddOn = { id: string; qty: number; label: string; unitPrice: number }

export type BookingFormData = {
  service:      'str' | 'residential' | 'post_construction'
  packageKey:   string
  packageLabel: string
  propertySize: string
  beds?:        number
  baths?:       number
  sqft?:        number
  frequency:    string
  intake:       BookingIntake
  /** S3 keys the browser uploaded under booking-photos/. */
  photoKeys:    string[]
  addOns:       BookingAddOn[]
  /** Human-readable estimate lines exactly as shown to the client. */
  quoteLines:   string[]
  quoteSubs:    string[]
  /** Null when the client was told the team will quote (e.g. homes over 3,500 sq ft). */
  estimate:     number | null
  estimatePeriod: 'visit' | 'month'
  quoteRequired: boolean
  emergencySameDay: boolean
  /** First preferred date window (also in intake.dateWindows). */
  date:         string
  timeWindow:   string
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
  stripeCustomerId?:       string
  stripePaymentMethodId?:  string
  customerId?:             string
}

const SERVICE_LABELS: Record<BookingFormData['service'], string> = {
  str: 'Short-term rental',
  residential: 'Residential',
  post_construction: 'Post-construction',
}

export async function submitBooking(form: BookingFormData) {
  const now = new Date().toISOString()
  const fullAddress = `${form.address}${form.unit ? ` #${form.unit}` : ''}, ${form.city}, ${form.state} ${form.zip}`
  const addOnsSummary = form.addOns.map((a) => `${a.label} x${a.qty}`).join(', ') || 'None'
  const estimateText = form.estimate === null
    ? 'Custom quote needed'
    : `$${form.estimate}${form.estimatePeriod === 'month' ? '/mo' : ''}${form.quoteRequired ? ' (estimate, firm quote needed)' : ''}`
  const estimate = form.estimate === null ? undefined : Math.round(form.estimate)
  const photoKeys = form.photoKeys.filter((k) => /^booking-photos\/[\w-]+\/[\w.-]+$/.test(k)).slice(0, 10)

  const created = await publicDataClient.models.Job.create({
    type: jobTypeFor(form.service, form.packageKey) as never,
    source: 'BOOKING_FORM',
    status: 'NEW',
    category: form.service === 'str' ? 'STR' : 'RESIDENTIAL',
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    propertySize: `${form.packageLabel} · ${form.propertySize}`,
    beds: form.beds,
    baths: form.baths,
    sqft: form.sqft,
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
    estimatedLow: estimate,
    estimatedHigh: estimate,
    notes: form.notes,
    intake: form.intake,
    photoKeys,
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
            `Service:   ${SERVICE_LABELS[form.service]}`,
            `Package:   ${form.packageLabel}`,
            `Property:  ${form.propertySize}`,
            `Frequency: ${form.frequency}`,
            `Add-ons:   ${addOnsSummary}`,
            ``,
            `Date:      ${form.date}`,
            `Arrival:   ${form.timeWindow}`,
            `Same-day:  ${form.emergencySameDay ? 'Yes' : 'No'}`,
            ``,
            `Address:   ${fullAddress}`,
            ``,
            `Estimate shown to client: ${estimateText}`,
            ...form.quoteLines.map((l) => `  ${l}`),
            ...form.quoteSubs.map((l) => `  ${l}`),
            ``,
            ...intakeLines(form.intake).map(([k, v]) => `${(k + ':').padEnd(22)} ${v}`),
            `Photos:    ${photoKeys.length} (view them on the admin job page)`,
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

  // Auto email to the client (plan §10). Never fail the request if this one can't be sent.
  try {
    await ses.send(new SendEmailCommand({
      Source:      NOTIFY_EMAIL,
      Destination: { ToAddresses: [form.email] },
      ReplyToAddresses: [NOTIFY_EMAIL],
      Message: {
        Subject: { Data: 'We received your cleaning request — STR Cleaning Crew' },
        Body: {
          Text: {
            Data: [
              `Hi ${form.firstName},`,
              ``,
              `Thanks for your request. Here's what you sent us:`,
              ``,
              `${SERVICE_LABELS[form.service]}: ${form.packageLabel}`,
              `Property: ${form.propertySize}`,
              `Address: ${fullAddress}`,
              `Preferred dates: ${form.intake.dateWindows.filter((d) => d.date).map((d) => `${d.date} ${d.window}`.trim()).join(', ')}`,
              `Add-ons: ${addOnsSummary}`,
              `Estimate: ${estimateText}`,
              ``,
              `What happens next: we review your request and get back to you to confirm your final price and time. Nothing is booked until we confirm.`,
              ``,
              `Questions? Just reply to this email.`,
              ``,
              `STR Cleaning Crew`,
            ].join('\n'),
          },
        },
      },
    }))
  } catch (err) {
    console.error('submitBooking: client confirmation email failed', err)
  }
}
