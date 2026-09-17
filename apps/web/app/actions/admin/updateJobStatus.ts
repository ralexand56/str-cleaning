'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

export type JobStatusValue = 'NEW' | 'CONTACTED' | 'QUOTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'

export async function updateJobStatus(jobId: string, status: JobStatusValue): Promise<void> {
  await requireGroup('Admins')
  await serverDataClient.models.Job.update({ id: jobId, status })
}
