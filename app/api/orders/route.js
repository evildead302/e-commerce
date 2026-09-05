// ============================================
// FILE: app/api/orders/route.js
// LOCATION: /app/api/orders/route.js
// PURPOSE: Create order with WhatsApp as identity
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 🎯 Generate Order Number (250905143022042)
async function generateOrderNumber() {
  const now = new Date()
  
  // YYMMDDHHMMSS
  const year = String(now.getFullYear()).slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
  
  // 3-digit random (001-999)
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  let orderNumber = `${timestamp}${random}`
  
  // Check if order number already exists
  let exists = await prisma.order.findUnique({
    where: { orderNumber: orderNumber }
  })
  
  // If collision, regenerate random part (max 5 attempts)
  let attempts = 0
  while (exists && attempts < 5) {
    const newRandom = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    orderNumber = `${timestamp}${newRandom}`
    exists = await prisma.order.findUnique({
      where: { orderNumber: orderNumber }
    })
    attempts++
  }
  
  return orderNumber
}

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
      shipping,
      total
    } = data

    // Validate required fields
    if (!customerName || !customerWhatsApp || !items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Clean WhatsApp number
    const cleanWhatsApp = customerWhatsApp.replace(/\s/g, '').replace(/^\+/, '')

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { whatsappNumber: cleanWhatsApp }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          whatsappNumber: cleanWhatsApp,
          name: customerName,
          email: customerEmail || null,
          address: shippingAddress ? `${shippingAddress.street}, ${shippingAddress.city}` : null
        }
      })
    }

    // ✅ FIXED: Check stock using productId
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId } // ✅ Use item.productId
      })
      
      if (!product) {
        return NextResponse.json({ 
          error: `Product not found: ${item.productId}` 
        }, { status: 400 })
      }

      if (product.isVariant) {
        // Find the variant stock field
        const variantFields = [
          'variant1_stock', 'variant2_stock', 'variant3_stock',
          'variant4_stock', 'variant5_stock', 'variant6_stock'
        ]
        const variantLabels = [
          'variant1_label', 'variant2_label', 'variant3_label',
          'variant4_label', 'variant5_label', 'variant6_label'
        ]
        
        let variantIndex = -1
        for (let i = 0; i < variantLabels.length; i++) {
          const label = product[variantLabels[i]]
          if (label && label.includes(item.size) && label.includes(item.color)) {
            variantIndex = i
            break
          }
        }
        
        if (variantIndex === -1) {
          return NextResponse.json({ 
            error: `Variant not found for ${item.size} ${item.color}` 
          }, { status: 400 })
        }
        
        const stockField = variantFields[variantIndex]
        const currentStock = product[stockField] || 0
        
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

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create order
    const order = await prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          customerId: customer.id,
          customerName,
          customerWhatsApp: cleanWhatsApp,
          customerEmail,
          paymentMethod,
          paymentStatus: paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'NOT_REQUIRED',
          paymentNote,
          shippingAddress,
          deliveryNotes,
          subtotal: subtotal || 0,
          tax: 0,
          shipping: shipping || 0,
          total: total || subtotal || 0,
          status: 'PENDING',
          stockReduced: true,
          items: {
            create: items.map((item) => ({
              variantId: item.variantId || item.id,
              quantity: item.quantity,
              price: item.price,
              size: item.size || 'N/A',
              color: item.color || 'N/A',
              productName: item.productName || item.name
            }))
          }
        },
        include: {
          items: true
        }
      })

      // ✅ FIXED: Reduce stock using productId
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })

        if (product.isVariant) {
          const variantFields = [
            'variant1_stock', 'variant2_stock', 'variant3_stock',
            'variant4_stock', 'variant5_stock', 'variant6_stock'
          ]
          const variantLabels = [
            'variant1_label', 'variant2_label', 'variant3_label',
            'variant4_label', 'variant5_label', 'variant6_label'
          ]
          
          let variantIndex = -1
          for (let i = 0; i < variantLabels.length; i++) {
            const label = product[variantLabels[i]]
            if (label && label.includes(item.size) && label.includes(item.color)) {
              variantIndex = i
              break
            }
          }
          
          if (variantIndex !== -1) {
            const stockField = variantFields[variantIndex]
            const currentStock = product[stockField] || 0
            await prisma.product.update({
              where: { id: product.id },
              data: {
                [stockField]: currentStock - item.quantity
              }
            })
          }
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

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: orderNumber,
      message: `Order ${orderNumber} placed successfully!`
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create order: ' + error.message 
    }, { status: 500 })
  }
          }
