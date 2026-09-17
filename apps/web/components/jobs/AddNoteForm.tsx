'use client'

import { useState } from 'react'

export interface JobNoteItem {
  id: string
  authorRole: string
  body: string
  createdAt?: string | null
}

export function AddNoteForm({ notes, onAdd }: {
  notes: JobNoteItem[]
  onAdd: (body: string) => Promise<void>
}) {
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!body.trim()) return
    setSaving(true)
    try {
      await onAdd(body)
      setBody('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {notes.length === 0 && <p className="font-marcellus text-sm opacity-35">No notes yet.</p>}
        {notes.map((n) => (
          <div key={n.id} className="rounded-xl border border-dark-brown/12 px-4 py-3">
            <p className="font-marcellus text-xs opacity-40 mb-1">{n.authorRole}</p>
            <p className="font-marcellus text-sm whitespace-pre-wrap">{n.body}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe any issues found…"
          rows={2}
          className="flex-1 font-marcellus text-sm bg-transparent border border-dark-brown/20 rounded-xl px-4 py-3 focus:outline-none focus:border-dark-brown resize-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !body.trim()}
          className="px-5 py-2 rounded-full bg-dark-brown text-stone font-marcellus text-sm disabled:opacity-50 cursor-pointer self-start"
        >
          Add note
        </button>
      </div>
    </div>
  )
}
