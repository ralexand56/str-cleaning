'use server'

import { requireGroup } from '@/lib/authGroups'
import { serverDataClient } from '@/lib/data/serverClient'
import { jobTypeFor } from '@/lib/pricing/jobType'
import type { ServiceType } from '@/lib/pricing/types'

export async function createManualJob(input: {
  service: ServiceType
  packageKey: string
  propertySize: string
  beds?: number
  baths?: number
  sqft?: number
  addOns: { id: string; qty: number; label: string; unitPrice: number }[]
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
    type: jobTypeFor(input.service, input.packageKey) as never,
    source: 'ADMIN_MANUAL',
    status: 'QUOTED',
    category: input.service === 'str' ? 'STR' : 'RESIDENTIAL',
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    propertySize: input.propertySize,
    beds: input.beds,
    baths: input.baths,
    sqft: input.sqft,
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
