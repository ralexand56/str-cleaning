'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

export async function listWorkers() {
  await requireGroup('Admins')
  const { data } = await serverDataClient.models.Worker.list()
  return [...data].sort((a, b) => (a.firstName ?? '').localeCompare(b.firstName ?? ''))
}

export async function setWorkerActive(workerId: string, active: boolean): Promise<void> {
  await requireGroup('Admins')
  await serverDataClient.models.Worker.update({ id: workerId, active })
}
