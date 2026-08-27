// ============================================
// FILE: app/api/upload/postimages/route.js
// LOCATION: /app/api/upload/postimages/route.js
// PURPOSE: Upload image to PostImages
// URL: /api/upload/postimages
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

    const uploadFormData = new FormData()
    uploadFormData.append('upload', image)
    uploadFormData.append('format', 'json')
    
    if (process.env.POSTIMAGES_API_KEY) {
      uploadFormData.append('api_key', process.env.POSTIMAGES_API_KEY)
    }

    const response = await fetch('https://api.postimage.org/1/upload', {
      method: 'POST',
      body: uploadFormData
    })

    const data = await response.json()

    if (data.success) {
      const imageUrl = data.url || data.image?.url || data.media?.url
      
      return NextResponse.json({
        success: true,
        url: imageUrl,
        thumb: data.thumb || imageUrl
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Upload failed'
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
