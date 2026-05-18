'use client'

import { Navbar } from '@/components/Navbar'
import { ContactForm } from '@/components/ContactForm'

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
          <p className="animate-rise-delay-1 font-marcellus text-base leading-relaxed opacity-75 max-w-[380px]">
            Interested in working together? Fill out some info and we will be in
            touch shortly.
            <br />
            We can&apos;t wait to hear from you!
          </p>
        </div>

        <div className="animate-rise-delay-2 pt-4">
          <ContactForm />
        </div>
      </main>

      <footer className="border-t border-dark-brown/15 px-12 py-12 max-lg:px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <p className="font-marcellus text-3xl mb-3">STR Cleaning Crew</p>
          </div>
          <div>
            <p className="font-marcellus text-base font-medium mb-2">Location</p>
            <p className="font-marcellus text-sm opacity-70">Irvine, CA</p>
          </div>
          <div>
            <p className="font-marcellus text-base font-medium mb-2">Contact</p>
            <p className="font-marcellus text-sm opacity-70">info@str-cleaningcrew.com</p>
            <p className="font-marcellus text-sm opacity-70">(949) 549-9459</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
