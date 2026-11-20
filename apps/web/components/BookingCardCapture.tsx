'use client'

import { useEffect, useState } from 'react'
import { loadStripe, type Stripe as StripeJs } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { createSetupIntent } from '@/app/actions/stripe/createSetupIntent'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
let stripePromise: Promise<StripeJs | null> | null = null
if (publishableKey) {
  stripePromise = loadStripe(publishableKey)
}

export type CardCaptureResult = {
  stripeCustomerId: string
  customerId: string
  stripePaymentMethodId: string
}

function CardForm({ ids, onSaved, onSkip }: {
  ids: { stripeCustomerId: string; customerId: string }
  onSaved: (r: CardCaptureResult) => void
  onSkip?: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!stripe || !elements) return
    setSubmitting(true)
    setError('')
    const { error: confirmError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    })
    if (confirmError) {
      setError(confirmError.message ?? 'Could not save card.')
      setSubmitting(false)
      return
    }
    const pmId = typeof setupIntent?.payment_method === 'string' ? setupIntent.payment_method : setupIntent?.payment_method?.id
    if (!pmId) {
      setError('Could not save card.')
      setSubmitting(false)
      return
    }
    onSaved({ ...ids, stripePaymentMethodId: pmId })
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="font-marcellus text-sm text-red-600 opacity-80">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="px-6 py-3 rounded-full bg-dark-brown text-stone font-marcellus text-sm disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Saving…' : 'Save card'}
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 rounded-full border border-dark-brown/20 font-marcellus text-sm cursor-pointer"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}

export function BookingCardCapture({ email, firstName, lastName, phone, onSaved, onSkip, onUnavailable }: {
  email: string
  firstName: string
  lastName: string
  phone: string
  onSaved: (r: CardCaptureResult) => void
  /** Omit to make the card required (no "Skip for now"). */
  onSkip?: () => void
  /** Called when the card form can't load (Stripe not configured or setup failed). */
  onUnavailable?: () => void
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [ids, setIds] = useState<{ stripeCustomerId: string; customerId: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email || !stripePromise) return
    let cancelled = false
    createSetupIntent({ email, firstName, lastName, phone })
      .then((r) => {
        if (cancelled) return
        setClientSecret(r.clientSecret)
        setIds({ stripeCustomerId: r.stripeCustomerId, customerId: r.customerId })
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not start card setup.')
        onUnavailable?.()
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  useEffect(() => {
    if (!stripePromise) onUnavailable?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If Stripe isn't configured, the caller decides how to proceed (onUnavailable).
  if (!stripePromise) return null
  if (error) return <p className="font-marcellus text-sm opacity-40">{error}</p>
  if (!clientSecret || !ids) return <p className="font-marcellus text-sm opacity-40">Loading card form…</p>

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardForm ids={ids} onSaved={onSaved} onSkip={onSkip} />
    </Elements>
  )
}
