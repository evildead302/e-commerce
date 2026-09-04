// ============================================
// FILE: app/api/admin/orders/route.js
// LOCATION: /app/api/admin/orders/route.js
// PURPOSE: Get all orders with filtering
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where = {}
    if (status && status !== 'all') {
      where.status = status
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: { 
        user: true, 
        items: true 
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Return empty array if no orders (prevent null errors)
    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('Orders API error:', error)
    // Return empty array instead of crashing
    return NextResponse.json([], { status: 200 })
  }
}
