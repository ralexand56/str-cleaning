import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import config from '@/amplify_outputs.json'

/**
 * Data client for anonymous, public writes (booking form, contact form, customer reply links).
 * Uses the scoped apiKey auth mode configured in amplify/data/resource.ts, which only permits
 * `create` on Customer/Job/Message. Only ever import this from server-only code ('use server'
 * files) — never from a client component.
 */
if (Object.keys(config).length > 0) {
  Amplify.configure(config as Parameters<typeof Amplify.configure>[0])
}

export const publicDataClient = generateClient<Schema>({ authMode: 'apiKey' })
