'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

export async function assignJob(input: {
  jobId: string
  workerId: string
  scheduledDate?: string
  scheduledTimeWindow?: string
}): Promise<void> {
  await requireGroup('Admins')

  const { data: worker } = await serverDataClient.models.Worker.get({ id: input.workerId })
  if (!worker) throw new Error('Worker not found')

  await serverDataClient.models.Job.update({
    id: input.jobId,
    assignedWorkerId: input.workerId,
    assignedWorkerSub: worker.cognitoSub,
    scheduledDate: input.scheduledDate,
    scheduledTimeWindow: input.scheduledTimeWindow,
    status: 'SCHEDULED',
  })
}

export async function listActiveWorkers() {
  await requireGroup('Admins')
  const { data } = await serverDataClient.models.Worker.list({ filter: { active: { eq: true } } })
  return data
}
