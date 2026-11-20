import { Navbar } from '@/components/Navbar'
import { BookingForm } from '@/components/BookingForm'
import { decodeCalcState } from '@/lib/pricing/calcState'

export const metadata = {
  title: 'Book Now — STR Cleaning Crew',
  description: 'See your price and request a short-term rental, residential or post-construction cleaning.',
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; mode?: string; q?: string }>
}) {
  const { service, mode, q } = await searchParams
  // `mode` is the older link format (/book?mode=residential), still used by some pages.
  const initial = decodeCalcState({ service: service ?? mode, q })
  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>

      <main className="flex-1 px-5 py-16 max-sm:py-10">
        <div className="max-w-[1080px] mx-auto">
          <h1 className="font-marcellus text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] mb-3 animate-rise">
            Book a Cleaning
          </h1>
          <p className="font-marcellus text-base opacity-50 mb-14 animate-rise-delay-1">
            See your price as you go. We review every request and confirm your final price and time.
          </p>
          <BookingForm initial={initial} />
        </div>
      </main>
    </div>
  )
}
