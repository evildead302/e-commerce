// ============================================
// FILE: app/api/customer/route.js
// LOCATION: /app/api/customer/route.js
// PURPOSE: Check if customer exists by WhatsApp
// URL: /api/customer?phone=+923001234567
// ============================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Clean phone number (remove spaces, +)
    const cleanPhone = phone.replace(/\s/g, '').replace(/^\+/, '')
    
    const customer = await prisma.customer.findUnique({
      where: { whatsappNumber: cleanPhone }
    })

    if (customer) {
      return NextResponse.json({
        exists: true,
        customer: {
          name: customer.name,
          email: customer.email,
          address: customer.address
        }
      })
    } else {
      return NextResponse.json({ exists: false })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check customer' }, { status: 500 })
  }
}
