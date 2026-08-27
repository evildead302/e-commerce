// ============================================
// FILE: app/layout.jsx
// LOCATION: /app/layout.jsx
// PURPOSE: Root layout
// ============================================

import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My Clothing Store',
  description: 'Premium clothing store - Shop the latest trends',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
