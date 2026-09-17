'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { UserAvatar } from '@/components/UserAvatar'

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Services',    href: '/services' },
  { label: 'Residential', href: '/residential' },
  { label: 'Portfolio',   href: '/portfolio' },
  { label: 'Contact',     href: '/contact' },
  { label: 'About',       href: '/about' },
]

const LIGHT_BG_PAGES = ['/about', '/contact', '/book', '/services', '/business', '/portfolio', '/residential', '/account']

function NavLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'relative pb-1 no-underline transition-opacity duration-[180ms]',
        active ? 'opacity-100' : 'opacity-[0.88] hover:opacity-100 focus-visible:opacity-100',
      ].join(' ')}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute bottom-0 left-0 right-0 h-px bg-current"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user])
  const [groups, setGroups] = useState<string[]>([])
  const lightBg = LIGHT_BG_PAGES.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (!user) {
      setGroups([])
      return
    }
    fetchAuthSession()
      .then((session) => {
        const g = session.tokens?.accessToken?.payload['cognito:groups']
        setGroups(Array.isArray(g) ? (g as string[]) : [])
      })
      .catch(() => setGroups([]))
  }, [user])

  // Admins can also access /worker, but /admin is the more useful link for them.
  const roleLink = groups.includes('Admins')
    ? { label: 'Admin', href: '/admin' }
    : groups.includes('Workers')
    ? { label: 'My Jobs', href: '/worker' }
    : user
    ? { label: 'My Account', href: '/account' }
    : null

  return (
    <header className={`flex justify-between items-center gap-6 px-12 py-7 max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-6 max-[980px]:py-[22px] ${lightBg ? 'text-dark-brown' : 'text-stone'}`}>
      <Link
        href="/"
        className="inline-flex w-[72px] max-sm:w-[58px]"
        aria-label="ST Cleaning Crew home"
      >
        <Image
          src="/images/logo.webp"
          alt="ST Cleaning Crew"
          width={72}
          height={72}
          className="w-full h-auto object-contain"
          style={{
            opacity: 0.88,
            filter: lightBg ? 'brightness(0) opacity(0.65)' : 'none',
          }}
          priority
        />
      </Link>

      <nav
        className="flex items-center gap-7 text-lg max-[980px]:w-full max-[980px]:flex-wrap max-[980px]:gap-x-[18px] max-[980px]:gap-y-3.5 max-[980px]:text-base"
        aria-label="Main navigation"
      >
        {NAV_LINKS.map(({ label, href }) => (
          <NavLink
            key={label}
            label={label}
            href={href}
            active={href === '/' ? pathname === '/' : pathname.startsWith(href)}
          />
        ))}

        {roleLink && (
          <NavLink
            label={roleLink.label}
            href={roleLink.href}
            active={pathname.startsWith(roleLink.href)}
          />
        )}

        {user && <UserAvatar size={32} />}
        {user && (
          <button
            onClick={signOut}
            className="pb-1 opacity-[0.88] hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-[180ms] cursor-pointer border-none bg-transparent p-0 font-marcellus"
          >
            Sign Out
          </button>
        )}
        <Link
          href="/book"
          className="max-[980px]:ml-0 ml-2 px-[30px] py-3.5 rounded-full bg-accent text-dark-brown opacity-100 no-underline"
        >
          Book Now!
        </Link>
      </nav>
    </header>
  )
}
