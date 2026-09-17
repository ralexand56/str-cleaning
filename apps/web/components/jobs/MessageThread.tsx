'use client'

import { useState } from 'react'

export interface ThreadMessage {
  id: string
  senderType: 'ADMIN' | 'WORKER' | 'CUSTOMER' | 'SYSTEM'
  body: string
  createdAt?: string | null
  toEmail?: string | null
}

export function MessageThread({ messages, onSend, placeholder = 'Type a message…' }: {
  messages: ThreadMessage[]
  onSend: (body: string) => Promise<void>
  placeholder?: string
}) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    try {
      await onSend(body)
      setBody('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
        {messages.length === 0 && <p className="font-marcellus text-sm opacity-35">No messages yet.</p>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={[
              'rounded-xl border border-dark-brown/12 px-4 py-3 max-w-[85%]',
              m.senderType === 'ADMIN' ? 'self-end bg-dark-brown/5' : 'self-start bg-transparent',
            ].join(' ')}
          >
            <p className="font-marcellus text-xs opacity-40 mb-1">{m.senderType}</p>
            <p className="font-marcellus text-sm whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          className="flex-1 font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2 focus:outline-none focus:border-dark-brown"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className="px-5 py-2 rounded-full bg-dark-brown text-stone font-marcellus text-sm disabled:opacity-50 cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  )
}
