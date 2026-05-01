import type { Metadata } from 'next'
import { AmplifyProvider } from '@/components/AmplifyProvider'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'ST Cleaning Crew',
  description: 'Professional short-term rental cleaning services.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AmplifyProvider>
          {children}
          <Footer />
        </AmplifyProvider>
      </body>
    </html>
  )
}
