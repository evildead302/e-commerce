// ============================================
// FILE: app/admin/orders/[id]/page.jsx
// LOCATION: /app/admin/orders/[id]/page.jsx
// PURPOSE: Order detail with WhatsApp (WhatsApp as identity)
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderDetail({ params }) {
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`)
      const data = await res.json()
      setOrder(data)
      setTrackingNumber(data.trackingNumber || '')
      generateWhatsAppMessage(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Generate WhatsApp message using WhatsApp number
  const generateWhatsAppMessage = (orderData) => {
    const itemsList = orderData.items?.map(item => 
      `• ${item.productName} (${item.size}/${item.color}) x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n') || ''

    let message = `🛍️ *Order Update - #${orderData.id?.slice(-6) || 'N/A'}*\n\n`
    message += `Dear ${orderData.customerName || 'Customer'},\n\n`

    switch(orderData.status) {
      case 'CONFIRMED':
        message += `✅ Your order has been *CONFIRMED*!\n\n`
        break
      case 'PROCESSING':
        message += `📦 Your order is being *PROCESSED*!\n\n`
        break
      case 'SHIPPED':
        message += `🚚 Your order has been *SHIPPED*!\n\n`
        if (orderData.trackingNumber) {
          message += `📮 Tracking Number: *${orderData.trackingNumber}*\n`
        }
        if (orderData.trackingUrl) {
          message += `🔗 Track: ${orderData.trackingUrl}\n`
        }
        message += `\n`
        break
      case 'DELIVERED':
        message += `🎉 Your order has been *DELIVERED*!\n\n`
        break
      case 'CANCELLED':
        message += `❌ Your order has been *CANCELLED*.\n\n`
        break
      default:
        message += `ℹ️ Your order status has been updated.\n\n`
    }

    message += `*Order Details:*\n`
    message += `${itemsList}\n\n`
    message += `*Total:* $${orderData.total?.toFixed(2) || '0.00'}\n`
    message += `*Payment:* ${orderData.paymentMethod?.replace('_', ' ') || 'N/A'}\n\n`
    message += `*Delivery Address:*\n`
    const address = orderData.shippingAddress || {}
    message += `${address.name || ''}\n`
    message += `${address.street || ''}\n`
    message += `${address.city || ''}, ${address.state || ''} ${address.zip || ''}\n`
    message += `Phone: ${address.phone || ''}\n\n`
    message += `Thank you for shopping with us! 🎉`

    setWhatsappMessage(message)
  }

  // 🎯 Get WhatsApp link - uses customerWhatsApp
  const getWhatsAppLink = () => {
    const phone = order?.customerWhatsApp || order?.shippingAddress?.phone || ''
    const cleanPhone = phone.replace(/\s/g, '').replace(/^\+/, '')
    const message = encodeURIComponent(whatsappMessage)
    return `https://wa.me/${cleanPhone}?text=${message}`
  }

  // 🎯 Copy message
  const copyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage)
    alert('📋 Message copied to clipboard!')
  }

  // 🎯 Update order status
  const updateOrderStatus = async (newStatus) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: trackingNumber,
          trackingUrl: trackingNumber ? `https://www.tracking.com/${trackingNumber}` : null
        })
      })

      if (res.ok) {
        await fetchOrder()
        alert(`✅ Order status updated to ${newStatus}`)
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('❌ Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading order...</div>
  if (!order) return <div className="text-center py-12">Order not found</div>

  const phone = order.customerWhatsApp || order.shippingAddress?.phone || ''

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
          <p className="text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {/* 🎯 WhatsApp Button - Primary Action */}
          {phone && (
            <>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Customer
              </a>
              <button
                onClick={copyMessage}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                📋 Copy
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer Info - WhatsApp is Primary */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">WhatsApp</p>
            <p className="font-medium text-green-600">{order.customerWhatsApp}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{order.customerEmail || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium">Order Status:</span>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            disabled={updating}
            className="px-3 py-1 border rounded"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          {order.status === 'SHIPPED' && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Tracking #:</span>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="px-3 py-1 border rounded"
                placeholder="Enter tracking number"
              />
              <button
                onClick={() => updateOrderStatus('SHIPPED')}
                className="px-3 py-1 bg-black text-white rounded text-sm"
                disabled={updating}
              >
                Update
              </button>
            </div>
          )}
          
          <span className={`
            px-3 py-1 rounded-full text-sm
            ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'}
          `}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-bold mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-600">Items</h3>
              <div className="space-y-2 mt-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.productName} ({item.size}/{item.color}) x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-600">Payment</h3>
              <p className="text-sm">{order.paymentMethod?.replace('_', ' ')}</p>
              <p className={`text-sm ${order.paymentStatus === 'VERIFIED' ? 'text-green-500' : 'text-yellow-500'}`}>
                Status: {order.paymentStatus}
              </p>
            </div>
