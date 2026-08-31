// ============================================
// FILE: app/api/admin/products/[id]/route.js
// LOCATION: /app/api/admin/products/[id]/route.js
// PURPOSE: Get, update, or delete a product
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const product = await prisma.product.update({
      where: { id: params.id },
      data
    })
    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
