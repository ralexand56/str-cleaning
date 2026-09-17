'use client'

import { useState } from 'react'
import { postCustomerReply } from '@/app/actions/postCustomerReply'

export function ReplyForm({ token }: { token: string }) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await postCustomerReply(token, body)
      setBody('')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reply.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Type a reply…"
        rows={3}
        className="font-marcellus text-sm bg-transparent border border-dark-brown/20 rounded-xl px-4 py-3 w-full focus:outline-none focus:border-dark-brown transition-colors resize-none"
      />
      {error && <p className="font-marcellus text-sm text-red-600 opacity-80">{error}</p>}
      {sent && <p className="font-marcellus text-sm opacity-50">Sent.</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start px-8 py-3 rounded-full bg-dark-brown text-stone font-marcellus text-sm disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'Sending…' : 'Send reply'}
      </button>
    </form>
  )
}
