// ============================================
// FILE: components/layout/Header.jsx
// LOCATION: /components/layout/Header.jsx
// PURPOSE: Main navigation header with cart
// ============================================

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCartStore()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            🛍️ MyStore
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-gray-600">
              Products
            </Link>
            <Link href="/categories" className="hover:text-gray-600">
              Categories
            </Link>
            <Link href="/cart" className="relative hover:text-gray-600">
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link href="/products" className="hover:text-gray-600">
                Products
              </Link>
              <Link href="/categories" className="hover:text-gray-600">
                Categories
              </Link>
              <Link href="/cart" className="hover:text-gray-600">
                Cart ({cartCount})
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
