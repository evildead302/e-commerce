// ============================================
// FILE: components/layout/Footer.jsx
// LOCATION: /components/layout/Footer.jsx
// PURPOSE: Footer with links and info
// ============================================

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MyStore</h3>
            <p className="text-gray-400 text-sm">
              Premium clothing for every occasion.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white">Products</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products?categories=stitch" className="hover:text-white">Stitched</Link></li>
              <li><Link href="/products?categories=unstitch" className="hover:text-white">Unstitched</Link></li>
              <li><Link href="/products?categories=kids" className="hover:text-white">Kids</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 support@mystore.com</li>
              <li>📱 +92 300 1234567</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2024 MyStore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
