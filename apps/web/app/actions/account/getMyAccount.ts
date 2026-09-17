'use server'

import { getCurrentUserSub } from '@/lib/authGroups'
import { publicDataClient } from '@/lib/data/publicClient'

export async function getMyAccount() {
  const sub = await getCurrentUserSub()
  if (!sub) return null

  const { data: customers } = await publicDataClient.models.Customer.list({ filter: { cognitoSub: { eq: sub } } })
  const customer = customers[0]
  if (!customer) return { customer: null, jobs: [], charges: [] }

  const [{ data: jobs }, { data: charges }] = await Promise.all([
    publicDataClient.models.Job.list({ filter: { customerId: { eq: customer.id } } }),
    publicDataClient.models.Charge.list({ filter: { customerId: { eq: customer.id } } }),
  ])

  return {
    customer,
    jobs: [...jobs].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
    charges: [...charges].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
  }
}
