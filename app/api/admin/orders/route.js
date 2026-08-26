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
      include: { user: true, items: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
