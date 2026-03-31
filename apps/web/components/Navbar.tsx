'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthenticator } from '@aws-amplify/ui-react'

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Services',    href: '/services' },
  { label: 'Business',    href: '/business' },
  { label: 'Residential', href: '/residential' },
  { label: 'Portfolio',   href: '/portfolio' },
  { label: 'Contact',     href: '/contact' },
  { label: 'About',       href: '/about' },
]

const LIGHT_BG_PAGES = ['/about', '/contact']

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user])
  const lightBg = LIGHT_BG_PAGES.some((p) => pathname.startsWith(p))

  return (
    <header className="flex justify-between items-center gap-6 px-12 py-7 max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-6 max-[980px]:py-[22px]">
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
        {NAV_LINKS.map(({ label, href }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={label}
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
        })}

        {user ? (
          <button
            onClick={signOut}
            className="max-[980px]:ml-0 ml-2 px-[30px] py-3.5 rounded-full bg-accent text-dark-brown opacity-100 cursor-pointer border-none font-marcellus text-lg"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/sign-in"
            className="max-[980px]:ml-0 ml-2 px-[30px] py-3.5 rounded-full bg-accent text-dark-brown opacity-100 no-underline"
          >
            Book Now!
          </Link>
        )}
      </nav>
    </header>
  )
}
