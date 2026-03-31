'use server'

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { randomUUID } from 'crypto'

const region = process.env.AWS_REGION ?? 'us-east-1'
const dynamo = new DynamoDBClient({ region })
const ses    = new SESClient({ region })

const TABLE_NAME   = process.env.CONTACT_TABLE_NAME ?? 'ContactSubmissions'
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL       ?? 'info@str-cleaningcrew.com'

export type ContactFormData = {
  firstName: string
  lastName:  string
  email:     string
  message:   string
}

export async function submitContact(form: ContactFormData) {
  const now = new Date().toISOString()

  // Save to DynamoDB
  await dynamo.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id:        { S: randomUUID() },
      firstName: { S: form.firstName },
      lastName:  { S: form.lastName },
      email:     { S: form.email },
      message:   { S: form.message },
      createdAt: { S: now },
    },
  }))

  // Send email notification
  await ses.send(new SendEmailCommand({
    Source:      NOTIFY_EMAIL,
    Destination: { ToAddresses: [NOTIFY_EMAIL] },
    Message: {
      Subject: { Data: `New Contact: ${form.firstName} ${form.lastName}` },
      Body: {
        Text: {
          Data: [
            `Name:    ${form.firstName} ${form.lastName}`,
            `Email:   ${form.email}`,
            ``,
            `Message:`,
            form.message,
            ``,
            `Submitted: ${now}`,
          ].join('\n'),
        },
      },
    },
  }))
}
