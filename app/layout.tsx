import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QA Test Case Manager',
  description: 'Professional Test Case Management Tool for QA Engineers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
