'use server'

import { getCurrentUserSub } from '@/lib/authGroups'
import { publicDataClient } from '@/lib/data/publicClient'

async function assertJobBelongsToCaller(jobId: string, sub: string): Promise<void> {
  const { data: job } = await publicDataClient.models.Job.get({ id: jobId })
  if (!job?.customerId) throw new Error('Not authorized for this job')
  const { data: customer } = await publicDataClient.models.Customer.get({ id: job.customerId })
  if (customer?.cognitoSub !== sub) throw new Error('Not authorized for this job')
}

export async function sendCustomerMessage(input: { jobId: string; body: string }): Promise<void> {
  const sub = await getCurrentUserSub()
  if (!sub) throw new Error('Not authorized')
  await assertJobBelongsToCaller(input.jobId, sub)

  await publicDataClient.models.Message.create({
    jobId: input.jobId,
    senderType: 'CUSTOMER',
    senderSub: sub,
    body: input.body,
  })
}

export async function listMyJobMessages(jobId: string) {
  const sub = await getCurrentUserSub()
  if (!sub) throw new Error('Not authorized')
  await assertJobBelongsToCaller(jobId, sub)

  const { data } = await publicDataClient.models.Message.list({ filter: { jobId: { eq: jobId } } })
  return [...data]
    // Exclude the internal admin<->worker thread (worker-authored, or admin messages with no toEmail).
    .filter((m) => m.senderType !== 'WORKER' && !(m.senderType === 'ADMIN' && !m.toEmail))
    .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}
