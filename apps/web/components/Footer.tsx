import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-[#ECE4DA] px-8 py-10" style={{ color: '#44362a' }}>
      <div className="max-w-6xl mx-auto flex items-start justify-between">
        <p className="text-4xl font-marcellus">STR Cleaning Crew</p>
        <div className="flex gap-16">
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
