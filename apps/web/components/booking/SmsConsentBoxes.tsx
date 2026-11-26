'use client'

import Link from 'next/link'
import { SMS_CONSENT, type SmsConsentRecord } from '@/lib/booking/smsConsent'

/** Two optional, unticked SMS consent boxes (A2P 10DLC). Neither is needed to book. */
export function SmsConsentBoxes({ value, onChange }: { value: SmsConsentRecord; onChange: (v: SmsConsentRecord) => void }) {
  const box = (key: 'marketing' | 'transactional') => (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={`sms_consent_${key}`}
        checked={value[key]}
        onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
        className="w-4 h-4 mt-1 flex-shrink-0"
      />
      <span className="font-marcellus text-sm leading-relaxed">
        <span className="block mb-1">{SMS_CONSENT[key].title} (optional)</span>
        <span className="opacity-70">{SMS_CONSENT[key].text}</span>
      </span>
    </label>
  )

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">Text message consent</legend>
      {box('marketing')}
      {box('transactional')}
      <p className="font-marcellus text-xs opacity-60 leading-relaxed">
        Both boxes are optional. You can book without agreeing to texts. See our{' '}
        <Link href="/privacy" className="underline text-dark-brown">Privacy Policy</Link> and{' '}
        <Link href="/terms" className="underline text-dark-brown">Terms &amp; Conditions</Link>.
      </p>
    </fieldset>
  )
}
