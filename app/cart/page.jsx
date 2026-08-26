// ============================================
// FILE: app/cart/page.jsx
// LOCATION: /app/cart/page.jsx
// PURPOSE: Shopping cart page
// ============================================

'use client'

import { useCartStore } from '@/store/cart'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotal } = useCartStore()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">Start shopping to add items to your cart.</p>
        <Link href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-lg">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
              <Image
                src={item.image || '/placeholder-product.jpg'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <div className="flex gap-3 text-sm text-gray-500">
                <span>Size: {item.size}</span>
                <span>Color: {item.color}</span>
              </div>
              <p className="font-medium mt-1">${(item.price * item.quantity).toFixed(2)}</p>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex border rounded">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 border-r hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 min-w-[30px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 border-l hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg border">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={clearCart}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className="flex-1 bg-black text-white py-2 rounded text-center hover:bg-gray-800"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
