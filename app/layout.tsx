import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Steakhouse Video AI — Cinematic Content Generator',
  description: 'KI-gestützter Video-Generator für Premium-Steakhouse Marketing',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
