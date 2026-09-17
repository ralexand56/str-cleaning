'use server'

import { getCurrentUserSub, getGroupsFromServerComponent } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

export async function sendWorkerMessage(input: { jobId: string; body: string }): Promise<void> {
  const groups = await getGroupsFromServerComponent()
  const sub = await getCurrentUserSub()
  if (!sub || (!groups.includes('Workers') && !groups.includes('Admins'))) {
    throw new Error('Not authorized')
  }

  await serverDataClient.models.Message.create({
    jobId: input.jobId,
    senderType: 'WORKER',
    senderSub: sub,
    body: input.body,
  })
}
