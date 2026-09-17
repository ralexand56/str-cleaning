import { cookies } from 'next/headers'
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data'
import type { Schema } from '@/amplify/data/resource'
import config from '@/amplify_outputs.json'

/**
 * Authenticated (userPool) data client for server actions/pages called by a signed-in
 * Admin or Worker. Reads the caller's session from cookies — callers must still check
 * `getGroupsFromServerComponent()` before performing privileged writes; Amplify's own
 * model-level `allow.group(...)` rules are the real enforcement boundary.
 */
export const serverDataClient = generateServerClientUsingCookies<Schema>({
  config: config as Parameters<typeof generateServerClientUsingCookies>[0]['config'],
  cookies,
})
