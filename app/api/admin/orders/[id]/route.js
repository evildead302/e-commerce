// ============================================
// FILE: app/api/admin/orders/[id]/route.js
// LOCATION: /app/api/admin/orders/[id]/route.js
// PURPOSE: Get single order by ID
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true, items: true }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
