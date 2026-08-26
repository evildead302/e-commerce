// ============================================
// FILE: app/api/admin/products/route.js
// LOCATION: /app/api/admin/products/route.js
// PURPOSE: Create new product
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const product = await prisma.product.create({ data })
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')
    
    let where = {}
    if (filter === 'in-stock') {
      where = { stock: { gt: 0 } }
    } else if (filter === 'low-stock') {
      where = { stock: { gt: 0, lt: 5 } }
    } else if (filter === 'out-of-stock') {
      where = { stock: 0 }
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
