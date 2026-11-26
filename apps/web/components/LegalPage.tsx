import { Navbar } from '@/components/Navbar'

/** Shared layout for the Privacy Policy and Terms pages. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone text-dark-brown">
      <div className="[&_a]:text-dark-brown [&_a]:opacity-70 [&_a:hover]:opacity-100 [&_button]:text-dark-brown">
        <Navbar />
      </div>
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-marcellus text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] mb-3">{title}</h1>
        <p className="font-marcellus text-sm opacity-60 mb-12">Last updated {updated}</p>
        <div className="font-marcellus text-base leading-relaxed flex flex-col gap-4 [&_h2]:text-2xl [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_a]:underline">
          {children}
        </div>
      </main>
    </div>
  )
}
