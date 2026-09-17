import Link from 'next/link'
import { listMyJobs } from '@/app/actions/worker/myJobs'
import { humanize } from '@/lib/format'
import { UserAvatar } from '@/components/UserAvatar'

export default async function WorkerHomePage() {
  const jobs = await listMyJobs()

  const grouped = jobs.reduce<Record<string, typeof jobs>>((acc, job) => {
    const key = job.scheduledDate ?? 'Unscheduled'
    acc[key] = acc[key] ? [...acc[key], job] : [job]
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-stone text-dark-brown">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-10">
          <h1 className="font-marcellus text-4xl">My Jobs</h1>
          <div className="flex items-center gap-4">
            <UserAvatar size={36} />
            <Link href="/" className="font-marcellus text-sm opacity-40 hover:opacity-70 no-underline">← Home</Link>
          </div>
        </div>

        {Object.keys(grouped).length === 0 && (
          <p className="font-marcellus text-sm opacity-40">No jobs assigned yet.</p>
        )}

        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([date, dateJobs]) => (
            <div key={date}>
              <p className="font-marcellus text-xs opacity-40 uppercase tracking-wider mb-3">{date}</p>
              <div className="flex flex-col gap-2">
                {dateJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/worker/jobs/${job.id}`}
                    className="block px-5 py-4 rounded-xl border border-dark-brown/15 hover:border-dark-brown/35 no-underline text-dark-brown transition-colors"
                  >
                    <div className="flex justify-between font-marcellus text-sm">
                      <span>{job.address ?? `${job.firstName} ${job.lastName}`}</span>
                      <span className="opacity-40">{humanize(job.status)}</span>
                    </div>
                    <p className="font-marcellus text-xs opacity-40 mt-1">{humanize(job.type)} · {job.scheduledTimeWindow ?? 'No time set'}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
