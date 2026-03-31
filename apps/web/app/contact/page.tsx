'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '@str-cleaning/assets/contactSchema'
import { submitContact } from '@/app/actions/contact'
import { Navbar } from '@/components/Navbar'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormData) {
    setServerError(null)
    try {
      await submitContact(data)
      setSubmitted(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  const inputClass = (hasError: boolean) =>
    [
      'border bg-transparent rounded px-3 py-3 font-marcellus text-sm text-dark-brown outline-none transition-colors w-full',
      hasError
        ? 'border-red-500 focus:border-red-500'
        : 'border-dark-brown/30 focus:border-dark-brown/70',
    ].join(' ')

  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 px-12 py-16 max-w-[1400px] w-full mx-auto max-lg:px-6">
        {/* Left */}
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

        {/* Right — form */}
        <div className="animate-rise-delay-2 pt-4">
          {submitted ? (
            <p className="font-marcellus text-xl opacity-80 pt-8">
              Thanks! We&apos;ll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Name row */}
              <div>
                <p className="font-marcellus text-sm mb-3 opacity-70">Name</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="firstName" className="font-marcellus text-xs opacity-60">
                      First Name <span className="opacity-60">(required)</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className={inputClass(!!errors.firstName)}
                    />
                    {errors.firstName && (
                      <p className="font-marcellus text-xs text-red-600 mt-0.5">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="lastName" className="font-marcellus text-xs opacity-60">
                      Last Name <span className="opacity-60">(required)</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className={inputClass(!!errors.lastName)}
                    />
                    {errors.lastName && (
                      <p className="font-marcellus text-xs text-red-600 mt-0.5">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-marcellus text-sm opacity-70">
                  Email <span className="opacity-60 text-xs">(required)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={inputClass(!!errors.email)}
                />
                {errors.email && (
                  <p className="font-marcellus text-xs text-red-600 mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="font-marcellus text-sm opacity-70">
                  Message <span className="opacity-60 text-xs">(required)</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register('message')}
                  className={inputClass(!!errors.message) + ' resize-none'}
                />
                {errors.message && (
                  <p className="font-marcellus text-xs text-red-600 mt-0.5">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="font-marcellus text-sm text-red-600">{serverError}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-9 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-base cursor-pointer border-none transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          )}
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
