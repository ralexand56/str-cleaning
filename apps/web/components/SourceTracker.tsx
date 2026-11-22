'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureSource } from '@/lib/tracking/source'

/** Remembers ?src= from the landing link for the rest of the visit. Renders nothing. */
export function SourceTracker() {
  const pathname = usePathname()
  useEffect(() => {
    captureSource()
  }, [pathname])
  return null
}
