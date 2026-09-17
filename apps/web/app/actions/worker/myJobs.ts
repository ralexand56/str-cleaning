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
  const { data } = await serverDataClient.models.Job.list({ filter: { assignedWorkerId: { eq: worker.id } } })
  return [...data].sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))
}

export async function getMyJob(jobId: string) {
  await requireWorkerSub()
  // Row-level authorization (allow.ownerDefinedIn('assignedWorkerSub')) already scopes this to
  // jobs assigned to the caller, or any job for an Admin — this returns null instead of throwing
  // when a worker requests a job that isn't theirs.
  try {
    const { data } = await serverDataClient.models.Job.get({ id: jobId })
    return data
  } catch {
    return null
  }
}
