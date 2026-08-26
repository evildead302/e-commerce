// ============================================
// FILE: app/api/admin/dashboard/route.js
// LOCATION: /app/api/admin/dashboard/route.js
// PURPOSE: Get dashboard statistics
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const orders = await prisma.order.findMany()
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length
    const totalRevenue = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.total, 0)

    const products = await prisma.product.findMany()
    const totalProducts = products.length
    
    let lowStock = 0
    products.forEach(product => {
      if (!product.isVariant && product.stock < 5 && product.stock > 0) {
        lowStock++
      } else if (product.isVariant) {
        const variants = [
          product.variant1_stock,
          product.variant2_stock,
          product.variant3_stock,
          product.variant4_stock,
          product.variant5_stock,
          product.variant6_stock
        ]
        const hasLowStock = variants.some(v => v < 5 && v > 0)
        if (hasLowStock) lowStock++
      }
    })

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })

    return NextResponse.json({
      stats: { totalOrders, pendingOrders, totalProducts, lowStock, revenue: totalRevenue },
      recentOrders
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
