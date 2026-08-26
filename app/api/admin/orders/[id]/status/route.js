// ============================================
// FILE: app/api/admin/orders/[id]/status/route.js
// LOCATION: /app/api/admin/orders/[id]/status/route.js
// PURPOSE: Update order status and tracking
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, trackingNumber, trackingUrl } = await request.json()
    
    const updateData = { status, updatedAt: new Date() }
    
    if (status === 'SHIPPED' && trackingNumber) {
      updateData.trackingNumber = trackingNumber
      updateData.trackingUrl = trackingUrl
      updateData.shippedDate = new Date()
    }
    
    if (status === 'DELIVERED') {
      updateData.deliveredDate = new Date()
    }
    
    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
