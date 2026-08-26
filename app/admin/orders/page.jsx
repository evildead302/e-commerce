// ============================================
// FILE: app/admin/orders/page.jsx
// LOCATION: /app/admin/orders/page.jsx
// PURPOSE: List all orders with filters
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`)
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SHIPPED: 'bg-indigo-100 text-indigo-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return <div className="text-center py-12">Loading orders...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Order</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Customer</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Items</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Total</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Payment</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                    #{order.id.slice(-6)}
                  </Link>
                </td>
                <td className="p-3">
                  <p className="font-medium">{order.user?.name}</p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                </td>
                <td className="p-3 text-sm">{order.items?.length || 0}</td>
                <td className="p-3 font-medium">${order.total.toFixed(2)}</td>
                <td className="p-3">
                  <span className="text-sm">{order.paymentMethod?.replace('_', ' ')}</span>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full ml-2
                    ${order.paymentStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${getStatusColor(order.status)}
                  `}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
