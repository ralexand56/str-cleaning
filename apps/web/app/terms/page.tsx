import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import { SITE } from '@/lib/site'
import { CARD_POLICY } from '@/lib/pricing/prices'

export const metadata = {
  title: 'Terms & Conditions — STR Cleaning Crew',
  description: 'Terms for booking cleaning services and receiving text messages from STR Cleaning Crew.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="November 25, 2026">
      <p>
        These terms apply when you use str-cleaningcrew.com, book a service with STR Cleaning Crew, or receive text
        messages from us. By booking, you agree to them.
      </p>

      <h2>Bookings and pricing</h2>
      <ul>
        <li>Prices shown on the website are estimates based on what you tell us. We confirm your final price and time before the booking is set.</li>
        <li>Nothing is booked until we confirm it with you.</li>
        <li>Please give accurate details about the property and access, so our team can do the job safely and on time.</li>
      </ul>

      <h2>Payment and cancellation</h2>
      <ul>
        {CARD_POLICY.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2>SMS / text message terms</h2>
      <p>
        STR Cleaning Crew offers two optional text message programs. You choose them separately on our booking form, and
        neither is required to book a service:
      </p>
      <ul>
        <li>
          <strong>Marketing / promotional messages:</strong> special offers, discounts and cleaning service promotions.
        </li>
        <li>
          <strong>Informational / transactional messages:</strong> booking confirmations, appointment reminders, schedule
          updates and service notifications.
        </li>
      </ul>
      <ul>
        <li>Message frequency varies. Message and data rates may apply.</li>
        <li>To stop receiving texts, reply <strong>STOP</strong> to any message. You will receive one confirmation and no further messages. To join again, reply START or tick the box again on our booking form.</li>
        <li>For help, reply <strong>HELP</strong> or contact us at {SITE.phone} or {SITE.email}.</li>
        <li>Carriers are not liable for delayed or undelivered messages.</li>
        <li>
          We handle your phone number and consent as described in our <Link href="/privacy">Privacy Policy</Link>. No
          mobile information is shared with third parties or affiliates for marketing or promotional purposes.
        </li>
      </ul>

      <h2>Products and re-clean promise</h2>
      <ul>
        <li>By default we clean with our own professional products. If we use your products at your request, we can’t guarantee the cleaning result.</li>
        <li>If something on the checklist was missed, tell us within 24 hours with photos and we come back to fix it at no charge.</li>
      </ul>

      <h2>Changes to these terms</h2>
      <p>We may update these terms from time to time. The date at the top shows the latest version.</p>

      <h2>Contact us</h2>
      <p>
        STR Cleaning Crew, Irvine, California
        <br />
        Phone: <a href={SITE.phoneHref}>{SITE.phone}</a>
        <br />
        Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
    </LegalPage>
  )
}
