import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export const metadata = {
  title: 'Rancho Mission Viejo — STR Cleaning Crew',
}

export default function RanchoMissionViejoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-dark-brown">
      <Navbar />

      {/* ── Centered title ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pt-16 pb-10 max-lg:px-6 text-center">
        <h1 className="font-marcellus text-[clamp(2rem,5vw,4rem)] leading-tight animate-rise">
          Decluttering + Organization
        </h1>
        <p className="font-marcellus text-sm text-dark-brown opacity-60 mt-2">
          Mission Viejo Ranch, CA
        </p>
      </section>

      {/* ── Full-width hero with dark border ── */}
      <div className="mx-10 max-lg:mx-6 border-4 border-dark-brown/80 rounded-xl overflow-hidden">
        <div className="relative w-full aspect-[16/7] max-lg:aspect-[4/3]">
          <Image
            src="/images/12-116_Sunstone_Pl_009.webp"
            alt="Living room with wood slat wall"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* ── Quote + image two-column ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 py-20 max-lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <h2 className="font-marcellus text-[clamp(1.8rem,4vw,3rem)] leading-snug">
          We bring creativity and expertise to everything we do.
        </h2>
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
          <Image
            src="/images/16-116_Sunstone_Pl_013.webp"
            alt="Kitchen and dining area"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* ── Staggered images + Ready to be listed ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pb-20 max-lg:px-6">
        <div className="grid grid-cols-2 gap-8 items-center">
          {/* Left — bedroom image */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
            <Image
              src="/images/24-116_Sunstone_Pl_023.webp"
              alt="Bedroom with floral wallpaper"
              fill
              className="object-cover"
            />
          </div>

          {/* Right — text only */}
          <div className="flex items-center">
            <p className="font-marcellus text-[clamp(1.8rem,4vw,3rem)] leading-snug text-dark-brown">
              Ready to be listed!
            </p>
          </div>
        </div>
      </section>

      {/* ── Prev / Next ── */}
      <div className="max-w-[1300px] mx-auto w-full px-10 pb-16 max-lg:px-6 flex justify-between">
        <Link
          href="/portfolio/buena-park"
          className="font-marcellus text-[clamp(1rem,2vw,1.4rem)] text-dark-brown opacity-70 hover:opacity-100 no-underline flex items-center gap-2"
        >
          ← Buena Park Project
        </Link>
        <Link
          href="/portfolio/laguna-hills"
          className="font-marcellus text-[clamp(1rem,2vw,1.4rem)] text-dark-brown opacity-70 hover:opacity-100 no-underline flex items-center gap-2"
        >
          Laguna Hills Project →
        </Link>
      </div>
    </div>
  )
}
