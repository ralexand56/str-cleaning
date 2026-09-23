'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

/** Adds one more worker to a job. A job can have several workers assigned at once. */
export async function assignWorkerToJob(input: {
  jobId: string
  workerId: string
  scheduledDate?: string
  scheduledTimeWindow?: string
}): Promise<void> {
  await requireGroup('Admins')

  const { data: worker } = await serverDataClient.models.Worker.get({ id: input.workerId })
  if (!worker) throw new Error('Worker not found')

  const { data: existing } = await serverDataClient.models.JobAssignment.list({
    filter: { jobId: { eq: input.jobId }, workerId: { eq: input.workerId } },
  })
  if (!existing[0]) {
    await serverDataClient.models.JobAssignment.create({
      jobId: input.jobId,
      workerId: input.workerId,
      workerSub: worker.cognitoSub,
    })
  }

  await serverDataClient.models.Job.update({
    id: input.jobId,
    scheduledDate: input.scheduledDate,
    scheduledTimeWindow: input.scheduledTimeWindow,
    status: 'SCHEDULED',
  })
}

export async function unassignWorkerFromJob(assignmentId: string): Promise<void> {
  await requireGroup('Admins')
  await serverDataClient.models.JobAssignment.delete({ id: assignmentId })
}

export async function listJobAssignments(jobId: string) {
  await requireGroup('Admins')
  const { data } = await serverDataClient.models.JobAssignment.list({ filter: { jobId: { eq: jobId } } })
  return data
}

export async function listActiveWorkers() {
  await requireGroup('Admins')
  const { data } = await serverDataClient.models.Worker.list({ filter: { active: { eq: true } } })
  return data
}
