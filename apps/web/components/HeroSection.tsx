import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from './Navbar'

export function HeroSection() {
  return (
    <main className="relative min-h-screen overflow-hidden isolate">
      {/* Background image — Ken Burns zoom */}
      <Image
        src="/images/unsplash-image-kF3KNcoXQXY.jpg"
        alt="Clean, modern living room"
        fill
        priority
        className="object-cover object-center [z-index:-2] scale-[1.02] animate-hero-zoom"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 hero-overlay [z-index:-1]" />

      <Navbar />

      {/* Hero copy */}
      <section className="max-w-[920px] mx-auto min-h-[calc(100vh-130px)] grid place-items-center text-center px-5 pt-9 pb-20 max-[980px]:min-h-[calc(100vh-190px)] max-[980px]:pt-6">
        <div className="flex flex-col items-center gap-12 max-sm:gap-3.5">
          <h1 className="m-0 font-marcellus text-[clamp(2.6rem,6vw,5.2rem)] leading-[1.06] tracking-[0.01em] font-normal text-stone animate-rise max-sm:text-[clamp(2rem,12vw,3.1rem)]">
            Experience the Art of
            <br />
            Pristine Clean
          </h1>

          <p className="m-0 text-muted text-[clamp(1rem,2vw,1.35rem)] tracking-[0.01em] animate-rise-delay-1">
            We handle your property. You run your business.
          </p>

          <Link
            href="#"
            className="mt-8 inline-block no-underline text-dark-brown bg-accent px-[66px] py-[18px] rounded-full text-[clamp(1rem,1.8vw,1.25rem)] shadow-[0_12px_34px_rgba(26,20,16,0.3)] transition-[transform,box-shadow] duration-[220ms] ease-[ease] animate-rise-delay-2 hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(26,20,16,0.45)] focus-visible:-translate-y-[3px] max-sm:mt-1.5 max-sm:w-[min(280px,100%)] max-sm:text-center max-sm:px-6 max-sm:py-4"
          >
            Learn more
          </Link>
        </div>
      </section>
    </main>
  )
}
