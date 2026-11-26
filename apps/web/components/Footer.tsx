import Link from 'next/link'
import { SITE } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="w-full bg-[#ECE4DA] text-dark-brown px-8 py-10 max-sm:px-5">
      <div className="max-w-6xl mx-auto flex items-start justify-between gap-8 max-sm:flex-col max-sm:gap-6">
        <p className="text-4xl max-sm:text-3xl font-marcellus">STR Cleaning Crew</p>
        <div className="flex flex-wrap gap-x-16 gap-y-4">
          <div>
            <p className="text-base font-marcellus mb-2">Location</p>
            <p className="text-sm">Irvine, CA</p>
          </div>
          <div>
            <Link href="/contact" className="text-base font-marcellus mb-2 block text-dark-brown hover:opacity-70 transition-opacity no-underline">
              Contact
            </Link>
            <a href={`mailto:${SITE.email}`} className="text-sm block hover:underline text-dark-brown">
              {SITE.email}
            </a>
            <a href={SITE.phoneHref} className="text-sm block hover:underline mt-1 text-dark-brown">
              {SITE.phone}
            </a>
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm block hover:underline mt-1 text-dark-brown">
              Instagram {SITE.instagram}
            </a>
          </div>
          <div>
            <p className="text-base font-marcellus mb-2">Policies</p>
            <Link href="/privacy" className="text-sm block hover:underline text-dark-brown">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm block hover:underline mt-1 text-dark-brown">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
