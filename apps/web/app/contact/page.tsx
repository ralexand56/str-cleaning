'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { ContactForm } from '@/components/ContactForm'
import { SITE } from '@/lib/site'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 px-12 py-16 max-w-[1400px] w-full mx-auto max-lg:px-6">
        <div className="pt-4">
          <h1 className="animate-rise font-marcellus text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] mb-8">
            Contact Us
          </h1>
          <div className="animate-rise-delay-1 flex flex-col gap-4 max-w-[400px]">
            <p className="font-marcellus text-base leading-relaxed opacity-75">
              The fastest way: see your price and book online in a few minutes.
            </p>
            <Link
              href="/book"
              className="w-fit px-8 py-3.5 rounded-full bg-dark-brown !text-stone !opacity-100 font-marcellus text-sm no-underline hover:!opacity-80 transition-opacity"
            >
              Get your price and book
            </Link>
            <p className="font-marcellus text-sm leading-relaxed opacity-60 pt-2">
              Have a question first? Send us a message below or call{' '}
              <a href={SITE.phoneHref} className="underline">{SITE.phone}</a>.
            </p>
          </div>
        </div>

        <div className="animate-rise-delay-2 pt-4">
          <ContactForm />
        </div>
      </main>

    </div>
  )
}
