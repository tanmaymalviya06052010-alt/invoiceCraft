import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'InvoiceCraft — Invoices in Seconds',
  description: 'Create beautiful, professional invoices in under 60 seconds. Free for freelancers. No signup required.',
  keywords: 'invoice generator, freelancer invoice, simple invoice, invoice template, small business invoice, free invoice maker',
  openGraph: {
    title: 'InvoiceCraft — Invoices in Seconds',
    description: 'Create beautiful, professional invoices in under 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#171717',
                color: '#fff',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'var(--font-jakarta)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
