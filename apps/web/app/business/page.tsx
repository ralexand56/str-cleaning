import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { BusinessAccordion } from '@/components/BusinessAccordion'

export const metadata = {
  title: 'Business — STR Cleaning Crew',
  description: 'Explore our business and short-term rental cleaning packages.',
}

const PACKAGE_CARDS = [
  {
    title: 'Startup Cleaning',
    src: '/images/unsplash-image-5TXz228u4eo.webp',
    alt: 'Startup cleaning',
    description:
      'Our Startup Cleaning sets the foundation for a well-organised, guest-ready property. This service establishes clear standards, organises essential spaces, and documents host preferences to ensure consistent cleaning, staging, and presentation from the very first turnover.',
  },
  {
    title: 'Standard STR Cleaning (Short-Term Rental Turnover Service)',
    src: '/images/unsplash-image-Y1JjwhHaPRM.webp',
    alt: 'Standard STR cleaning',
    description:
      'The Standard STR Cleaning is a full turnover service designed specifically for short-term rental properties. Every room is inspected, cleaned, restocked, and styled according to host standards so the property is consistently guest-ready, welcoming, and prepared for five-star guest experiences.',
  },
  {
    title: 'Deep Cleaning',
    src: '/images/unsplash-image-3WubpUuF4jM.webp',
    alt: 'Deep cleaning',
    description:
      'Our Deep Cleaning targets built-up grime and overlooked detail areas that go beyond routine or turnover cleaning. This service focuses on interiors, appliances, fixtures, and hard-to-reach surfaces to restore the home to a noticeably higher standard — ideal for seasonal resets, first-time service, or properties that need extra attention.',
  },
  {
    title: 'Emergency Kit (Products & Package Options)',
    src: '/images/unsplash-image-o-QHS4pQWtY.webp',
    alt: 'Emergency kit',
    description:
      'Our Emergency Kit provides essential backup items to quickly resolve unexpected guest needs or supply shortages. Designed for short-term rentals, this kit helps hosts maintain comfort, convenience, and five-star service without disruption during a stay.',
  },
  {
    title: 'Seasonal Cleaning',
    src: '/images/unsplash-image-BCNjBsK37XA.webp',
    alt: 'Seasonal cleaning',
    description:
      'Our Seasonal Cleaning is a comprehensive, preventative service designed to refresh, protect, and maintain your property during key times of the year. It addresses deep cleaning needs, system checks, and minor maintenance items to help extend the life of furnishings, prevent issues, and keep the home guest-ready at a higher standard beyond routine turnovers.',
    note: '(Includes all Deep Cleaning services + seasonal and preventive maintenance)',
  },
  {
    title: 'Emergency Response & Restorative Services',
    src: '/images/7G2A8613.webp',
    alt: 'Emergency response',
    description:
      'Our Emergency Response service provides rapid, on-the-ground support when unexpected issues arise. We coordinate inspections, communication, contractors, and urgent replacements to stabilise the situation quickly and protect your property, guests, and revenue with minimal disruption.',
  },
]

export default function BusinessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-dark-brown">
      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 py-16 max-lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <h1 className="font-marcellus text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.05] animate-rise">
          Discover Our<br />Business Cleaning<br />Services
        </h1>
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
          <Image
            src="/images/unsplash-image-w-ARisGf_Kw.webp"
            alt="Stay Awhile shelf"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* ── Scrolling marquee ── */}
      <div className="bg-muted py-4 overflow-hidden border-y border-dark-brown/10">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'marquee 32s linear infinite' }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="font-marcellus text-dark-brown text-base mr-12 flex-shrink-0">
              Cleaning ✳ STR Cleaning ✳ Deep Cleaning ✳ Emergency ✳ Seasonal
            </span>
          ))}
        </div>
      </div>

      {/* ── Our Packages ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 py-20 max-lg:px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-marcellus text-[clamp(2rem,4vw,3.2rem)]">Our Packages</h2>
          <Link
            href="/book"
            className="px-8 py-3 rounded-full border border-dark-brown/40 font-marcellus text-sm no-underline hover:bg-dark-brown hover:text-stone transition-colors"
          >
            Schedule a Cleaning
          </Link>
        </div>

        {/* Top row — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {PACKAGE_CARDS.slice(0, 4).map((pkg) => (
            <div key={pkg.title} className="flex flex-col gap-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={pkg.src} alt={pkg.alt} fill className="object-cover" />
              </div>
              <h3 className="font-marcellus text-sm leading-snug">{pkg.title}</h3>
              <p className="font-marcellus text-xs opacity-60 leading-relaxed">{pkg.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom row — 2 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PACKAGE_CARDS.slice(4).map((pkg) => (
            <div key={pkg.title} className="flex flex-col gap-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image src={pkg.src} alt={pkg.alt} fill className="object-cover" />
              </div>
              <h3 className="font-marcellus text-sm leading-snug">{pkg.title}</h3>
              {'note' in pkg && pkg.note && (
                <p className="font-marcellus text-xs opacity-50 italic">{pkg.note}</p>
              )}
              <p className="font-marcellus text-xs opacity-60 leading-relaxed">{pkg.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Package Details + sticky image ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pb-24 max-lg:px-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16">
        <div>
          <h2 className="font-marcellus text-[clamp(2rem,4vw,3.2rem)] mb-8">Package&apos;s Details</h2>
          <BusinessAccordion />
        </div>

        {/* Sticky image */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="relative ml-6 mt-6">
              <div className="absolute bg-[#ECE4DA] rounded-sm" style={{ top: '-24px', left: '-24px', right: '24px', bottom: '24px' }} />
              <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden">
                <Image
                  src="/images/unsplash-image-tmw-sC48Rb8.webp"
                  alt="Cleaning detail"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
