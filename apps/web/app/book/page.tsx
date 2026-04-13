import { Navbar } from '@/components/Navbar'
import { BookingForm } from '@/components/BookingForm'

export const metadata = {
  title: 'Book Now — STR Cleaning Crew',
  description: 'Get an instant quote and book your STR cleaning service.',
}

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>

      <main className="flex-1 px-5 py-16 max-sm:py-10">
        <div className="max-w-[620px] mx-auto">
          <h1 className="font-marcellus text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] mb-3 animate-rise">
            Get a Quote
          </h1>
          <p className="font-marcellus text-base opacity-50 mb-14 animate-rise-delay-1">
            Tailored STR cleaning for your property.
          </p>
          <BookingForm />
        </div>
      </main>
    </div>
  )
}
