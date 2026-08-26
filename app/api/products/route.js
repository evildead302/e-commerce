// ============================================
// FILE: app/api/products/route.js
// LOCATION: /app/api/products/route.js
// PURPOSE: Get all products with filtering
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categories = searchParams.get('categories')?.split(',') || []
    const search = searchParams.get('search') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    
    let where = {}
    
    if (categories.length > 0) {
      where.categories = { hasSome: categories }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
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
