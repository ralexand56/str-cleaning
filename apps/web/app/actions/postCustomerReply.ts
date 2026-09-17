'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { verifyMessageToken } from '@/lib/messageLink'
import { publicDataClient } from '@/lib/data/publicClient'

const region = process.env.AWS_REGION ?? 'us-east-1'
const ses    = new SESClient({ region })
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'info@str-cleaningcrew.com'

export async function postCustomerReply(token: string, body: string): Promise<void> {
  const verified = verifyMessageToken(token)
  if (!verified) throw new Error('This link has expired.')

  await publicDataClient.models.Message.create({
    jobId: verified.jobId,
    senderType: 'CUSTOMER',
    body,
  })

  await ses.send(new SendEmailCommand({
    Source: NOTIFY_EMAIL,
    Destination: { ToAddresses: [NOTIFY_EMAIL] },
    Message: {
      Subject: { Data: `Customer reply — Job ${verified.jobId}` },
      Body: { Text: { Data: `${verified.email} replied:\n\n${body}` } },
    },
  }))
}
