import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import { SITE } from '@/lib/site'

export const metadata = {
  title: 'Privacy Policy — STR Cleaning Crew',
  description: 'How STR Cleaning Crew collects, uses and protects your information, including phone numbers and text message consent.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 25, 2026">
      <p>
        This policy explains how STR Cleaning Crew (“we”, “us”) collects, uses and protects your information when you
        visit str-cleaningcrew.com, book a cleaning, or receive text messages from us.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Contact details you give us: name, phone number, email address, and the address of the property to be cleaned.</li>
        <li>Booking details: service, property size, preferred dates, access instructions, notes and photos you upload.</li>
        <li>Your text message choices: whether you agreed to marketing texts, to booking and service texts, or to neither, and when.</li>
        <li>Payment card details, which go directly to our payment processor, Stripe. We never see or store your full card number.</li>
        <li>Basic website data, such as which link or campaign brought you to our site.</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To quote, schedule and carry out your cleaning, and to contact you about it.</li>
        <li>To charge for services you booked, under the payment and cancellation policy you accept when booking.</li>
        <li>To send text messages only of the kinds you agreed to (see below).</li>
        <li>To improve our services and keep records required by law.</li>
      </ul>

      <h2>Text messages (SMS)</h2>
      <p>
        On our booking form you can choose, separately, to receive (1) marketing texts about special offers, discounts
        and promotions, and (2) non-marketing texts about booking confirmations, appointment reminders, schedule updates
        and service notifications. Both are optional, unchecked by default, and not required to book. We record each
        choice separately, with the date and time you made it.
      </p>
      <ul>
        <li>Message frequency varies. Message and data rates may apply.</li>
        <li>Reply <strong>STOP</strong> at any time to opt out. You will get one message confirming you are opted out, and no more.</li>
        <li>Reply <strong>HELP</strong> for help, or contact us at {SITE.phone} or {SITE.email}.</li>
        <li>Carriers are not liable for delayed or undelivered messages.</li>
      </ul>
      <p>
        <strong>
          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.
          Text messaging originator opt-in data and consent are not shared with any third parties.
        </strong>{' '}
        The only exception is the service providers that deliver our messages for us, who may use your number solely to
        do that.
      </p>

      <h2>Who we share information with</h2>
      <p>We do not sell your personal information. We share it only with service providers that help us run the business, and only as needed:</p>
      <ul>
        <li>Stripe, to process payments.</li>
        <li>Our website hosting, data storage and email providers.</li>
        <li>Our text messaging provider, to deliver texts you agreed to receive.</li>
        <li>Our cleaning team members, who see the booking details needed to do the job.</li>
      </ul>
      <p>We may also disclose information when required by law.</p>

      <h2>How we protect and keep your information</h2>
      <p>
        Your information is stored with providers that use industry-standard security, and access is limited to people who
        need it. We keep booking and payment records for as long as needed to provide our services and meet legal and
        tax requirements.
      </p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>Opt out of texts at any time by replying STOP.</li>
        <li>Ask us to see, correct or delete your information by emailing {SITE.email}.</li>
        <li>California residents have rights under the California Consumer Privacy Act, including to know, delete and correct personal information, and not to be discriminated against for using these rights.</li>
      </ul>

      <h2>Contact us</h2>
      <p>
        STR Cleaning Crew, Laguna Hills, California
        <br />
        Phone: <a href={SITE.phoneHref}>{SITE.phone}</a>
        <br />
        Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
      <p>
        See also our <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    </LegalPage>
  )
}
