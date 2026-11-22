'use client'

import { useEffect, useState, useTransition } from 'react'
import type { Schema } from '@/amplify/data/resource'
import { listJobs } from '@/app/actions/admin/listJobs'
import { listActiveWorkers } from '@/app/actions/admin/assignJob'
import { humanize } from '@/lib/format'
import { JobDetail } from './JobDetail'
import { QuoteBuilder } from './QuoteBuilder'
import { WorkersPanel } from './WorkersPanel'

type Job = Schema['Job']['type']
type Worker = Schema['Worker']['type']

const STATUS_FILTERS = ['All', 'NEW', 'CONTACTED', 'QUOTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as const

export function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false)
  const [showWorkers, setShowWorkers] = useState(false)
  const [, startTransition] = useTransition()

  function refresh() {
    startTransition(() => {
      listJobs(statusFilter === 'All' ? undefined : { status: statusFilter }).then(setJobs)
    })
  }

  useEffect(() => {
    refresh()
    listActiveWorkers().then(setWorkers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const selected = jobs.find((j) => j.id === selectedId) ?? null

  // A visitor who finishes booking leaves two jobs: the step-0 lead and the full request, which
  // records the lead's id. Hide leads that turned into a request.
  const finishedLeadIds = new Set(jobs.map((j) => intakeOf(j)?.leadJobId).filter(Boolean))
  const visibleJobs = jobs.filter((j) => !finishedLeadIds.has(j.id))

  // Where bookings came from (?src= on the landing link). Older jobs have no source saved.
  const sourceCounts = new Map<string, number>()
  for (const j of visibleJobs) {
    const src = intakeOf(j)?.source
    if (src) sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full border font-marcellus text-xs cursor-pointer transition-colors ${statusFilter === s ? 'border-dark-brown bg-dark-brown text-stone' : 'border-dark-brown/20 hover:border-dark-brown/50'}`}
            >
              {s === 'All' ? s : humanize(s)}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowWorkers((v) => !v)}
            className="px-5 py-2.5 rounded-full border border-dark-brown/30 font-marcellus text-sm cursor-pointer"
          >
            {showWorkers ? 'Hide workers' : 'Manage workers'}
          </button>
          <button
            type="button"
            onClick={() => setShowQuoteBuilder((v) => !v)}
            className="px-5 py-2.5 rounded-full border border-dark-brown/30 font-marcellus text-sm cursor-pointer"
          >
            {showQuoteBuilder ? 'Hide quote builder' : 'New manual quote'}
          </button>
        </div>
      </div>

      {sourceCounts.size > 0 && (
        <p className="font-marcellus text-xs opacity-60">
          Booking sources:{' '}
          {[...sourceCounts.entries()].sort((a, b) => b[1] - a[1]).map(([src, n]) => `${src} ${n}`).join(' · ')}
        </p>
      )}

      {showWorkers && <WorkersPanel />}
      {showQuoteBuilder && <QuoteBuilder onCreated={() => { setShowQuoteBuilder(false); refresh() }} />}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
          {visibleJobs.length === 0 && <p className="font-marcellus text-sm opacity-40">No jobs.</p>}
          {visibleJobs.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => setSelectedId(job.id)}
              className={`text-left px-5 py-4 rounded-xl border font-marcellus text-sm cursor-pointer transition-colors ${selectedId === job.id ? 'border-dark-brown bg-dark-brown/5' : 'border-dark-brown/15 hover:border-dark-brown/35'}`}
            >
              <div className="flex justify-between gap-2">
                <span>{job.firstName} {job.lastName}</span>
                <span className="opacity-40 text-xs">{humanize(job.status)}</span>
              </div>
              <p className="opacity-40 text-xs mt-1">
                {humanize(job.type)} · {job.propertySize ?? '—'}
                {intakeOf(job)?.source && <> · from {intakeOf(job)?.source}</>}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-dark-brown/12 p-6 min-h-[300px]">
          {selected ? (
            <JobDetail job={selected} workers={workers} onChanged={refresh} />
          ) : (
            <p className="font-marcellus text-sm opacity-40">Select a job to view details.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function intakeOf(job: { intake?: unknown }): { leadJobId?: string; source?: string } | null {
  const raw = job.intake
  if (!raw) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
  return raw as { leadJobId?: string; source?: string }
}
