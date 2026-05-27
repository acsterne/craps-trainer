import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Craps Trainer',
  description: 'Learn craps with Kenji, your personal pit boss',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ height: '100%', overflow: 'hidden', margin: 0 }}>{children}</body>
    </html>
  )
}
