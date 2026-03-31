import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { images } from '@str-cleaning/assets'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>

      {/* Hero — photo left, copy right */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-96px)]">
        {/* Photo */}
        <div className="relative w-full min-h-[480px] lg:min-h-0">
          <Image
            src={images.hero1}
            alt="STR Cleaning Crew founder"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-center px-16 py-20 max-lg:px-8 max-lg:py-14">
          <h1 className="animate-rise font-marcellus text-[clamp(3rem,5.5vw,5.5rem)] leading-[1.05] mb-8">
            Our<br />company ethos
          </h1>
          <p className="animate-rise-delay-1 font-marcellus text-base leading-relaxed opacity-70 max-w-[480px] mb-14">
            Founded on a legacy of impeccable standards, our cleaning services
            embody an unparalleled commitment to excellence. We cater to
            discerning clients who appreciate the art of a truly pristine
            environment.
          </p>
          <div className="animate-rise-delay-2">
            <Link
              href="/contact"
              className="inline-block px-14 py-5 rounded-full bg-dark-brown text-stone font-marcellus text-base no-underline opacity-100 transition-opacity hover:opacity-80"
            >
              Learn more
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
