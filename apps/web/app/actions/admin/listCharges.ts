'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'

/** Full charge history for a customer — spans every job, since the same saved card can be charged across jobs. */
export async function listCustomerCharges(customerId: string) {
  await requireGroup('Admins')
  const { data } = await serverDataClient.models.Charge.list({ filter: { customerId: { eq: customerId } } })
  return [...data].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}
