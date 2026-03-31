'use client'

/**
 * Configures AWS Amplify and provides the Authenticator context.
 *
 * amplify_outputs.json starts as an empty stub ({}).
 * Run `npx ampx sandbox` inside apps/web to populate it with real AWS config.
 */

import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { type ReactNode } from 'react'
import config from '@/amplify_outputs.json'

// Only configure if the sandbox has populated the file
if (Object.keys(config).length > 0) {
  Amplify.configure(config as Parameters<typeof Amplify.configure>[0], { ssr: true })
}

export function AmplifyProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Authenticator.Provider>{children as any}</Authenticator.Provider>
}
