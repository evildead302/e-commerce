// ============================================
// FILE: app/api/admin/products/route.js
// LOCATION: /app/api/admin/products/route.js
// PURPOSE: Create new product with product number
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 🎯 Generate product number
async function generateProductNumber() {
  const count = await prisma.product.count()
  const nextId = count + 1
  return `PRD-${nextId}`
}

// GET - Get all products
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
    
    // ✅ Generate product number for NEW products
    const productNumber = await generateProductNumber()
    
    const product = await prisma.product.create({
      data: {
        productNumber: productNumber,  // ← THIS WAS MISSING
        ...data
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      product,
      message: `Product ${productNumber} created!`
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ 
      error: 'Failed to create product: ' + error.message 
    }, { status: 500 })
  }
}
