'use client'

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'

function SignInContent() {
  const { user } = useAuthenticator((ctx) => [ctx.user])
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    async function redirectAfterSignIn() {
      // Honor ?next= set by middleware.ts when it bounced an unauthenticated visit to /admin or /worker.
      const next = new URLSearchParams(window.location.search).get('next')
      if (next) {
        router.push(next)
        return
      }
      // No explicit destination — route by role so Admins/Workers land somewhere useful.
      try {
        const session = await fetchAuthSession()
        const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[] | undefined) ?? []
        if (groups.includes('Admins')) router.push('/admin')
        else if (groups.includes('Workers')) router.push('/worker')
        else router.push('/')
      } catch {
        router.push('/')
      }
    }

    redirectAfterSignIn()
  }, [user, router])

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
      <Authenticator socialProviders={['google']} />
    </div>
  )
}

export default function SignInPage() {
  return <SignInContent />
}
