'use client'

import { useState } from 'react'

function inputClass() {
  return 'w-full border border-dark-brown/30 bg-transparent rounded px-3 py-3 font-marcellus text-sm text-dark-brown outline-none focus:border-dark-brown/70 transition-colors'
}

export function ServicesContactForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="font-marcellus text-base text-dark-brown opacity-80 pt-4">
        Thanks! We&apos;ll be in touch within 48 hours.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name row */}
      <div>
        <p className="font-marcellus text-xs text-dark-brown opacity-60 mb-2">
          Name
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-marcellus text-xs text-dark-brown opacity-50">
              First Name <span className="opacity-70">(required)</span>
            </label>
            <input type="text" required className={inputClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-marcellus text-xs text-dark-brown opacity-50">
              Last Name <span className="opacity-70">(required)</span>
            </label>
            <input type="text" required className={inputClass()} />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="font-marcellus text-xs text-dark-brown opacity-50">
          Email <span className="opacity-70">(required)</span>
        </label>
        <input type="email" required className={inputClass()} />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label className="font-marcellus text-xs text-dark-brown opacity-50">
          Phone <span className="opacity-70">(required)</span>
        </label>
        <input type="tel" required className={inputClass()} />
      </div>

      {/* Service type */}
      <div>
        <p className="font-marcellus text-xs text-dark-brown opacity-50 mb-2">
          What services are you interested in? <span className="opacity-70">(required)</span>
        </p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 font-marcellus text-sm text-dark-brown opacity-70 cursor-pointer">
            <input type="checkbox" name="service" value="str-cleaning" className="accent-dark-brown" />
            STR Cleaning
          </label>
        </div>
      </div>

      {/* Preferred start date */}
      <div className="flex flex-col gap-1">
        <label className="font-marcellus text-xs text-dark-brown opacity-50">
          Preferred Start Date <span className="opacity-70">(required)</span>
        </label>
        <input type="date" required className={inputClass()} />
      </div>

      {/* Project details */}
      <div className="flex flex-col gap-1">
        <label className="font-marcellus text-xs text-dark-brown opacity-50">
          Project Details <span className="opacity-70">(required)</span>
        </label>
        <textarea
          required
          rows={4}
          placeholder="Tell me about your project goals."
          className={inputClass() + ' resize-none'}
        />
      </div>

      <div>
        <button
          type="submit"
          className="px-9 py-3 rounded-full bg-dark-brown text-stone font-marcellus text-sm cursor-pointer border-none hover:opacity-80 transition-opacity"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
