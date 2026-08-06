import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { TestimonialCarousel } from '@/components/TestimonialCarousel'
import { ServicesContactForm } from '@/components/ServicesContactForm'

export const metadata = {
  title: 'Services — STR Cleaning Crew',
  description: 'Tailored cleaning packages for short-term rental properties.',
}

const VALUES = [
  {
    title: 'Trust',
    body: 'Everything we do is built around trust and helping you have peace of mind because when you feel good at home, so do we.',
    image: null,
  },
  {
    title: 'Excellence',
    body: 'We hold ourselves to high standards. We focus on efficiency and professionalism.',
    image: '/images/unsplash-image-bt0it9pozXM.webp',
  },
  {
    title: 'Reliability',
    body: 'We follow through, meet deadlines, and consistency is part of our promise.',
    image: null,
  },
  {
    title: 'Accountability',
    body: 'We take responsibility for the complete turnover or cleaning process.',
    image: null,
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-dark-brown">
      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pt-16 pb-10 max-lg:px-6">
        {/* Full-width heading */}
        <h1 className="font-marcellus text-[clamp(4rem,10vw,9rem)] leading-[1.0] animate-rise mb-16">
          What We Offer
        </h1>

        {/* Two-column: text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
          <div className="flex flex-col gap-6">
            <p className="font-marcellus text-sm text-dark-brown opacity-70 leading-relaxed max-w-[420px]">
              We specialize exclusively in short-term rental property care — from routine turnovers to deep cleans, seasonal maintenance, and emergency response. Every package is built around the unique demands of STR hosting.
            </p>
            <div className="w-40 h-px bg-dark-brown/30" />
          </div>
          <div className="flex justify-end">
            <div className="relative w-[340px] h-[380px] max-lg:w-full max-lg:h-[280px] rounded-xl overflow-hidden">
              <Image
                src="/images/7G2A8878.webp"
                alt="Cleaner by pool"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Packages ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pb-16 max-lg:px-6">
        <h2 className="font-marcellus text-[clamp(1.6rem,3vw,2.4rem)] mb-8">Our Packages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* STR / Business */}
          <div className="border border-dark-brown/15 rounded-xl overflow-hidden flex flex-col">
            <div className="relative aspect-[4/3]">
              <Image
                src="/images/unsplash-image-5TXz228u4eo.webp"
                alt="STR cleaning"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 flex flex-col gap-4 flex-1">
              <h3 className="font-marcellus text-lg">STR Cleaning Packages</h3>
              <Link
                href="/business"
                className="self-start px-6 py-2.5 rounded-full border border-dark-brown/40 font-marcellus text-sm no-underline text-dark-brown hover:bg-dark-brown hover:text-stone transition-colors"
              >
                View packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Sets Us Apart ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 py-16 max-lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="font-marcellus text-[clamp(1.8rem,3.5vw,2.8rem)] leading-snug">
            What Sets Us Apart
          </h2>
        </div>
        <div>
          <p className="font-marcellus text-sm text-dark-brown opacity-70 leading-relaxed">
            STR Cleaning Crew began with a simple idea: cleaning alone isn&apos;t enough. Property owners need consistency, oversight, and peace of mind. What started as a short-term turnover service quickly evolved into a full property care system grounded in European standards, attention to detail, and professional accountability. We serve as caretakers — not just cleaners — ensuring every property is prepared, protected, and perfectly ready for its next guest, showing, or moment of living. We create order so clients rest at ease.
          </p>
        </div>
      </section>

      {/* ── Values grid ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pb-16 max-lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="border border-dark-brown/15 rounded-xl overflow-hidden flex flex-col min-h-[220px]"
            >
              {v.image ? (
                <div className="relative flex-1 min-h-[160px]">
                  <Image src={v.image} alt={v.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-marcellus text-base text-stone font-semibold">{v.title}</p>
                    <p className="font-marcellus text-xs text-stone/80 leading-relaxed mt-1">{v.body}</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <p className="font-marcellus text-base text-dark-brown">{v.title}</p>
                  <p className="font-marcellus text-xs text-dark-brown opacity-60 leading-relaxed">{v.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Full-width image break ── */}
      <div className="relative w-full h-[420px] max-lg:h-[280px]">
        <Image
          src="/images/unsplash-image-ulh3-dLSXjI.webp"
          alt="Styled home interior"
          fill
          className="object-cover"
        />
      </div>

      {/* ── Testimonials ── */}
      <section className="bg-[#F6F3EC] px-10 py-20 max-lg:px-6">
        <div className="max-w-[1300px] mx-auto">
          <TestimonialCarousel />
        </div>
      </section>

      {/* ── Let's Work Together ── */}
      <section className="bg-[#ECE4DA] px-10 py-20 max-lg:px-6">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16">
          <div>
            <h2 className="font-marcellus text-[clamp(2rem,4vw,3.2rem)] leading-snug mb-4">
              Let&apos;s Work Together
            </h2>
            <p className="font-marcellus text-sm text-dark-brown opacity-70 leading-relaxed">
              If you&apos;re interested in working with us, complete the form with a few details about your project. We&apos;ll review your message and get back to you within 48 hours.
            </p>
          </div>
          <div>
            <ServicesContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
