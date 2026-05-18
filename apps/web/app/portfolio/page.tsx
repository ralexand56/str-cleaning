import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export const metadata = {
  title: 'Portfolio — STR Cleaning Crew',
  description: 'A look into our residential and commercial cleaning work.',
}

const PROJECTS = [
  {
    slug: 'buena-park',
    name: 'Buena Park Project',
    src: '/images/IMG_9594.webp',
    alt: 'Buena Park living room',
  },
  {
    slug: 'rancho-mission-viejo',
    name: 'Rancho Mission Viejo Project',
    src: '/images/12-116_Sunstone_Pl_009.webp',
    alt: 'Rancho Mission Viejo living room',
  },
  {
    slug: 'laguna-hills',
    name: 'Laguna Hills Project',
    src: '/images/IMG_2445-1.webp',
    alt: 'Laguna Hills living room',
  },
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-dark-brown">
      <Navbar />

      {/* ── Hero ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 py-16 max-lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-6">
          <h1 className="font-marcellus text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.05] animate-rise">
            A look into our work
          </h1>
          <p className="font-marcellus text-sm text-dark-brown opacity-70 leading-relaxed max-w-[400px]">
            Take a look at the quality, detail, and consistency that define STR Cleaning Crew. Our portfolio highlights real results from residential and commercial projects, showcasing our commitment to precision, professionalism, and exceptional standards in every space we service.
          </p>
        </div>
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
          <Image
            src="/images/22-5_Orange_Blossom_022.webp"
            alt="Luxury bedroom"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* ── Three project cards ── */}
      <section className="max-w-[1300px] mx-auto w-full px-10 pb-24 max-lg:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PROJECTS.map((p) => (
            <Link
              key={p.slug}
              href={`/portfolio/${p.slug}`}
              className="group flex flex-col gap-3 no-underline"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="font-marcellus text-[clamp(1rem,1.8vw,1.3rem)] text-dark-brown">{p.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
