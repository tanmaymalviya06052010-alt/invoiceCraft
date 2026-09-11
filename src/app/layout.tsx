import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InvoiceCraft - Simple Invoice Generator for Freelancers',
  description: 'Create professional invoices in seconds. Free invoice generator for freelancers and small businesses. No accounting degree required.',
  keywords: 'invoice generator, freelancer invoice, simple invoice, invoice template, small business invoice, free invoice maker',
  openGraph: {
    title: 'InvoiceCraft - Simple Invoice Generator for Freelancers',
    description: 'Create professional invoices in seconds. No accounting degree required.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
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
