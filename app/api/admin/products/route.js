// ============================================
// FILE: app/api/admin/products/route.js
// LOCATION: /app/api/admin/products/route.js
// PURPOSE: Create new product
// ============================================

// ✅ FIXED - Remove TypeScript annotations
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    const data = await request.json()
    const product = await prisma.product.create({ data })
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
