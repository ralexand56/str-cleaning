'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { publicDataClient } from '@/lib/data/publicClient'

const region       = process.env.AWS_REGION   ?? 'us-east-1'
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'info@str-cleaningcrew.com'

const ses = new SESClient({ region })

export type AppointmentData = {
  service:   string
  duration:  string
  price:     string | null
  date:      string   // ISO date string e.g. "2026-05-03"
  time:      string   // e.g. "10:00 AM"
  firstName: string
  lastName:  string
  phone:     string
  email:     string
}

export async function scheduleAppointment(data: AppointmentData) {
  const now = new Date().toISOString()

  const created = await publicDataClient.models.Job.create({
    type: 'WALKTHROUGH_APPOINTMENT',
    source: 'APPOINTMENT_SCHEDULER',
    status: 'NEW',
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    scheduledDate: data.date,
    scheduledTimeWindow: data.time,
    notes: `${data.service} (${data.duration}${data.price ? ` @ ${data.price}` : ''})`,
  })

  await ses.send(new SendEmailCommand({
    Source:      NOTIFY_EMAIL,
    Destination: { ToAddresses: [NOTIFY_EMAIL] },
    Message: {
      Subject: { Data: `New Appointment: ${data.service} — ${data.firstName} ${data.lastName}` },
      Body: {
        Text: {
          Data: [
            `Service:  ${data.service} (${data.duration}${data.price ? ` @ ${data.price}` : ''})`,
            `Date:     ${data.date} at ${data.time}`,
            ``,
            `Name:     ${data.firstName} ${data.lastName}`,
            `Phone:    ${data.phone}`,
            `Email:    ${data.email}`,
            ``,
            `Submitted: ${now}`,
            `Job ID:    ${created.data?.id ?? 'unknown'}`,
          ].join('\n'),
        },
      },
    },
  }))
}
