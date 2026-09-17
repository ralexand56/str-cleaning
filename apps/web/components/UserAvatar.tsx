'use client'

import { useEffect, useState } from 'react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { fetchUserAttributes } from 'aws-amplify/auth'

export function UserAvatar({ size = 32 }: { size?: number }) {
  const { user } = useAuthenticator((ctx) => [ctx.user])
  const [pictureUrl, setPictureUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setPictureUrl(null)
      return
    }
    fetchUserAttributes()
      .then((attrs) => setPictureUrl(attrs.picture ?? null))
      .catch(() => setPictureUrl(null))
  }, [user])

  if (!pictureUrl) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external Google avatar, not worth a next/image remote-pattern allowlist entry
    <img
      src={pictureUrl}
      alt=""
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
      referrerPolicy="no-referrer"
    />
  )
}
