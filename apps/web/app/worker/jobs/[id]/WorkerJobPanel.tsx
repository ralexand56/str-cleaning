'use client'

import { useEffect, useState } from 'react'
import { listJobMessages } from '@/app/actions/admin/sendAdminMessage'
import { sendWorkerMessage } from '@/app/actions/worker/workerMessage'
import { addJobNote, listJobNotes } from '@/app/actions/admin/addJobNote'
import { MessageThread, type ThreadMessage } from '@/components/jobs/MessageThread'
import { AddNoteForm, type JobNoteItem } from '@/components/jobs/AddNoteForm'

export function WorkerJobPanel({ jobId }: { jobId: string }) {
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [notes, setNotes] = useState<JobNoteItem[]>([])

  useEffect(() => {
    listJobMessages(jobId).then((m) => setMessages(
      m
        .filter((x) => x.senderType === 'WORKER' || (x.senderType === 'ADMIN' && !x.toEmail))
        .map((x) => ({ id: x.id, senderType: x.senderType as ThreadMessage['senderType'], body: x.body, createdAt: x.createdAt }))
    ))
    listJobNotes(jobId).then((n) => setNotes(n.map((x) => ({ id: x.id, authorRole: x.authorRole, body: x.body, createdAt: x.createdAt }))))
  }, [jobId])

  async function handleSend(body: string) {
    await sendWorkerMessage({ jobId, body })
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), senderType: 'WORKER', body }])
  }

  async function handleAddNote(body: string) {
    await addJobNote({ jobId, body })
    setNotes((prev) => [...prev, { id: crypto.randomUUID(), authorRole: 'WORKER', body }])
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Message the office</p>
        <MessageThread messages={messages} onSend={handleSend} placeholder="Message the office…" />
      </div>
      <div>
        <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-2">Job notes</p>
        <AddNoteForm notes={notes} onAdd={handleAddNote} />
      </div>
    </div>
  )
}
