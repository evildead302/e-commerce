// ============================================
// FILE: app/api/admin/products/[id]/stock/route.js
// LOCATION: /app/api/admin/products/[id]/stock/route.js
// PURPOSE: Update product stock
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { field, value } = await request.json()
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        [field]: value
      }
    })
    
    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}
