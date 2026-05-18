import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export const metadata = {
  title: 'Laguna Hills Project — STR Cleaning Crew',
}

const IMAGES = [
  { src: '/images/IMG_2445.webp',  alt: 'Hero' },
  { src: '/images/IMG_2440.webp',  alt: 'Living room' },
  { src: '/images/IMG_2093.webp',  alt: 'Blue chairs and TV' },
  { src: '/images/IMG_2101.webp',  alt: 'Dining room' },
  { src: '/images/IMG_2452.webp',  alt: 'Kitchen full view' },
  { src: '/images/IMG_2453.webp',  alt: 'Kitchen counter' },
  { src: '/images/IMG_2069.webp',  alt: 'Kitchen cabinet' },
  { src: '/images/IMG_2457.webp',  alt: 'Master bedroom' },
  { src: '/images/IMG_2092.webp',  alt: 'Kids room' },
  { src: '/images/IMG_2446.webp',  alt: 'Bathroom' },
  { src: '/images/IMG_2088.webp',  alt: 'Patio' },
]

export default function LagunaHillsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-dark-brown">
      <Navbar />

      {/* Hero image with overlay text */}
      <div className="relative w-full h-[60vh] max-lg:h-[40vh]">
        <Image
          src="/images/IMG_2445.webp"
          alt="Laguna Hills living room"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-6 left-10 max-lg:left-6">
          <p className="font-marcellus text-stone/80 text-sm mb-1">Laguna Hills, CA</p>
          <h1 className="font-marcellus text-stone text-[clamp(1.8rem,4vw,3rem)] leading-tight">
            Airbnb Turn Over – Deep Cleaning + Maintenance
          </h1>
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-[1300px] mx-auto w-full px-10 py-16 max-lg:px-6">
        <div className="grid grid-cols-2 gap-3">
          {IMAGES.slice(1).map((img) => (
            <div key={img.src} className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image src={img.src} alt={img.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Prev / Next */}
      <div className="max-w-[1300px] mx-auto w-full px-10 pb-16 max-lg:px-6 flex justify-between">
        <Link
          href="/portfolio/rancho-mission-viejo"
          className="font-marcellus text-[clamp(1rem,2vw,1.4rem)] text-dark-brown opacity-70 hover:opacity-100 no-underline flex items-center gap-2"
        >
          ← Rancho Mission Viejo Project
        </Link>
        <span />
      </div>
    </div>
  )
}
