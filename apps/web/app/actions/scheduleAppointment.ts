'use server'

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { randomUUID } from 'crypto'

const region      = process.env.AWS_REGION        ?? 'us-east-1'
const TABLE_NAME  = process.env.BOOKINGS_TABLE_NAME ?? 'Bookings'
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL      ?? 'info@str-cleaningcrew.com'

const dynamo = new DynamoDBClient({ region })
const ses    = new SESClient({ region })

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

  await dynamo.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id:        { S: randomUUID() },
      service:   { S: data.service },
      duration:  { S: data.duration },
      price:     { S: data.price ?? 'Free' },
      date:      { S: data.date },
      time:      { S: data.time },
      firstName: { S: data.firstName },
      lastName:  { S: data.lastName },
      phone:     { S: data.phone },
      email:     { S: data.email },
      createdAt: { S: now },
    },
  }))

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
          ].join('\n'),
        },
      },
    },
  }))
}
