'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({ region: process.env.AWS_REGION ?? 'us-east-1' })
const FROM_EMAIL = process.env.NOTIFY_EMAIL ?? 'info@str-cleaningcrew.com'

export async function sendReply({
  to,
  subject,
  message,
}: {
  to: string
  subject: string
  message: string
}) {
  await ses.send(new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Text: { Data: message },
      },
    },
  }))
}
