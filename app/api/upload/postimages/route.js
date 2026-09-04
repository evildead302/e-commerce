// ============================================
// FILE: app/api/upload/postimages/route.js
// USING IMGBB (No XML issues)
// ============================================

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image')
    
    if (!image) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image provided' 
      }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Upload to ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        key: process.env.IMGBB_API_KEY || '',
        image: base64Image,
        name: image.name || 'product-image'
      })
    })

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({
        success: true,
        url: data.data.url,
        thumb: data.data.thumb?.url || data.data.url
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.error?.message || 'Upload failed'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
