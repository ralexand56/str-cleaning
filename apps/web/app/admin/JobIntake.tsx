'use client'

import { useEffect, useState } from 'react'
import { getUrl } from 'aws-amplify/storage'
import { intakeLines, type BookingIntake } from '@/lib/booking/intake'

type AddOnLine = { id: string; qty: number; label?: string; unitPrice?: number }

function parseJson<T>(v: unknown): T | null {
  if (v == null) return null
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as T
    } catch {
      return null
    }
  }
  return v as T
}

/** Booking answers, add-ons and photos for the admin job page. */
export function JobIntake({ intake, addOns, photoKeys, notes }: {
  intake: unknown
  addOns: unknown
  photoKeys: (string | null)[] | null | undefined
  notes: string | null | undefined
}) {
  const parsed = parseJson<BookingIntake>(intake)
  const lines = parseJson<AddOnLine[]>(addOns) ?? []
  const keys = (photoKeys ?? []).filter((k): k is string => !!k)
  const [urls, setUrls] = useState<{ key: string; url: string }[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all(
      keys.map((key) =>
        getUrl({ path: key, options: { expiresIn: 3600 } })
          .then((r) => ({ key, url: r.url.toString() }))
          .catch(() => null),
      ),
    ).then((r) => {
      if (!cancelled) setUrls(r.filter((x): x is { key: string; url: string } => !!x))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join('|')])

  if (!parsed && !lines.length && !keys.length && !notes) return null

  return (
    <div className="flex flex-col gap-4">
      <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider">Request details</p>
      {parsed && (
        <dl className="grid grid-cols-[minmax(110px,160px)_1fr] gap-x-4 gap-y-1.5 font-marcellus text-sm">
          {intakeLines(parsed).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="opacity-50">{k}</dt>
              <dd className="m-0 break-words">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {lines.length > 0 && (
        <div className="font-marcellus text-sm">
          <span className="opacity-50">Add-ons: </span>
          {lines.map((a) => `${a.label ?? a.id} × ${a.qty}${a.unitPrice ? ` ($${a.unitPrice})` : ''}`).join(', ')}
        </div>
      )}
      {notes && (
        <div className="font-marcellus text-sm">
          <span className="opacity-50">Client notes: </span>
          {notes}
        </div>
      )}
      {keys.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {urls.map(({ key, url }) => (
            <a key={key} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-dark-brown/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Photo from the client" className="w-full h-full object-cover" />
            </a>
          ))}
          {urls.length < keys.length && (
            <p className="font-marcellus text-xs opacity-50 col-span-full">
              {keys.length - urls.length} photo{keys.length - urls.length !== 1 ? 's' : ''} couldn’t be loaded.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
