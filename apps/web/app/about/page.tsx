import Image from 'next/image'
import { Navbar } from '@/components/Navbar'

const CIRCLE_IMAGES = [
  { src: '/images/7G2A8592.webp',   alt: 'Cleaner at refrigerator' },
  { src: '/images/7G2A8693.webp',   alt: 'Cleaner on ladder' },
  { src: '/images/7G2A8440.webp',   alt: 'Founder with tablet' },
  { src: '/images/7G2A8579-1.webp', alt: 'Cleaner at window' },
]

export const metadata = {
  title: 'About — STR Cleaning Crew',
  description: 'Who we are and what makes us different.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>

      <main className="flex-1 max-w-[1300px] mx-auto w-full px-10 py-16 max-lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 lg:gap-24">

          {/* ── Left: text ── */}
          <div>
            <h1 className="font-marcellus text-[clamp(3.5rem,8vw,7rem)] leading-[1.02] mb-16 animate-rise">
              Who We Are
            </h1>

            {/* Section 1 */}
            <section className="mb-12">
              <h2 className="font-marcellus text-[clamp(1.2rem,2.5vw,1.6rem)] mb-4">
                More Than Just Cleaning
              </h2>
              <p className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px]">
                We don't just clean – we look after your home as if it were our own. We check and
                charge cameras and smart locks, restock supplies, refresh linens, and prepare the
                property for guests so that every detail is perfect.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <h2 className="font-marcellus text-[clamp(1.2rem,2.5vw,1.6rem)] mb-4">
                One Company-One Team
              </h2>
              <p className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px] mb-4">
                Unlike traditional cleaning services that send random cleaners every time, we work
                with the same trained crews who know your property inside and out.
              </p>
              <p className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px] mb-4">
                Here's what makes us different:
              </p>
              <ul className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px] flex flex-col gap-3 pl-4">
                <li>
                  <span className="opacity-100 font-marcellus">Consistency You Can Trust</span> – The
                  same team services your property every time. No guessing. No surprises.
                </li>
                <li>
                  <span className="opacity-100 font-marcellus">We Know Your Property Like Home</span> –
                  Our cleaners study your home's layout, inventory, and unique needs. If something is
                  missing or broken, they spot it immediately.
                </li>
                <li>
                  <span className="opacity-100 font-marcellus">Internal Communication</span> – Our
                  supervisors and cleaners stay connected in real-time, so every detail is tracked and
                  nothing falls through the cracks.
                </li>
                <li>
                  <span className="opacity-100 font-marcellus">Proactive Care</span> – You don't have
                  to explain things over and over again. We know what should be there — and what
                  shouldn't.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
              <h2 className="font-marcellus text-[clamp(1.2rem,2.5vw,1.6rem)] mb-4">
                Management Without Management
              </h2>
              <p className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px] mb-4">
                No need to pay 20–40% to property management companies.
              </p>
              <p className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px]">
                We offer a flexible model: you remain the owner of your listing and handle the
                bookings, while we are your eyes, hands, and quality control on site.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="font-marcellus text-[clamp(1.2rem,2.5vw,1.6rem)] mb-4">
                Full Property Condition Control
              </h2>
              <p className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px] mb-4">
                We provide both regular cleanings and deep cleanings, check for natural wear &amp;
                tear, recommend replacements if needed, arrange window cleaning, and handle small
                repairs.
              </p>
              <p className="font-marcellus text-sm leading-relaxed opacity-70 max-w-[520px]">
                Additionally, we perform scheduled bi-annual maintenance that includes deep cleaning,
                window washing, appliance cleaning, filter replacement in cooling/heating systems, and
                other preventive care.
              </p>
            </section>
          </div>

          {/* ── Right: staggered circles ── */}
          <div className="hidden lg:flex flex-col gap-12 pt-8">
            {CIRCLE_IMAGES.map(({ src, alt }, i) => (
              <div
                key={src}
                className={`relative w-[280px] h-[280px] rounded-full overflow-hidden flex-shrink-0 ${i % 2 === 0 ? 'self-start' : 'self-end'}`}
              >
                <Image src={src} alt={alt} fill className="object-cover object-top" />
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
