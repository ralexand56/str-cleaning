import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { PackagesAccordion } from '@/components/PackagesAccordion'

export const metadata = {
  title: 'Residential — STR Cleaning Crew',
  description: 'Explore our residential cleaning packages.',
}

const PACKAGE_CARDS = [
  {
    title: 'Regular Cleaning',
    src: '/images/unsplash-image-SqOMDOQb3ws.webp',
    alt: 'Regular cleaning',
    description:
      'Our Regular Cleaning is designed to maintain a consistently clean, polished, and guest-ready home. This service focuses on thorough surface cleaning, dust removal, floor care, and full kitchen and bathroom refreshes to keep your home looking tidy, comfortable, and well-used for between deeper cleans.',
    ideal: 'Ideal for routine upkeep and occupied or frequently used homes.',
  },
  {
    title: 'Deep Cleaning',
    src: '/images/unsplash-image-WnuDJlnuOhU.webp',
    alt: 'Deep cleaning',
    description:
      'Our Deep Cleaning goes beyond routine upkeep to target built-up dust, grime, and overlooked areas throughout the home. This service delivers a more intensive reset of kitchens, bathrooms, floors, and living spaces, making it ideal for first-time cleanings, seasonal refreshes, or homes that need extra attention before returning to a regular maintenance schedule.',
    ideal: '',
  },
  {
    title: 'Move-Out Cleaning (Empty Unit – Full Reset for Lease Return)',
    src: '/images/unsplash-image-Ddzir2TCR2g.webp',
    alt: 'Move-out cleaning',
    description:
      'Our Move-Out Cleaning is a comprehensive, top-to-bottom reset designed specifically for vacant units and lease return requirements. This service addresses every surface, interior appliance, and detail area to meet landlord and property management standards, helping ensure the home is left clean, compliant, and ready for final inspection or the next occupant.',
    ideal: '',
  },
  {
    title: 'Move-In Cleaning (Preparation & Sanitation for New Occupancy)',
    src: '/images/unsplash-image-VRpjDw3WqqI.webp',
    alt: 'Move-in cleaning',
    description:
      'Our Move-In Cleaning is a detailed sanitation service designed to prepare a home for new occupancy. It focuses on disinfecting high-touch surfaces, cleaning interior appliances, and ensuring every space is fresh, hygienic, and ready for everyday living — so you can move in with confidence and comfort from day one.',
    ideal: '',
  },
]

export default function ResidentialPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-dark-brown">
      <Navbar />

      {/* ── Hero ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 items-center px-10 py-16 max-lg:px-6 max-lg:py-12 gap-10 max-w-[1300px] mx-auto w-full">
        <div>
          <h1 className="font-marcellus text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.05] animate-rise">
            Explore Our<br />Residential Cleaning<br />Services
          </h1>
        </div>
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
          <Image
            src="/images/unsplash-image-PE4pFgcYzoQ.webp"
            alt="Bright modern living room"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
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
              Cleaning ✳ Deep Cleaning ✳ Move-In ✳ Move-Out ✳ Regular Cleaning
            </span>
          ))}
        </div>
      </div>

      {/* ── Our Packages ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 py-20 max-lg:px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-marcellus text-[clamp(2rem,4vw,3.2rem)]">Our Packages</h2>
          <Link
            href="/book?mode=residential"
            className="px-8 py-3 rounded-full border border-dark-brown/40 font-marcellus text-sm no-underline hover:bg-dark-brown hover:text-stone transition-colors"
          >
            Schedule a Cleaning
          </Link>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGE_CARDS.map((pkg) => (
            <div key={pkg.title} className="flex flex-col gap-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={pkg.src} alt={pkg.alt} fill className="object-cover" />
              </div>
              <h3 className="font-marcellus text-sm leading-snug">{pkg.title}</h3>
              <p className="font-marcellus text-xs opacity-60 leading-relaxed">{pkg.description}</p>
              {pkg.ideal && (
                <p className="font-marcellus text-xs opacity-50 italic leading-relaxed">{pkg.ideal}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Packages Details + sticky image ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pb-24 max-lg:px-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16">
        <div>
          <h2 className="font-marcellus text-[clamp(2rem,4vw,3.2rem)] mb-8">Packages&apos; Details</h2>
          <PackagesAccordion />
        </div>

        {/* Sticky image */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            {/* Underlay frame effect */}
            <div className="relative ml-6 mt-6">
              {/* Offset filled underlay — left and higher */}
              <div className="absolute bg-[#ECE4DA] rounded-sm" style={{ top: '-24px', left: '-24px', right: '24px', bottom: '24px' }} />
              {/* Image on top */}
              <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden">
                <Image
                  src="/images/unsplash-image-77La8Of1F9g.webp"
                  alt="Cleaning tools"
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
