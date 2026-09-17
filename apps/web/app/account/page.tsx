import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { getCurrentUserSub } from '@/lib/authGroups'
import { claimCustomerAccount } from '@/app/actions/account/claimAccount'
import { getMyAccount } from '@/app/actions/account/getMyAccount'
import { AccountPanel } from './AccountPanel'

export const metadata = {
  title: 'My Account — STR Cleaning Crew',
}

export default async function AccountPage() {
  const sub = await getCurrentUserSub()
  if (!sub) redirect('/sign-in?next=/account')

  await claimCustomerAccount()
  const account = await getMyAccount()

  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>
      <main className="flex-1 max-w-[900px] w-full mx-auto px-5 py-12">
        <h1 className="font-marcellus text-4xl mb-10">My Account</h1>
        <AccountPanel
          jobs={account?.jobs ?? []}
          charges={account?.charges ?? []}
          hasCustomer={!!account?.customer}
        />
      </main>
    </div>
  )
}
