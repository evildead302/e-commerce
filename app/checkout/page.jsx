// ============================================
// FILE: app/checkout/page.jsx
// LOCATION: /app/checkout/page.jsx
// PURPOSE: Checkout with WhatsApp as identity
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, getTotal } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [existingCustomer, setExistingCustomer] = useState(null)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  
  const total = getTotal()

  // 🎯 Calculate delivery charges (Free above 3500 PKR)
  const shippingCharge = total > 3500 ? 0 : 200
  const finalTotal = total + shippingCharge

  // 🎯 Check if customer exists by WhatsApp number
  const checkCustomer = async (phone) => {
    if (phone.length < 10) return
    
    setLoadingCustomer(true)
    try {
      const res = await fetch(`/api/customer?phone=${encodeURIComponent(phone)}`)
      const data = await res.json()
      
      if (data.exists) {
        setExistingCustomer(data.customer)
        setCustomerName(data.customer.name)
      } else {
        setExistingCustomer(null)
      }
    } catch (error) {
      console.error('Error checking customer:', error)
    } finally {
      setLoadingCustomer(false)
    }
  }

  // 🎯 Auto-check when WhatsApp number changes
  useEffect(() => {
    if (whatsappNumber.length >= 10) {
      checkCustomer(whatsappNumber)
    }
  }, [whatsappNumber])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    
    // ✅ CORRECT orderData structure
    const orderData = {
      customerWhatsApp: formData.get('whatsapp'),
      customerName: formData.get('name'),
      customerEmail: formData.get('email') || null,
      
      items: items.map(item => ({
        variantId: item.id,
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        productName: item.name
      })),
      
      subtotal: total,
      tax: 0,
      shipping: shippingCharge,
      total: finalTotal,
      
      paymentMethod,
      paymentNote: formData.get('paymentNote') || '',
      
      // ✅ CORRECT - shippingAddress (NOT chinninaAddress!)
      shippingAddress: {
        name: formData.get('name'),
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
        country: formData.get('country'),
        phone: formData.get('whatsapp')
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
        alert(`✅ Order ${data.orderNumber || ''} placed successfully! Check WhatsApp for confirmation.`)
        router.push(`/orders/${data.orderId}`)
      } else {
        alert('❌ Failed to place order: ' + data.error)
      }
    } catch (error) {
      alert('❌ Failed to place order: ' + error.message)
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
        {/* Customer Details with WhatsApp */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="font-semibold mb-4">Contact Details</h2>
          <p className="text-sm text-gray-500 mb-4">
            📱 We'll send order updates on WhatsApp
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                WhatsApp Number * <span className="text-xs text-gray-400">(with country code)</span>
              </label>
              <input
                name="whatsapp"
                placeholder="+92 300 1234567"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="p-2 border rounded w-full"
              />
              {loadingCustomer && (
                <p className="text-xs text-blue-500 mt-1">Checking...</p>
              )}
              {existingCustomer && (
                <p className="text-xs text-green-500 mt-1">
                  ✅ Welcome back, {existingCustomer.name}!
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                name="name"
                placeholder="John Doe"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="p-2 border rounded w-full"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email (optional)</label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="font-semibold mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="street"
              placeholder="Street Address *"
              required
              className="p-2 border rounded md:col-span-2"
            />
            <input
              name="city"
              placeholder="City *"
              required
              className="p-2 border rounded"
            />
            <input
              name="state"
              placeholder="State *"
              required
              className="p-2 border rounded"
            />
            <input
              name="zip"
              placeholder="ZIP Code *"
              required
              className="p-2 border rounded"
            />
            <input
              name="country"
              placeholder="Pakistan"
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
                <p className="text-sm text-gray-500">Transfer and confirm via WhatsApp</p>
              </div>
            </label>
          </div>

          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Bank Details:</p>
              <p className="text-sm">Account: 1234567890</p>
              <p className="text-sm">Bank: Your Bank Name</p>
              <p className="text-sm">IBAN: PK00XXXX1234567890</p>
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
                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Charges</span>
                <span>{total > 3500 ? 'Rs. 0.00 (FREE)' : 'Rs. 200.00'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Total</span>
                <span>Rs. {finalTotal.toFixed(2)}</span>
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
          {loading ? 'Placing Order...' : `Place Order - Rs. ${finalTotal.toFixed(2)}`}
        </button>
      </form>
    </div>
  )
}
