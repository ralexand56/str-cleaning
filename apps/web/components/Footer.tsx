export default function Footer() {
  return (
    <footer className="w-full bg-stone px-8 py-10" style={{ color: '#44362a' }}>
      <div className="max-w-6xl mx-auto flex items-start justify-between">
        <p className="text-4xl font-marcellus">STR Cleaning Crew</p>
        <div className="flex gap-16">
          <div>
            <p className="text-base font-marcellus mb-2">Location</p>
            <p className="text-sm">Irvine, CA</p>
          </div>
          <div>
            <p className="text-base font-marcellus mb-2">Contact</p>
            <a href="mailto:info@str-cleaningcrew.com" className="text-sm hover:underline">
              info@str-cleaningcrew.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
