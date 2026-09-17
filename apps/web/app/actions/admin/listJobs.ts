'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'
import type { Schema } from '@/amplify/data/resource'

export type JobStatus = Schema['Job']['type']['status']
export type JobRecord = Schema['Job']['type']

export async function listJobs(filters?: { status?: string; type?: string }): Promise<JobRecord[]> {
  await requireGroup('Admins')

  const filter: Record<string, unknown> = {}
  if (filters?.status) filter.status = { eq: filters.status }
  if (filters?.type) filter.type = { eq: filters.type }

  const { data } = await serverDataClient.models.Job.list({
    filter: Object.keys(filter).length ? filter : undefined,
  })

  return [...data].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}
