// ============================================
// FILE: app/admin/layout.jsx
// LOCATION: /app/admin/layout.jsx
// PURPOSE: Admin panel layout with sidebar
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { href: '/admin', icon: '📊', label: 'Dashboard' },
    { href: '/admin/orders', icon: '📦', label: 'Orders' },
    { href: '/admin/products', icon: '👕', label: 'Products' },
    { href: '/admin/products/new', icon: '➕', label: 'Add Product' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">🛍️ Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage your store</p>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition
                ${pathname === item.href 
                  ? 'bg-black text-white' 
                  : 'hover:bg-gray-100'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, Admin</span>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
