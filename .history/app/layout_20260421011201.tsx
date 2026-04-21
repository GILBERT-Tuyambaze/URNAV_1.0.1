import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'URNAV - University of Rwanda Navigation',
  description: 'Indoor navigation system for University of Rwanda campus',
  generator: 'Gilbet',
  icons: {
    icon: [
      {
        url: '/android-chrome-192x192.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/urnav_logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/urnav_logo.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/urnav_logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
