import { notFound } from 'next/navigation'
import { verifyMessageToken } from '@/lib/messageLink'
import { publicDataClient } from '@/lib/data/publicClient'
import { ReplyForm } from './ReplyForm'

export default async function CustomerMessagePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const verified = verifyMessageToken(token)
  if (!verified) notFound()

  const { data: messages } = await publicDataClient.models.Message.list({
    filter: { jobId: { eq: verified.jobId } },
  })
  const sorted = [...messages].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))

  return (
    <div className="min-h-screen bg-stone text-dark-brown px-5 py-16">
      <div className="max-w-[560px] mx-auto flex flex-col gap-8">
        <h1 className="font-marcellus text-3xl">Your conversation with STR Cleaning Crew</h1>

        <div className="flex flex-col gap-4">
          {sorted.filter((m) => m.senderType !== 'WORKER').map((m) => (
            <div
              key={m.id}
              className={[
                'rounded-2xl border border-dark-brown/12 px-5 py-4 max-w-[85%]',
                m.senderType === 'CUSTOMER' ? 'self-end bg-dark-brown/5' : 'self-start bg-white/40',
              ].join(' ')}
            >
              <p className="font-marcellus text-xs opacity-40 mb-1">{m.senderType === 'CUSTOMER' ? 'You' : 'STR Cleaning Crew'}</p>
              <p className="font-marcellus text-sm whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="font-marcellus text-sm opacity-40">No messages yet.</p>
          )}
        </div>

        <ReplyForm token={token} />
      </div>
    </div>
  )
}
