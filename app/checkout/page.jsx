// ============================================
// FILE: app/checkout/page.jsx
// LOCATION: /app/checkout/page.jsx
// PURPOSE: Checkout with payment methods
// ============================================

'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, getTotal } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const total = getTotal()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    
    const orderData = {
      items: items.map(item => ({
        variantId: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        productName: item.name
      })),
      subtotal: total,
      shipping: 0,
      tax: total * 0.1,
      total: total + (total * 0.1),
      paymentMethod,
      paymentNote: formData.get('paymentNote') || '',
      shippingAddress: {
        name: formData.get('name'),
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
        country: formData.get('country'),
        phone: formData.get('phone')
      },
      deliveryNotes: formData.get('deliveryNotes')
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await res.json()
      
      if (data.success) {
        clearCart()
        alert('✅ Order placed successfully! Check your email for confirmation.')
        router.push(`/orders/${data.orderId}`)
      } else {
        alert('❌ Failed to place order: ' + data.error)
      }
    } catch (error) {
      alert('❌ Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-lg">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="font-semibold mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Full Name"
              required
              className="p-2 border rounded"
            />
            <input
              name="phone"
              placeholder="Phone Number"
              required
              className="p-2 border rounded"
            />
            <input
              name="street"
              placeholder="Street Address"
              required
              className="p-2 border rounded md:col-span-2"
            />
            <input
              name="city"
              placeholder="City"
              required
              className="p-2 border rounded"
            />
            <input
              name="state"
              placeholder="State"
              required
              className="p-2 border rounded"
            />
            <input
              name="zip"
              placeholder="ZIP Code"
              required
              className="p-2 border rounded"
            />
            <input
              name="country"
              placeholder="Country"
              required
              className="p-2 border rounded md:col-span-2"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="font-semibold mb-4">Payment Method</h2>
          
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="CASH_ON_DELIVERY"
                checked={paymentMethod === 'CASH_ON_DELIVERY'}
                onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className="mr-3"
              />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-gray-500">Pay when you receive</p>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="BANK_TRANSFER"
                checked={paymentMethod === 'BANK_TRANSFER'}
                onChange={() => setPaymentMethod('BANK_TRANSFER')}
                className="mr-3"
              />
              <div>
                <p className="font-medium">Bank Transfer</p>
                <p className="text-sm text-gray-500">Transfer and upload screenshot</p>
              </div>
            </label>
          </div>

          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Bank Details:</p>
              <p className="text-sm">Account: 1234567890</p>
              <p className="text-sm">Bank: Your Bank Name</p>
              <textarea
                name="paymentNote"
                placeholder="Any notes about your payment?"
                className="mt-2 w-full p-2 border rounded"
                rows="2"
              />
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity} ({item.size}/{item.color})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%)</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Total</span>
                <span>${(total + (total * 0.1)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <textarea
            name="deliveryNotes"
            placeholder="Special delivery instructions..."
            className="mt-4 w-full p-2 border rounded"
            rows="2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  )
}
