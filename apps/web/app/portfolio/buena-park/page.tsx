import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export const metadata = {
  title: 'Buena Park Project — STR Cleaning Crew',
}

export default function BuenaParkPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-dark-brown">
      <Navbar />

      {/* Title */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pt-12 pb-6 max-lg:px-6">
        <p className="font-marcellus text-sm text-dark-brown opacity-60 mb-1">Buena Park, CA</p>
        <h1 className="font-marcellus text-[clamp(1.6rem,3.5vw,2.8rem)] leading-tight animate-rise">
          Post-Construction Cleaning + Organization
        </h1>
      </section>

      {/* Hero — kitchen with shelving unit */}
      <div className="mx-10 max-lg:mx-6 rounded-xl overflow-hidden mb-3">
        <div className="relative w-full aspect-[16/8]">
          <Image src="/images/IMG_9588.webp" alt="Kitchen with shelving" fill className="object-cover" priority />
        </div>
      </div>

      {/* Two-col: dining room + shelving detail */}
      <div className="mx-10 max-lg:mx-6 grid grid-cols-2 gap-3 mb-3">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image src="/images/IMG_9593.webp" alt="Dining and living room" fill className="object-cover" />
        </div>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image src="/images/IMG_9624.webp" alt="Shelving detail" fill className="object-cover" />
        </div>
      </div>

      {/* Full-width living room */}
      <div className="mx-10 max-lg:mx-6 rounded-xl overflow-hidden mb-3">
        <div className="relative w-full aspect-[16/8]">
          <Image src="/images/IMG_9594.webp" alt="Curved sofa living room" fill className="object-cover" />
        </div>
      </div>

      {/* Full-width master bedroom */}
      <div className="mx-10 max-lg:mx-6 rounded-xl overflow-hidden mb-3">
        <div className="relative w-full aspect-[16/8]">
          <Image src="/images/IMG_9601.webp" alt="Master bedroom" fill className="object-cover" />
        </div>
      </div>

      {/* Two-col: master bath + kids room */}
      <div className="mx-10 max-lg:mx-6 grid grid-cols-2 gap-3 mb-3">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image src="/images/IMG_9583.webp" alt="Master bathroom" fill className="object-cover" />
        </div>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image src="/images/IMG_9612.webp" alt="Kids room with teepee" fill className="object-cover" />
        </div>
      </div>

      {/* Two-col: second bathroom + pool exterior */}
      <div className="mx-10 max-lg:mx-6 grid grid-cols-2 gap-3 mb-16">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image src="/images/IMG_9596.webp" alt="Second bathroom" fill className="object-cover" />
        </div>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          <Image src="/images/IMG_9598.webp" alt="Pool exterior" fill className="object-cover" />
        </div>
      </div>

      {/* Prev / Next */}
      <div className="max-w-[1300px] mx-auto w-full px-10 pb-16 max-lg:px-6 flex justify-end">
        <Link
          href="/portfolio/rancho-mission-viejo"
          className="font-marcellus text-[clamp(1rem,2vw,1.4rem)] text-dark-brown opacity-70 hover:opacity-100 no-underline flex items-center gap-2"
        >
          Rancho Mission Viejo Project →
        </Link>
      </div>
    </div>
  )
}
