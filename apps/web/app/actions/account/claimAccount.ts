'use server'

import { getCurrentUserSub, getCurrentUserEmail } from '@/lib/authGroups'
import { publicDataClient } from '@/lib/data/publicClient'

/**
 * Links the signed-in user's Cognito identity to a guest Customer row created during an earlier,
 * un-authenticated booking — matched by their *verified* Cognito email (not client-supplied input,
 * so a signed-in user can't claim someone else's guest record). Safe to call on every /account
 * visit: no-ops once already claimed.
 *
 * Known limitation: if the same email booked as a guest more than once, only the most recent
 * unclaimed row gets linked — the rest stay orphaned. Acceptable for v1; a real dedupe pass is a
 * fast-follow once there's admin tooling to merge Customer records.
 */
export async function claimCustomerAccount(): Promise<{ customerId: string | null }> {
  const sub = await getCurrentUserSub()
  const email = await getCurrentUserEmail()
  if (!sub || !email) return { customerId: null }

  const alreadyLinked = await publicDataClient.models.Customer.list({ filter: { cognitoSub: { eq: sub } } })
  if (alreadyLinked.data[0]) return { customerId: alreadyLinked.data[0].id }

  const guests = await publicDataClient.models.Customer.list({ filter: { email: { eq: email } } })
  const unclaimed = guests.data.filter((c) => !c.cognitoSub)
  if (unclaimed.length === 0) return { customerId: null }

  const target = [...unclaimed].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0]
  await publicDataClient.models.Customer.update({ id: target.id, cognitoSub: sub })
  return { customerId: target.id }
}
