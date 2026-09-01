// ============================================
// FILE: app/api/admin/verify/route.js
// LOCATION: /app/api/admin/verify/route.js
// PURPOSE: Verify admin password
// ============================================

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { password } = await request.json()
    
    // Get password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set')
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      )
    }
    
    if (password === adminPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
