import type { Metadata } from 'next'
import { AmplifyProvider } from '@/components/AmplifyProvider'
import Footer from '@/components/Footer'
import { SourceTracker } from '@/components/SourceTracker'
import './globals.css'

export const metadata: Metadata = {
  title: 'STR Cleaning Crew',
  description: 'Professional short-term rental cleaning services.',
  icons: {
    icon: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SourceTracker />
        <AmplifyProvider>
          {children}
          <Footer />
        </AmplifyProvider>
      </body>
    </html>
  )
}
