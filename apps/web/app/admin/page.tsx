import Link from 'next/link'
import { UserAvatar } from '@/components/UserAvatar'
import { JobsTab } from './JobsTab'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-stone text-dark-brown">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-marcellus text-4xl text-dark-brown">Admin</h1>
            <p className="font-marcellus text-dark-brown opacity-50 text-sm mt-2">STR Cleaning Crew</p>
          </div>
          <div className="flex items-center gap-4">
            <UserAvatar size={36} />
            <Link
              href="/"
              className="font-marcellus text-sm text-dark-brown opacity-40 hover:opacity-70 transition-opacity no-underline"
            >
              ← Home
            </Link>
          </div>
        </div>

        <JobsTab />
      </div>
    </div>
  )
}
