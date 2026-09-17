import { redirect } from 'next/navigation'
import { getGroupsFromServerComponent } from '@/lib/authGroups'

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const groups = await getGroupsFromServerComponent()
  if (!groups.includes('Workers') && !groups.includes('Admins')) {
    redirect('/sign-in?next=/worker')
  }

  return <>{children}</>
}
