'use server'

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { requireGroup, getCurrentUserSub, getGroupsFromServerComponent } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'
import { signMessageToken } from '@/lib/messageLink'

const region = process.env.AWS_REGION ?? 'us-east-1'
const ses    = new SESClient({ region })
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'info@str-cleaningcrew.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function sendAdminMessageToCustomer(input: { jobId: string; body: string; customerEmail: string }): Promise<void> {
  await requireGroup('Admins')
  const sub = await getCurrentUserSub()

  await serverDataClient.models.Message.create({
    jobId: input.jobId,
    senderType: 'ADMIN',
    senderSub: sub ?? undefined,
    toEmail: input.customerEmail,
    body: input.body,
  })

  const token = signMessageToken(input.jobId, input.customerEmail)
  const link = `${SITE_URL}/messages/${token}`

  await ses.send(new SendEmailCommand({
    Source: NOTIFY_EMAIL,
    Destination: { ToAddresses: [input.customerEmail] },
    Message: {
      Subject: { Data: 'A message about your cleaning' },
      Body: {
        Text: {
          Data: [input.body, '', `Reply here: ${link}`].join('\n'),
        },
      },
    },
  }))
}

export async function sendAdminMessageToWorker(input: { jobId: string; body: string }): Promise<void> {
  await requireGroup('Admins')
  const sub = await getCurrentUserSub()

  await serverDataClient.models.Message.create({
    jobId: input.jobId,
    senderType: 'ADMIN',
    senderSub: sub ?? undefined,
    body: input.body,
  })
}

export async function listJobMessages(jobId: string) {
  const groups = await getGroupsFromServerComponent()
  if (!groups.includes('Admins') && !groups.includes('Workers')) {
    throw new Error('Not authorized')
  }
  const { data } = await serverDataClient.models.Message.list({ filter: { jobId: { eq: jobId } } })
  return [...data].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}
