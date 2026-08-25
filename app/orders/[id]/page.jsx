// ============================================
// FILE: app/orders/[id]/page.jsx
// LOCATION: /app/orders/[id]/page.jsx
// PURPOSE: Order confirmation page
// ============================================

import { prisma } from '@/lib/prisma'

export default async function OrderPage({ params }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: true
    }
  })

  if (!order) {
    return <div className="text-center py-12">Order not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600">🎉 Order Confirmed!</h1>
        <p className="text-gray-500 mt-2">Thank you for your order</p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
        <p className="text-sm text-gray-500">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </p>
        
        <div className="border-t mt-4 pt-4">
          <h3 className="font-medium mb-2">Items</h3>
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.productName} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t mt-4 pt-4">
          <h3 className="font-medium mb-2">Shipping Address</h3>
          <div className="text-sm text-gray-600">
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        <div className="border-t mt-4 pt-4">
          <span className="text-sm text-gray-500">Payment: {order.paymentMethod.replace('_', ' ')}</span>
          <span className={`
            ml-3 text-xs px-2 py-0.5 rounded-full
            ${order.paymentStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
              order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'}
          `}>
            {order.paymentStatus}
          </span>
        </div>
      </div>
    </div>
  )
}
