'use server'

import { getCurrentUserSub, getGroupsFromServerComponent } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

async function requireWorkerSub(): Promise<string> {
  const groups = await getGroupsFromServerComponent()
  const sub = await getCurrentUserSub()
  if (!sub || (!groups.includes('Workers') && !groups.includes('Admins'))) {
    throw new Error('Not authorized')
  }
  return sub
}

export async function getCurrentWorker() {
  const sub = await requireWorkerSub()
  const { data } = await serverDataClient.models.Worker.list({ filter: { cognitoSub: { eq: sub } } })
  return data[0] ?? null
}

export async function listMyJobs() {
  const worker = await getCurrentWorker()
  if (!worker) return []

  // JobAssignment is row-scoped to the caller via allow.ownerDefinedIn('workerSub') — this list
  // only ever returns the signed-in worker's own assignments, regardless of the filter below.
  const { data: assignments } = await serverDataClient.models.JobAssignment.list({
    filter: { workerId: { eq: worker.id } },
  })
  if (assignments.length === 0) return []

  // Job itself only has blanket Workers-group read (not row-scoped — a join table can't drive
  // Amplify's owner auth), so the JobAssignment list above is what actually determines "my jobs."
  const jobs = await Promise.all(
    assignments.map((a) => serverDataClient.models.Job.get({ id: a.jobId }).then((r) => r.data))
  )
  return jobs
    .filter((j): j is NonNullable<typeof j> => j !== null)
    .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))
}

export async function getMyJob(jobId: string) {
  const groups = await getGroupsFromServerComponent()
  await requireWorkerSub()

  // Admins browsing /worker (allowed for support/testing) skip the assignment check — they can
  // already see any job in /admin.
  if (!groups.includes('Admins')) {
    const worker = await getCurrentWorker()
    if (!worker) return null

    // Defense in depth: confirm this worker is actually assigned to this job before returning it,
    // since Job read is blanket-group (see comment on Job's authorization in amplify/data/resource.ts).
    const { data: assignments } = await serverDataClient.models.JobAssignment.list({
      filter: { jobId: { eq: jobId }, workerId: { eq: worker.id } },
    })
    if (assignments.length === 0) return null
  }

  const { data } = await serverDataClient.models.Job.get({ id: jobId })
  return data
}
