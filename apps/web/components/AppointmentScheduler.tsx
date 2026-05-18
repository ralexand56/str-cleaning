'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scheduleAppointment } from '@/app/actions/scheduleAppointment'

// ─── Config ───────────────────────────────────────────────────────────────────

const SERVICES = [
  { name: 'Free Consultation', duration: '30 minutes', price: null },
  { name: 'Basic Service',     duration: '1 hour',     price: '$99.00' },
  { name: 'Advanced Service',  duration: '1 hour',     price: '$199.00' },
]

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDays(count = 7): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

function formatDay(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function shortDay(d: Date) {
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    month:   d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day:     d.getDate(),
  }
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

const inputCls = 'w-full bg-[#f5f4f2] border border-transparent rounded px-4 py-3 font-marcellus text-sm text-dark-brown outline-none focus:border-dark-brown/40 transition-colors placeholder:opacity-40'

// ─── Panel wrapper ────────────────────────────────────────────────────────────

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dark-brown/12 rounded-2xl overflow-hidden bg-white/80">
      {children}
    </div>
  )
}

function PanelHeader({ back, title, onBack }: { back?: string; title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-dark-brown/10">
      {back ? (
        <button onClick={onBack} className="font-marcellus text-xs opacity-50 hover:opacity-80 flex items-center gap-1 cursor-pointer bg-transparent border-none">
          ‹ {back}
        </button>
      ) : <span />}
      <span className="font-marcellus text-sm tracking-wide">{title}</span>
    </div>
  )
}

function AppointmentBadge({ service, date, time, onClear }: {
  service: typeof SERVICES[0]; date?: string; time?: string; onClear: () => void
}) {
  return (
    <div className="mx-6 mt-6 mb-2 border border-dark-brown/12 rounded-xl px-5 py-4 flex items-start justify-between">
      <div>
        <p className="font-marcellus text-sm">{service.name}</p>
        <p className="font-marcellus text-xs opacity-40 mt-0.5">
          {service.duration}{service.price ? ` @ ${service.price}` : ''}
        </p>
        {date && time && (
          <p className="font-marcellus text-xs opacity-40 mt-0.5">{date} at {time}</p>
        )}
      </div>
      <button onClick={onClear} className="opacity-30 hover:opacity-60 cursor-pointer bg-transparent border-none text-dark-brown text-lg leading-none">×</button>
    </div>
  )
}

// ─── Step 1: Select appointment ───────────────────────────────────────────────

function SelectStep({ onSelect }: { onSelect: (s: typeof SERVICES[0]) => void }) {
  return (
    <Panel>
      <PanelHeader title="Select Appointment" />
      <div className="px-6 py-4 mb-2">
        <p className="font-marcellus text-[10px] tracking-widest opacity-40 uppercase mb-4">Appointment</p>
        {SERVICES.map((svc, i) => (
          <div key={svc.name} className={`flex items-center justify-between py-5 ${i > 0 ? 'border-t border-dark-brown/8' : ''}`}>
            <div>
              <p className="font-marcellus text-sm">{svc.name}</p>
              <p className="font-marcellus text-xs opacity-40 mt-0.5">
                {svc.duration}{svc.price ? ` @ ${svc.price}` : ''}
              </p>
            </div>
            <button
              onClick={() => onSelect(svc)}
              className="px-5 py-2 bg-dark-brown text-stone font-marcellus text-[10px] tracking-widest uppercase rounded cursor-pointer border-none hover:opacity-80 transition-opacity"
            >
              Book
            </button>
          </div>
        ))}
      </div>
      <p className="font-marcellus text-[10px] opacity-25 text-center pb-5">Powered by STR Cleaning Crew</p>
    </Panel>
  )
}

// ─── Step 2: Date & Time ──────────────────────────────────────────────────────

function DateTimeStep({
  service, onBack, onNext,
}: {
  service: typeof SERVICES[0]
  onBack: () => void
  onNext: (date: string, time: string) => void
}) {
  const days = getDays(7)
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  const visibleDays = getDays(28).slice(weekOffset * 7, weekOffset * 7 + 7)

  return (
    <Panel>
      <PanelHeader back="Select Appointment" title="Date & Time" onBack={onBack} />
      <AppointmentBadge service={service} onClear={onBack} />

      <div className="px-6 py-5">
        <p className="font-marcellus text-[10px] tracking-widest opacity-40 uppercase mb-4">
          Time Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
        </p>

        {/* Day picker */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {visibleDays.map((d, i) => {
            const { weekday, month, day } = shortDay(d)
            const active = selectedDay === weekOffset * 7 + i
            return (
              <button
                key={i}
                onClick={() => { setSelectedDay(weekOffset * 7 + i); setSelectedTime(null) }}
                className={[
                  'flex flex-col items-center py-3 rounded-xl cursor-pointer border transition-all font-marcellus',
                  active
                    ? 'bg-dark-brown text-stone border-dark-brown'
                    : 'border-dark-brown/10 hover:border-dark-brown/30 text-dark-brown bg-transparent',
                ].join(' ')}
              >
                <span className="text-[9px] tracking-widest opacity-60">{weekday}</span>
                <span className="text-[9px] tracking-widest opacity-60">{month}</span>
                <span className="text-base mt-0.5">{day}</span>
              </button>
            )
          })}
        </div>

        {/* Week nav */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="font-marcellus text-xs opacity-40 hover:opacity-70 disabled:opacity-20 cursor-pointer bg-transparent border-none"
          >
            ← Prev
          </button>
          <button
            onClick={() => setWeekOffset(w => Math.min(3, w + 1))}
            disabled={weekOffset === 3}
            className="font-marcellus text-xs opacity-40 hover:opacity-70 disabled:opacity-20 cursor-pointer bg-transparent border-none"
          >
            Next →
          </button>
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={[
                'py-2.5 rounded-lg border font-marcellus text-xs cursor-pointer transition-all',
                selectedTime === t
                  ? 'bg-dark-brown text-stone border-dark-brown'
                  : 'border-dark-brown/15 hover:border-dark-brown/40 text-dark-brown bg-transparent',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (selectedTime) {
              const d = getDays(28)[selectedDay]
              onNext(formatDay(d), selectedTime)
            }
          }}
          disabled={!selectedTime}
          className="mt-8 w-full py-4 bg-dark-brown text-stone font-marcellus text-sm tracking-widest uppercase rounded-full cursor-pointer border-none transition-opacity hover:opacity-80 disabled:opacity-25 disabled:cursor-default"
        >
          Continue
        </button>
      </div>
      <p className="font-marcellus text-[10px] opacity-25 text-center pb-5">Powered by STR Cleaning Crew</p>
    </Panel>
  )
}

// ─── Step 3: Your Information ─────────────────────────────────────────────────

function InfoStep({
  service, date, time, onBack, onConfirm, submitting,
}: {
  service: typeof SERVICES[0]
  date: string
  time: string
  onBack: () => void
  onConfirm: (info: { firstName: string; lastName: string; phone: string; email: string }) => void
  submitting: boolean
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')

  const valid = firstName.trim() && lastName.trim() && email.trim()

  return (
    <Panel>
      <PanelHeader back="Date & Time" title="Your Information" onBack={onBack} />
      <AppointmentBadge service={service} date={date} time={time} onClear={() => onBack()} />

      <div className="px-6 py-6 flex flex-col gap-4">
        <p className="font-marcellus text-[10px] tracking-widest opacity-40 uppercase">Your Information</p>

        <div>
          <label className="font-marcellus text-xs opacity-50 block mb-1.5">First name *</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="font-marcellus text-xs opacity-50 block mb-1.5">Last name *</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="font-marcellus text-xs opacity-50 block mb-1.5">Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1" className={inputCls} />
        </div>
        <div>
          <label className="font-marcellus text-xs opacity-50 block mb-1.5">Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
        </div>

        <button
          onClick={() => valid && onConfirm({ firstName, lastName, phone, email })}
          disabled={!valid || submitting}
          className="mt-2 w-full py-4 bg-dark-brown text-stone font-marcellus text-sm tracking-widest uppercase rounded-full cursor-pointer border-none transition-opacity hover:opacity-80 disabled:opacity-25 disabled:cursor-default"
        >
          {submitting ? 'Confirming…' : 'Confirm Appointment'}
        </button>
      </div>
      <p className="font-marcellus text-[10px] opacity-25 text-center pb-5">Powered by STR Cleaning Crew</p>
    </Panel>
  )
}

// ─── Step 4: Confirmed ────────────────────────────────────────────────────────

function ConfirmedStep({ service, date, time, firstName }: {
  service: typeof SERVICES[0]; date: string; time: string; firstName: string
}) {
  return (
    <Panel>
      <div className="px-8 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-dark-brown/8 flex items-center justify-center mx-auto mb-6 text-dark-brown text-xl">✓</div>
        <h3 className="font-marcellus text-2xl mb-3">Appointment Confirmed</h3>
        <p className="font-marcellus text-sm opacity-50 leading-relaxed max-w-xs mx-auto">
          Thanks, {firstName}! Your <strong>{service.name}</strong> is scheduled for{' '}
          <strong>{date}</strong> at <strong>{time}</strong>. We'll be in touch shortly.
        </p>
      </div>
      <p className="font-marcellus text-[10px] opacity-25 text-center pb-6">Powered by STR Cleaning Crew</p>
    </Panel>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Step = 'select' | 'datetime' | 'info' | 'confirmed'

export function AppointmentScheduler() {
  const [step, setStep]       = useState<Step>('select')
  const [service, setService] = useState<typeof SERVICES[0] | null>(null)
  const [date, setDate]       = useState('')
  const [time, setTime]       = useState('')
  const [firstName, setFirstName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

  async function handleConfirm(info: { firstName: string; lastName: string; phone: string; email: string }) {
    if (!service) return
    setSubmitting(true)
    setError('')
    try {
      await scheduleAppointment({
        service:   service.name,
        duration:  service.duration,
        price:     service.price,
        date, time,
        ...info,
      })
      setFirstName(info.firstName)
      setStep('confirmed')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {step === 'select' && (
          <SelectStep onSelect={svc => { setService(svc); setStep('datetime') }} />
        )}
        {step === 'datetime' && service && (
          <DateTimeStep
            service={service}
            onBack={() => setStep('select')}
            onNext={(d, t) => { setDate(d); setTime(t); setStep('info') }}
          />
        )}
        {step === 'info' && service && (
          <>
            <InfoStep
              service={service}
              date={date}
              time={time}
              onBack={() => setStep('datetime')}
              onConfirm={handleConfirm}
              submitting={submitting}
            />
            {error && <p className="font-marcellus text-sm text-red-600 mt-3 text-center">{error}</p>}
          </>
        )}
        {step === 'confirmed' && service && (
          <ConfirmedStep service={service} date={date} time={time} firstName={firstName} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
