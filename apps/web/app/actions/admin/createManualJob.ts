'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'
import type { SelectedAddOn } from '@/lib/pricing/types'

const SERVICE_KEY_TO_JOB_TYPE: Record<string, string> = {
  str_turnover: 'STR_TURNOVER',
  str_deep: 'STR_DEEP',
  str_seasonal: 'STR_SEASONAL',
  str_startup: 'STR_STARTUP',
  str_subscription_standard: 'STR_SUBSCRIPTION_STANDARD',
  str_subscription_premium: 'STR_SUBSCRIPTION_PREMIUM',
  residential_first_visit: 'RESIDENTIAL_FIRST_VISIT',
  residential_recurring: 'RESIDENTIAL_RECURRING',
  move_in_out: 'MOVE_IN_OUT',
  post_construction: 'POST_CONSTRUCTION',
}

export async function createManualJob(input: {
  category: 'str' | 'residential'
  serviceKey: string
  propertySize: string
  addOns: SelectedAddOn[]
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
  quotedTotal: number
}): Promise<string> {
  await requireGroup('Admins')

  const created = await serverDataClient.models.Job.create({
    type: (SERVICE_KEY_TO_JOB_TYPE[input.serviceKey] ?? 'STR_TURNOVER') as never,
    source: 'ADMIN_MANUAL',
    status: 'QUOTED',
    category: input.category === 'residential' ? 'RESIDENTIAL' : 'STR',
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    propertySize: input.propertySize,
    address: input.address,
    city: input.city,
    state: input.state,
    zip: input.zip,
    addOns: input.addOns,
    notes: input.notes,
    quotedTotal: input.quotedTotal,
  })

  return created.data?.id ?? ''
}
