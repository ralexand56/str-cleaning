'use server'

import { getCurrentUserSub, getGroupsFromServerComponent } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

export async function addJobNote(input: { jobId: string; body: string }): Promise<void> {
  const groups = await getGroupsFromServerComponent()
  const sub = await getCurrentUserSub()
  if (!sub || (!groups.includes('Admins') && !groups.includes('Workers'))) {
    throw new Error('Not authorized')
  }

  await serverDataClient.models.JobNote.create({
    jobId: input.jobId,
    body: input.body,
    authorSub: sub,
    authorRole: groups.includes('Admins') ? 'ADMIN' : 'WORKER',
  })
}

export async function listJobNotes(jobId: string) {
  const groups = await getGroupsFromServerComponent()
  if (!groups.includes('Admins') && !groups.includes('Workers')) {
    throw new Error('Not authorized')
  }
  const { data } = await serverDataClient.models.JobNote.list({ filter: { jobId: { eq: jobId } } })
  return [...data].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
}
