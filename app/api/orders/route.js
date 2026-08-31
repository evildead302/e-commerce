// ============================================
// FILE: app/api/orders/route.js
// LOCATION: /app/api/orders/route.js
// PURPOSE: Create order with WhatsApp as identity
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    const { 
      customerName,
      customerWhatsApp,
      customerEmail,
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

    // Clean WhatsApp number
    const cleanWhatsApp = customerWhatsApp.replace(/\s/g, '').replace(/^\+/, '')

    // 🎯 Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { whatsappNumber: cleanWhatsApp }
    })

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          whatsappNumber: cleanWhatsApp,
          name: customerName,
          email: customerEmail || null,
          address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`
        }
      })
    } else {
      // Update customer info if changed
      if (customer.name !== customerName || customer.email !== customerEmail) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: customerName,
            email: customerEmail || customer.email
          }
        })
      }
    }

    // Check stock
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
        const variantKey = `variant${item.variantIndex}_stock`
        const currentStock = product[variantKey] || 0
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

    // Create order
    const order = await prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          customerId: customer.id,
          customerName,
          customerWhatsApp: cleanWhatsApp,
          customerEmail,
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
            create: items.map((item) => ({
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
          const currentStock = product[variantKey] || 0
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

    // 🎯 Send WhatsApp notification to customer
    // WhatsApp link will be generated in admin panel
    
    // Notify admin
    console.log(`📦 New Order: #${order.id}`)
    console.log(`Customer: ${customerName} (${cleanWhatsApp})`)
    console.log(`Total: $${total}`)

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      customerId: customer.id,
      isNewCustomer: customer.createdAt === customer.updatedAt,
      message: 'Order placed successfully!'
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create order' 
    }, { status: 500 })
  }
}
