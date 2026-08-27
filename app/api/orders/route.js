// ============================================
// FILE: app/api/orders/route.js
// LOCATION: /app/api/orders/route.js
// PURPOSE: Create order (NO LOGIN REQUIRED)
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    const { 
      customerName,
      customerEmail,
      customerPhone,
      items, 
      shippingAddress, 
      paymentMethod, 
      paymentNote, 
      deliveryNotes,
      subtotal,
      tax,
      shipping,
      total
    } = data

    // Check stock availability
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product) {
        return NextResponse.json({ 
          error: `Product not found: ${item.productId}` 
        }, { status: 400 })
      }

      if (product.isVariant) {
        // Check variant stock
        const variantKey = `variant${item.variantIndex}_stock`
        const currentStock = (product as any)[variantKey] || 0
        if (currentStock < item.quantity) {
          return NextResponse.json({ 
            error: `Not enough stock for ${product.name} - ${item.size} ${item.color}` 
          }, { status: 400 })
        }
      } else {
        if ((product.stock || 0) < item.quantity) {
          return NextResponse.json({ 
            error: `Not enough stock for ${product.name}` 
          }, { status: 400 })
        }
      }
    }

    // Create order and reduce stock in transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create order with customer details
      const newOrder = await prisma.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          paymentStatus: paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'NOT_REQUIRED',
          paymentNote,
          shippingAddress,
          deliveryNotes,
          subtotal,
          tax,
          shipping,
          total,
          status: 'PENDING',
          stockReduced: true,
          items: {
            create: items.map((item: any) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color,
              productName: item.productName
            }))
          }
        },
        include: {
          items: true
        }
      })

      // Reduce stock
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })

        if (product.isVariant) {
          const variantKey = `variant${item.variantIndex}_stock`
          const currentStock = (product as any)[variantKey] || 0
          await prisma.$executeRaw`
            UPDATE Product 
            SET ${prisma.raw(variantKey)} = ${currentStock - item.quantity}
            WHERE id = ${product.id}
          `
        } else {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        }
      }

      return newOrder
    })

    // Send notification to admin email
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'your-email@gmail.com'
      
      // You can implement email notification here
      // For now, we'll just log it
      console.log(`📦 New Order: #${order.id}`)
      console.log(`Customer: ${customerName} (${customerPhone})`)
      console.log(`Total: $${total}`)
      
      // TODO: Send email notification to admin
      // await sendEmail({ ... })
      
    } catch (error) {
      console.error('Notification error:', error)
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Order placed successfully!'
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create order' 
    }, { status: 500 })
  }
}
