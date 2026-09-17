import type { NextRequest, NextResponse } from 'next/server'
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server'
import { runWithAmplifyServerContext } from '@/lib/amplify-server-utils'

/** Reads the caller's Cognito groups inside Next.js middleware. */
export async function getGroupsFromMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<string[]> {
  return runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      const session = await fetchAuthSession(contextSpec)
      const groups = session.tokens?.accessToken?.payload['cognito:groups']
      return Array.isArray(groups) ? (groups as string[]) : []
    },
  })
}

/** Reads the caller's Cognito groups inside a server component (layouts/pages). */
export async function getGroupsFromServerComponent(): Promise<string[]> {
  const { cookies } = await import('next/headers')
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec)
        const groups = session.tokens?.accessToken?.payload['cognito:groups']
        return Array.isArray(groups) ? (groups as string[]) : []
      } catch {
        return []
      }
    },
  })
}

/** Throws unless the caller is in the given group. For use at the top of admin/worker server actions. */
export async function requireGroup(group: string): Promise<void> {
  const groups = await getGroupsFromServerComponent()
  if (!groups.includes(group)) {
    throw new Error('Not authorized')
  }
}

/** Reads the caller's Cognito sub (user id) inside a server component. */
export async function getCurrentUserSub(): Promise<string | null> {
  const { cookies } = await import('next/headers')
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec)
        return session.tokens?.accessToken?.payload['sub'] as string | undefined ?? null
      } catch {
        return null
      }
    },
  })
}

/** Reads the caller's verified Cognito email inside a server component — used to claim a guest Customer row. */
export async function getCurrentUserEmail(): Promise<string | null> {
  const { cookies } = await import('next/headers')
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const attrs = await fetchUserAttributes(contextSpec)
        return attrs.email ?? null
      } catch {
        return null
      }
    },
  })
}

/** Whether any user is signed in at all, regardless of group — used to gate /account in middleware. */
export async function isAuthenticatedFromMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<boolean> {
  return runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec)
        return !!session.tokens
      } catch {
        return false
      }
    },
  })
}
