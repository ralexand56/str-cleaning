'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { publicDataClient } from '@/lib/data/publicClient'
import type { SmsConsentRecord } from '@/lib/booking/smsConsent'

const region = process.env.AWS_REGION ?? 'us-east-1'
const ses    = new SESClient({ region })

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'info@str-cleaningcrew.com'

export type ContactInquiryData = {
  firstName: string
  lastName:  string
  email:     string
  phone:     string
  services:  string[]
  startDate: string
  details:   string
  smsConsent: SmsConsentRecord
}

export async function submitContactInquiry(form: ContactInquiryData) {
  const sms = {
    marketing: form.smsConsent?.marketing === true,
    transactional: form.smsConsent?.transactional === true,
    at: form.smsConsent?.at ?? new Date().toISOString(),
  }
  const created = await publicDataClient.models.Job.create({
    type: 'CONTACT_INQUIRY',
    source: 'CONTACT_FORM',
    status: 'NEW',
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    scheduledDate: form.startDate || undefined,
    rawMessage: form.details,
    notes: `Interested in: ${form.services.join(', ') || 'Not specified'}`,
    intake: JSON.stringify({ source: 'services-form', smsConsent: sms }),
  })
  if (created.errors?.length) console.error('submitContactInquiry: Job not saved', JSON.stringify(created.errors))

  await ses.send(new SendEmailCommand({
    Source:      NOTIFY_EMAIL,
    Destination: { ToAddresses: [NOTIFY_EMAIL] },
    Message: {
      Subject: { Data: `New Services Inquiry — ${form.firstName} ${form.lastName}` },
      Body: {
        Text: {
          Data: [
            `Name:           ${form.firstName} ${form.lastName}`,
            `Email:          ${form.email}`,
            `Phone:          ${form.phone}`,
            `Interested in:  ${form.services.join(', ') || 'Not specified'}`,
            `Preferred start: ${form.startDate || 'Not specified'}`,
            `SMS: booking updates ${sms.transactional ? 'yes' : 'no'}, marketing ${sms.marketing ? 'yes' : 'no'}`,
            ``,
            `Details:`,
            form.details,
          ].join('\n'),
        },
      },
    },
  }))
}
