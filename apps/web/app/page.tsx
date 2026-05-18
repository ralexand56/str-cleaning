import Image from 'next/image'
import Link from 'next/link'
import { HeroSection } from '@/components/HeroSection'
import { ContactForm } from '@/components/ContactForm'
import { AppointmentScheduler } from '@/components/AppointmentScheduler'

const SOCIAL_IMAGES = [
  { src: '/images/imgg-od3-579qcx59.webp', alt: 'Mop' },
  { src: '/images/imgg-od3-5k5b5qrm.webp', alt: 'Cleaning supplies' },
  { src: '/images/imgg-od3-0foqj0o1.webp', alt: 'Kitchen counter' },
  { src: '/images/imgg-od3-_2zi79y5.webp', alt: 'Rubber gloves' },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Company Ethos ── */}
      <section className="bg-stone text-dark-brown grid grid-cols-1 lg:grid-cols-2">
        <div className="relative aspect-[3/4]">
          <Image
            src="/images/7G2A8406.webp"
            alt="Founder of STR Cleaning Crew"
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="flex flex-col justify-center px-12 py-20 max-lg:px-8 max-lg:py-14">
          <h2 className="font-marcellus text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.08] mb-8">
            Our<br />company ethos
          </h2>
          <p className="font-marcellus text-base leading-relaxed opacity-70 max-w-[420px] mb-10">
            Founded on a legacy of impeccable standards, our cleaning services embody
            an unparalleled commitment to excellence. We cater to discerning clients
            who appreciate the art of a truly pristine environment.
          </p>
          <Link
            href="/about"
            className="inline-block self-start px-10 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-base no-underline transition-opacity hover:opacity-75"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* ── Services Marquee ── */}
      <section className="relative bg-stone overflow-hidden">
        <div className="relative h-[1100px]">
          <Image
            src="/images/unsplash-image-kF3KNcoXQXY.jpg"
            alt="Clean kitchen"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        {/* Scrolling label */}
        <div className="bg-[rgba(200,179,154,0.95)] py-7 overflow-hidden">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: 'marquee 28s linear infinite' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="font-marcellus text-[clamp(1.6rem,3.5vw,2.4rem)] text-dark-brown mr-16 flex-shrink-0">
                Our Services
              </span>
            ))}
          </div>
        </div>
        {/* Button centred over the entire section */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Link
            href="/services"
            className="inline-block px-40 py-4 rounded-full bg-accent text-dark-brown font-marcellus text-sm no-underline tracking-widest uppercase hover:opacity-80 transition-opacity"
          >
            View Here
          </Link>
        </div>
      </section>

      {/* ── Reserve an Appointment ── */}
      <section className="bg-stone text-dark-brown">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="flex flex-col justify-center px-12 py-20 max-lg:px-8 max-lg:py-14">
          <h2 className="font-marcellus text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.1] mb-6">
            Reserve an<br />appointment
          </h2>
          <p className="font-marcellus text-base leading-relaxed opacity-70 max-w-[400px] mb-10">
            Experience the epitome of cleanliness by scheduling your appointment
            with us, where each service is tailored to evoke a sense of
            sophistication and tranquility in your home. With unparalleled
            dedication to detail, we transform spaces into exquisite sanctuaries
            of refinement.
          </p>
          <div className="relative aspect-[4/3] max-w-[340px] rounded-2xl overflow-hidden">
            <Image
              src="/images/7G2A8931.webp"
              alt="Cleaner at work"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Booking widget panel */}
        <div className="flex flex-col justify-center px-12 py-20 max-lg:px-8 max-lg:py-14">
          <AppointmentScheduler />
        </div>
        </div>
      </section>

      {/* ── Follow us on social ── */}
      <section className="bg-stone text-dark-brown py-16 px-8">
        <h2 className="font-marcellus text-center text-[clamp(1.4rem,3vw,2rem)] mb-10">
          Follow us on social
        </h2>
        <div className="grid grid-cols-4 gap-3 max-w-[900px] mx-auto max-sm:grid-cols-2">
          {SOCIAL_IMAGES.map(({ src, alt }) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-md">
              <Image src={src} alt={alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="#"
            className="px-10 py-4 rounded-full bg-dark-brown text-stone font-marcellus text-base no-underline hover:opacity-75 transition-opacity"
          >
            Social
          </Link>
        </div>
      </section>

      {/* ── Contact Us ── */}
      <section className="bg-stone text-dark-brown grid grid-cols-1 lg:grid-cols-2 gap-16 px-12 py-20 max-lg:px-8 max-lg:py-14">
        <div>
          <h2 className="font-marcellus text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] mb-6">
            Contact Us
          </h2>
          <p className="font-marcellus text-base leading-relaxed opacity-75 max-w-[380px]">
            Interested in working together? Fill out some info and we will be in
            touch shortly. We can&apos;t wait to hear from you!
          </p>
        </div>
        <div>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
