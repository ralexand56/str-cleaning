import { getContacts } from '@/app/actions/getContacts'
import { ContactsTab } from './ContactsTab'

const TABS = ['Contacts'] as const
type Tab = typeof TABS[number]

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab: Tab = (TABS as readonly string[]).includes(tab ?? '') ? (tab as Tab) : 'Contacts'

  const contacts = activeTab === 'Contacts' ? await getContacts() : []

  return (
    <div className="min-h-screen bg-stone text-dark-brown">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-marcellus text-4xl text-dark-brown">Admin</h1>
          <p className="font-marcellus text-dark-brown opacity-50 text-sm mt-2">STR Cleaning Crew</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-dark-brown/15 mb-8">
          {TABS.map((t) => (
            <a
              key={t}
              href={`/admin?tab=${t}`}
              className={[
                'font-marcellus text-sm px-5 py-3 border-b-2 transition-colors -mb-px',
                activeTab === t
                  ? 'border-dark-brown text-dark-brown'
                  : 'border-transparent text-dark-brown opacity-40 hover:opacity-70',
              ].join(' ')}
            >
              {t}
            </a>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Contacts' && <ContactsTab contacts={contacts} />}
      </div>
    </div>
  )
}
