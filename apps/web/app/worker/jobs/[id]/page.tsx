import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMyJob } from '@/app/actions/worker/myJobs'
import { humanize } from '@/lib/format'
import { WorkerJobPanel } from './WorkerJobPanel'

export default async function WorkerJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getMyJob(id)
  if (!job) notFound()

  return (
    <div className="min-h-screen bg-stone text-dark-brown">
      <div className="max-w-[700px] mx-auto px-6 py-12">
        <Link href="/worker" className="font-marcellus text-sm opacity-40 hover:opacity-70 no-underline">← My Jobs</Link>

        <div className="mt-6 mb-8">
          <h1 className="font-marcellus text-3xl">{humanize(job.type)}</h1>
          <p className="font-marcellus text-sm opacity-50 mt-1">{job.propertySize}</p>
          {job.address && <p className="font-marcellus text-sm opacity-50">{job.address}, {job.city}, {job.state} {job.zip}</p>}
          <p className="font-marcellus text-sm opacity-50 mt-1">{job.scheduledDate} · {job.scheduledTimeWindow}</p>
          {job.notes && <p className="font-marcellus text-sm opacity-40 mt-3">Customer notes: {job.notes}</p>}
        </div>

        <WorkerJobPanel jobId={job.id} />
      </div>
    </div>
  )
}
