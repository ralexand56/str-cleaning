'use server'

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { randomUUID } from 'crypto'

const region = process.env.AWS_REGION ?? 'us-east-1'
const dynamo = new DynamoDBClient({ region })
const ses    = new SESClient({ region })

const TABLE_NAME   = process.env.BOOKING_TABLE_NAME ?? 'BookingRequests'
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL       ?? 'info@str-cleaningcrew.com'

export type BookingFormData = {
  serviceType: string
  bedrooms:    number
  bathrooms:   number
  extras:      string[]
  date:        string
  timeWindow:  string
  frequency:   string
  address:     string
  unit:        string
  city:        string
  state:       string
  zip:         string
  firstName:   string
  lastName:    string
  email:       string
  phone:       string
  notes:       string
  estimatedTotal: number
}

export async function submitBooking(form: BookingFormData) {
  const now = new Date().toISOString()
  const id  = randomUUID()

  await dynamo.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id:             { S: id },
      serviceType:    { S: form.serviceType },
      bedrooms:       { N: String(form.bedrooms) },
      bathrooms:      { N: String(form.bathrooms) },
      extras:         { S: form.extras.join(', ') || 'None' },
      date:           { S: form.date },
      timeWindow:     { S: form.timeWindow },
      frequency:      { S: form.frequency },
      address:        { S: `${form.address}${form.unit ? ` #${form.unit}` : ''}, ${form.city}, ${form.state} ${form.zip}` },
      firstName:      { S: form.firstName },
      lastName:       { S: form.lastName },
      email:          { S: form.email },
      phone:          { S: form.phone },
      notes:          { S: form.notes || 'None' },
      estimatedTotal: { N: String(form.estimatedTotal) },
      createdAt:      { S: now },
    },
  }))

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
            `Service:   ${form.serviceType}`,
            `Property:  ${form.bedrooms} bed / ${form.bathrooms} bath`,
            `Extras:    ${form.extras.join(', ') || 'None'}`,
            ``,
            `Date:      ${form.date}`,
            `Arrival:   ${form.timeWindow}`,
            `Frequency: ${form.frequency}`,
            ``,
            `Address:   ${form.address}${form.unit ? ` #${form.unit}` : ''}, ${form.city}, ${form.state} ${form.zip}`,
            ``,
            `Estimated: $${form.estimatedTotal}`,
            ``,
            `Notes:     ${form.notes || 'None'}`,
            ``,
            `Submitted: ${now}`,
            `ID:        ${id}`,
          ].join('\n'),
        },
      },
    },
  }))
}
