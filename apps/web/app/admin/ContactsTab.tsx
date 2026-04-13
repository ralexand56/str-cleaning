'use client'

import { useState, useTransition } from 'react'
import type { ContactRecord } from '@/app/actions/getContacts'
import { sendReply } from '@/app/actions/sendReply'

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function ReplyForm({ contact }: { contact: ContactRecord }) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(`Re: Your message to STR Cleaning Crew`)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setOpen(true)
    setStatus('idle')
  }

  function handleCancel() {
    setOpen(false)
    setStatus('idle')
  }

  function handleSend() {
    if (!message.trim()) return
    startTransition(async () => {
      try {
        await sendReply({ to: contact.email, subject, message })
        setStatus('sent')
        setMessage('')
        setOpen(false)
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    })
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-3">
        <p className="font-marcellus text-sm text-dark-brown opacity-60">Reply sent.</p>
        <button
          onClick={() => { setStatus('idle'); setOpen(false) }}
          className="font-marcellus text-sm text-dark-brown opacity-40 hover:opacity-70 transition-opacity"
        >
          Send another
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="self-start mt-2 px-7 py-3 rounded-full bg-dark-brown text-stone font-marcellus text-sm hover:opacity-80 transition-opacity"
      >
        Reply
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex flex-col gap-1">
        <label className="font-marcellus text-xs text-dark-brown opacity-50 uppercase tracking-widest">To</label>
        <p className="font-marcellus text-sm text-dark-brown opacity-70">{contact.email}</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-marcellus text-xs text-dark-brown opacity-50 uppercase tracking-widest">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border border-dark-brown/30 rounded px-3 py-2 font-marcellus text-sm text-dark-brown bg-transparent outline-none focus:border-dark-brown/70 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-marcellus text-xs text-dark-brown opacity-50 uppercase tracking-widest">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Write your reply…"
          className="border border-dark-brown/30 rounded px-3 py-2 font-marcellus text-sm text-dark-brown bg-transparent outline-none focus:border-dark-brown/70 transition-colors resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="font-marcellus text-xs text-red-600">Failed to send: {errorMsg}</p>
      )}

      <div className="flex gap-3 items-center">
        <button
          onClick={handleSend}
          disabled={isPending || !message.trim()}
          className="px-7 py-3 rounded-full bg-dark-brown text-stone font-marcellus text-sm hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isPending ? 'Sending…' : 'Send'}
        </button>
        <button
          onClick={handleCancel}
          className="font-marcellus text-sm text-dark-brown opacity-40 hover:opacity-70 transition-opacity"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export function ContactsTab({ contacts }: { contacts: ContactRecord[] }) {
  const [selected, setSelected] = useState<ContactRecord | null>(contacts[0] ?? null)

  if (contacts.length === 0) {
    return (
      <p className="font-marcellus text-dark-brown opacity-50 pt-8">No contact submissions yet.</p>
    )
  }

  return (
    <div className="flex gap-0 border border-dark-brown/15 rounded overflow-hidden" style={{ minHeight: 480 }}>
      {/* Master list */}
      <div className="w-72 shrink-0 border-r border-dark-brown/15 overflow-y-auto">
        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={[
              'w-full text-left px-4 py-4 border-b border-dark-brown/10 transition-colors',
              selected?.id === c.id
                ? 'bg-dark-brown text-stone'
                : 'hover:bg-dark-brown/5 text-dark-brown',
            ].join(' ')}
          >
            <p className="font-marcellus text-sm font-medium truncate">
              {c.firstName} {c.lastName}
            </p>
            <p className={`font-marcellus text-xs truncate mt-0.5 ${selected?.id === c.id ? 'opacity-70' : 'opacity-50'}`}>
              {c.email}
            </p>
            <p className={`font-marcellus text-xs mt-1 ${selected?.id === c.id ? 'opacity-60' : 'opacity-40'}`}>
              {formatDate(c.createdAt)}
            </p>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selected ? (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-marcellus text-dark-brown text-2xl">
                {selected.firstName} {selected.lastName}
              </h2>
              <p className="font-marcellus text-dark-brown opacity-50 text-sm mt-1">
                {formatDate(selected.createdAt)}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-marcellus text-dark-brown text-xs opacity-50 uppercase tracking-widest">Email</p>
              <p className="font-marcellus text-dark-brown text-sm">{selected.email}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-marcellus text-dark-brown text-xs opacity-50 uppercase tracking-widest">Message</p>
              <p className="font-marcellus text-dark-brown text-sm leading-relaxed whitespace-pre-wrap opacity-80">
                {selected.message}
              </p>
            </div>

            <ReplyForm key={selected.id} contact={selected} />
          </div>
        ) : (
          <p className="font-marcellus text-dark-brown opacity-40">Select a contact</p>
        )}
      </div>
    </div>
  )
}
