// ============================================
// FILE: app/admin/page.jsx
// LOCATION: /app/admin/page.jsx
// PURPOSE: Admin dashboard with stats
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStock: 0,
    revenue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setStats(data.stats || { totalOrders: 0, pendingOrders: 0, totalProducts: 0, lowStock: 0, revenue: 0 })
      setRecentOrders(data.recentOrders || [])
      setError(null)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.pendingOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{stats.totalProducts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-red-500">{stats.lowStock || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-green-600">${(stats.revenue || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue-500 hover:underline">
            View All →
          </Link>
        </div>
        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No orders yet</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium">Order #{order.id?.slice(-6) || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{order.customerName || order.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(order.total || 0).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status || 'PENDING'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
