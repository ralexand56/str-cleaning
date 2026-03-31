'use client'

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function SignInContent() {
  const { user } = useAuthenticator((ctx) => [ctx.user])
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/')
  }, [user, router])

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
      <Authenticator />
    </div>
  )
}

export default function SignInPage() {
  return <SignInContent />
}
