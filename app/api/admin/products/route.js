// ============================================
// FILE: app/api/admin/products/route.js
// LOCATION: /app/api/admin/products/route.js
// PURPOSE: Get all products and create new product
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 🎯 Generate next product number
async function generateProductNumber() {
  // Count existing products
  const count = await prisma.product.count()
  
  // Next ID = count + 1
  const nextId = count + 1
  
  return `PRD-${nextId}`
}

// GET - Get all products with filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')
    
    let where = {}
    if (filter === 'in-stock') {
      where = {
        OR: [
          { isVariant: false, stock: { gt: 0 } },
          { isVariant: true }
        ]
      }
    } else if (filter === 'low-stock') {
      where = {
        OR: [
          { isVariant: false, stock: { gt: 0, lt: 5 } }
        ]
      }
    } else if (filter === 'out-of-stock') {
      where = {
        OR: [
          { isVariant: false, stock: 0 }
        ]
      }
    }
    
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    const data = await request.json()
    
    // ✅ Generate product number (PRD-1, PRD-2, PRD-3...)
    const productNumber = await generateProductNumber()
    
    const product = await prisma.product.create({
      data: {
        productNumber: productNumber,
        ...data
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      product,
      message: `Product ${productNumber} created successfully!`
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ 
      error: 'Failed to create product: ' + error.message 
    }, { status: 500 })
  }
}
