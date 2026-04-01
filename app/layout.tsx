import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Refund Management — Deluxe Operations Platform',
  description: 'Internal system for handling refund requests',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}