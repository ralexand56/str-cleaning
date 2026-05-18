'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '@str-cleaning/assets/contactSchema'
import { submitContact } from '@/app/actions/contact'

function inputClass(hasError: boolean) {
  return [
    'border bg-transparent rounded px-3 py-3 font-marcellus text-sm text-dark-brown outline-none transition-colors w-full',
    hasError
      ? 'border-red-500 focus:border-red-500'
      : 'border-dark-brown/30 focus:border-dark-brown/70',
  ].join(' ')
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  async function onSubmit(data: ContactFormData) {
    setServerError(null)
    try {
      await submitContact(data)
      setSubmitted(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <p className="font-marcellus text-xl opacity-80 pt-8">
        Thanks! We&apos;ll be in touch soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <p className="font-marcellus text-sm mb-3 opacity-70">Name</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="font-marcellus text-xs opacity-60">
              First Name <span className="opacity-60">(required)</span>
            </label>
            <input id="firstName" type="text" {...register('firstName')} className={inputClass(!!errors.firstName)} />
            {errors.firstName && <p className="font-marcellus text-xs text-red-600 mt-0.5">{errors.firstName.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="font-marcellus text-xs opacity-60">
              Last Name <span className="opacity-60">(required)</span>
            </label>
            <input id="lastName" type="text" {...register('lastName')} className={inputClass(!!errors.lastName)} />
            {errors.lastName && <p className="font-marcellus text-xs text-red-600 mt-0.5">{errors.lastName.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-marcellus text-sm opacity-70">
          Email <span className="opacity-60 text-xs">(required)</span>
        </label>
        <input id="email" type="email" {...register('email')} className={inputClass(!!errors.email)} />
        {errors.email && <p className="font-marcellus text-xs text-red-600 mt-0.5">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="font-marcellus text-sm opacity-70">
          Message <span className="opacity-60 text-xs">(required)</span>
        </label>
        <textarea id="message" rows={5} {...register('message')} className={inputClass(!!errors.message) + ' resize-none'} />
        {errors.message && <p className="font-marcellus text-xs text-red-600 mt-0.5">{errors.message.message}</p>}
      </div>

      {serverError && <p className="font-marcellus text-sm text-red-600">{serverError}</p>}

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
  )
}
