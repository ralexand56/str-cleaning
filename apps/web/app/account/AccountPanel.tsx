'use client'

import { useEffect, useState } from 'react'
import type { Schema } from '@/amplify/data/resource'
import { humanize } from '@/lib/format'
import { sendCustomerMessage, listMyJobMessages } from '@/app/actions/account/customerMessages'
import { MessageThread, type ThreadMessage } from '@/components/jobs/MessageThread'

type Job = Schema['Job']['type']
type Charge = Schema['Charge']['type']

export function AccountPanel({ jobs, charges, hasCustomer }: {
  jobs: Job[]
  charges: Charge[]
  hasCustomer: boolean
}) {
  const [selectedId, setSelectedId] = useState<string | null>(jobs[0]?.id ?? null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }
    listMyJobMessages(selectedId).then((m) =>
      setMessages(m.map((x) => ({ id: x.id, senderType: x.senderType as ThreadMessage['senderType'], body: x.body, createdAt: x.createdAt })))
    )
  }, [selectedId])

  async function handleSend(body: string) {
    if (!selectedId) return
    await sendCustomerMessage({ jobId: selectedId, body })
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), senderType: 'CUSTOMER', body }])
  }

  if (!hasCustomer) {
    return (
      <p className="font-marcellus text-sm opacity-50">
        No bookings found yet under this email. Once you book a cleaning at{' '}
        <a href="/book" className="underline">/book</a>, it&apos;ll show up here.
      </p>
    )
  }

  const selected = jobs.find((j) => j.id === selectedId) ?? null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
      <div className="flex flex-col gap-2">
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-1">Your bookings</p>
        {jobs.length === 0 && <p className="font-marcellus text-sm opacity-40">No bookings yet.</p>}
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => setSelectedId(job.id)}
            className={`text-left px-5 py-4 rounded-xl border font-marcellus text-sm cursor-pointer transition-colors ${selectedId === job.id ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35'}`}
          >
            <div className="flex justify-between gap-2">
              <span>{humanize(job.type)}</span>
              <span className="opacity-40 text-xs">{humanize(job.status)}</span>
            </div>
            <p className="opacity-40 text-xs mt-1">{job.propertySize ?? '—'}{job.frequency ? ` · ${job.frequency}` : ''}</p>
          </button>
        ))}

        {charges.length > 0 && (
          <div className="mt-6">
            <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Charges</p>
            <div className="flex flex-col gap-2">
              {charges.map((c) => (
                <div key={c.id} className="flex justify-between px-4 py-2 rounded-lg border border-dark-brown/10 font-marcellus text-xs">
                  <span>{c.description ?? 'Charge'}</span>
                  <span className="opacity-60">${(c.amountCents / 100).toFixed(2)} · {humanize(c.status)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dark-brown/12 p-6 min-h-[300px]">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-marcellus text-lg">{humanize(selected.type)}</p>
              <p className="font-marcellus text-sm opacity-50">
                {selected.scheduledDate ?? 'Not yet scheduled'}{selected.scheduledTimeWindow ? ` · ${selected.scheduledTimeWindow}` : ''}
              </p>
            </div>
            <MessageThread messages={messages} onSend={handleSend} placeholder="Message us about this booking…" />
          </div>
        ) : (
          <p className="font-marcellus text-sm opacity-40">Select a booking to view messages.</p>
        )}
      </div>
    </div>
  )
}
