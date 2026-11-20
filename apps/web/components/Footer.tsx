import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-[#ECE4DA] px-8 py-10 max-sm:px-5" style={{ color: '#44362a' }}>
      <div className="max-w-6xl mx-auto flex items-start justify-between gap-8 max-sm:flex-col max-sm:gap-6">
        <p className="text-4xl max-sm:text-3xl font-marcellus">STR Cleaning Crew</p>
        <div className="flex flex-wrap gap-x-16 gap-y-4">
          <div>
            <p className="text-base font-marcellus mb-2">Location</p>
            <p className="text-sm">Irvine, CA</p>
          </div>
          <div>
            <Link href="/contact" className="text-base font-marcellus mb-2 block hover:opacity-70 transition-opacity no-underline" style={{ color: '#44362a' }}>
              Contact
            </Link>
            <a href="mailto:info@str-cleaningcrew.com" className="text-sm hover:underline" style={{ color: '#44362a' }}>
              info@str-cleaningcrew.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
