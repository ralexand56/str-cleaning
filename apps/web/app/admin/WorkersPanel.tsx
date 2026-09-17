'use client'

import { useEffect, useState } from 'react'
import type { Schema } from '@/amplify/data/resource'
import { createWorker } from '@/app/actions/admin/createWorker'
import { listWorkers, setWorkerActive } from '@/app/actions/admin/listWorkers'

type Worker = Schema['Worker']['type']

export function WorkersPanel() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function refresh() {
    listWorkers().then(setWorkers)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate() {
    if (!firstName || !lastName || !email) return
    setSubmitting(true)
    setError('')
    try {
      await createWorker({ firstName, lastName, email, phone: phone || undefined })
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create worker')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(worker: Worker) {
    await setWorkerActive(worker.id, !worker.active)
    refresh()
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-dark-brown/12 p-6">
      <p className="font-marcellus text-lg">Workers</p>

      <div className="flex flex-col gap-2">
        {workers.length === 0 && <p className="font-marcellus text-sm opacity-40">No workers yet.</p>}
        {workers.map((w) => (
          <div key={w.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-dark-brown/12">
            <div>
              <p className="font-marcellus text-sm">{w.firstName} {w.lastName}</p>
              <p className="font-marcellus text-xs opacity-40">{w.email}{w.phone ? ` · ${w.phone}` : ''}</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleActive(w)}
              className={`px-4 py-1.5 rounded-full border font-marcellus text-xs cursor-pointer transition-colors ${w.active ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50'}`}
            >
              {w.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="font-marcellus text-sm bg-transparent border-b border-dark-brown/25 pb-2" />
      </div>

      {error && <p className="font-marcellus text-sm text-red-600 opacity-80">{error}</p>}

      <button
        type="button"
        onClick={handleCreate}
        disabled={submitting || !firstName || !lastName || !email}
        className="self-start px-8 py-3 rounded-full bg-accent text-dark-brown font-marcellus text-sm disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'Creating…' : 'Create worker'}
      </button>
      <p className="font-marcellus text-xs opacity-35">
        This creates a login for the worker and adds them to the Workers group. Cognito emails them a temporary
        password; they'll be prompted to set a new one the first time they sign in at /sign-in.
      </p>
    </div>
  )
}
