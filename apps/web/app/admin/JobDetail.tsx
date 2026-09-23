'use client'

import { useEffect, useState } from 'react'
import type { Schema } from '@/amplify/data/resource'
import { updateJobStatus, type JobStatusValue } from '@/app/actions/admin/updateJobStatus'
import { assignJob } from '@/app/actions/admin/assignJob'
import { addJobNote, listJobNotes } from '@/app/actions/admin/addJobNote'
import { sendAdminMessageToCustomer, sendAdminMessageToWorker, listJobMessages } from '@/app/actions/admin/sendAdminMessage'
import { listCustomerCharges } from '@/app/actions/admin/listCharges'
import { MessageThread, type ThreadMessage } from '@/components/jobs/MessageThread'
import { AddNoteForm, type JobNoteItem } from '@/components/jobs/AddNoteForm'
import { humanize } from '@/lib/format'
import { ChargeCustomerModal } from './ChargeCustomerModal'

type Charge = Schema['Charge']['type']

type Job = Schema['Job']['type']
type Worker = Schema['Worker']['type']

const STATUSES: JobStatusValue[] = ['NEW', 'CONTACTED', 'QUOTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']

export function JobDetail({ job, workers, onChanged }: {
  job: Job
  workers: Worker[]
  onChanged: () => void
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [notes, setNotes] = useState<JobNoteItem[]>([])
  const [workerId, setWorkerId] = useState(job.assignedWorkerId ?? '')
  const [scheduledDate, setScheduledDate] = useState(job.scheduledDate ?? '')
  const [scheduledTimeWindow, setScheduledTimeWindow] = useState(job.scheduledTimeWindow ?? '')
  const [showCharge, setShowCharge] = useState(false)
  const [charges, setCharges] = useState<Charge[]>([])

  function refreshCharges() {
    if (job.customerId) listCustomerCharges(job.customerId).then(setCharges)
  }

  useEffect(() => {
    listJobMessages(job.id).then((m) => setMessages(m.map((x) => ({ id: x.id, senderType: x.senderType as ThreadMessage['senderType'], body: x.body, createdAt: x.createdAt, toEmail: x.toEmail }))))
    listJobNotes(job.id).then((n) => setNotes(n.map((x) => ({ id: x.id, authorRole: x.authorRole, body: x.body, createdAt: x.createdAt }))))
    refreshCharges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id, job.customerId])

  // Message has no explicit "audience" field: a customer-directed admin message carries toEmail,
  // a worker-directed one doesn't. Customer replies are senderType CUSTOMER; workers post as WORKER.
  const customerThread = messages.filter((m) => m.senderType === 'CUSTOMER' || (m.senderType === 'ADMIN' && !!m.toEmail))
  const workerThread = messages.filter((m) => m.senderType === 'WORKER' || (m.senderType === 'ADMIN' && !m.toEmail))

  async function handleStatusChange(status: JobStatusValue) {
    await updateJobStatus(job.id, status)
    onChanged()
  }

  async function handleAssign() {
    if (!workerId) return
    await assignJob({ jobId: job.id, workerId, scheduledDate, scheduledTimeWindow })
    onChanged()
  }

  async function handleSendToCustomer(body: string) {
    if (!job.email) return
    await sendAdminMessageToCustomer({ jobId: job.id, body, customerEmail: job.email })
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), senderType: 'ADMIN', body, toEmail: job.email }])
  }

  async function handleSendToWorker(body: string) {
    await sendAdminMessageToWorker({ jobId: job.id, body })
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), senderType: 'ADMIN', body }])
  }

  async function handleAddNote(body: string) {
    await addJobNote({ jobId: job.id, body })
    setNotes((prev) => [...prev, { id: crypto.randomUUID(), authorRole: 'ADMIN', body }])
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-marcellus text-xl">{job.firstName} {job.lastName}</p>
        <p className="font-marcellus text-sm opacity-50">{job.email} · {job.phone}</p>
        <p className="font-marcellus text-sm opacity-50 mt-1">{humanize(job.type)} · {job.propertySize}</p>
        {job.address && <p className="font-marcellus text-sm opacity-50">{job.address}, {job.city}, {job.state} {job.zip}</p>}
        {(job.estimatedLow != null || job.quotedTotal != null) && (
          <p className="font-marcellus text-sm opacity-50 mt-1">
            {job.quotedTotal != null ? `Quoted: $${job.quotedTotal}` : `Estimate: $${job.estimatedLow}–$${job.estimatedHigh}`}
          </p>
        )}
      </div>

      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusChange(s)}
              className={`px-4 py-2 rounded-full border font-marcellus text-xs cursor-pointer transition-colors ${job.status === s ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50'}`}
            >
              {humanize(s)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Assign & schedule</p>
        <div className="flex flex-wrap gap-3 items-end">
          <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2">
            <option value="">Choose a worker…</option>
            {workers.map((w) => <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>)}
          </select>
          <input type="date" value={scheduledDate ?? ''} onChange={(e) => setScheduledDate(e.target.value)} className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
          <input type="text" value={scheduledTimeWindow ?? ''} onChange={(e) => setScheduledTimeWindow(e.target.value)} placeholder="Time window" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2 w-40" />
          <button type="button" onClick={handleAssign} disabled={!workerId} className="px-5 py-2 rounded-full bg-dark-brown text-stone font-marcellus text-sm disabled:opacity-50 cursor-pointer">
            Assign
          </button>
        </div>
      </div>

      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Message customer</p>
        <MessageThread messages={customerThread} onSend={handleSendToCustomer} placeholder="Message the customer…" />
      </div>

      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Message worker</p>
        <MessageThread messages={workerThread} onSend={handleSendToWorker} placeholder="Message the assigned worker…" />
      </div>

      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Job notes</p>
        <AddNoteForm notes={notes} onAdd={handleAddNote} />
      </div>

      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Charge history</p>
        {charges.length === 0 && <p className="font-marcellus text-sm opacity-35">No charges yet.</p>}
        <div className="flex flex-col gap-2 mb-3">
          {charges.map((c) => (
            <div key={c.id} className="flex justify-between items-baseline px-4 py-2.5 rounded-lg border border-dark-brown/12 font-marcellus text-sm">
              <div>
                <span>{c.description || 'Charge'}</span>
                {c.jobId !== job.id && <span className="opacity-35 text-xs ml-2">(other job)</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="opacity-50 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
                <span className={c.status === 'SUCCEEDED' ? 'text-green-700' : c.status === 'FAILED' ? 'text-red-600' : 'opacity-60'}>
                  ${(c.amountCents / 100).toFixed(2)} · {humanize(c.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setShowCharge(true)} className="px-6 py-3 rounded-full border border-dark-brown/30 font-marcellus text-sm cursor-pointer">
          Charge customer
        </button>
      </div>

      {showCharge && job.customerId && (
        <ChargeCustomerModal
          jobId={job.id}
          customerId={job.customerId}
          onClose={() => setShowCharge(false)}
          onCharged={refreshCharges}
        />
      )}
    </div>
  )
}
