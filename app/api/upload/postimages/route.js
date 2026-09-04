// ============================================
// FILE: app/api/upload/postimages/route.js
// LOCATION: /app/api/upload/postimages/route.js
// PURPOSE: Upload image to PostImages (with debugging)
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

    // Log image details
    console.log('Image details:', {
      name: image.name,
      size: image.size,
      type: image.type
    })

    const uploadFormData = new FormData()
    uploadFormData.append('upload', image)
    uploadFormData.append('format', 'json')
    
    // Try without API key first (PostImages allows uploads without key)
    // if (process.env.POSTIMAGES_API_KEY) {
    //   uploadFormData.append('api_key', process.env.POSTIMAGES_API_KEY)
    // }

    const response = await fetch('https://api.postimage.org/1/upload', {
      method: 'POST',
      body: uploadFormData
    })

    // Log response status
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers.get('content-type'))

    const textResponse = await response.text()
    console.log('Response body (first 300 chars):', textResponse.substring(0, 300))

    // Try XML first
    if (textResponse.trim().startsWith('<?xml')) {
      const urlMatch = textResponse.match(/<url>(.*?)<\/url>/)
      if (urlMatch && urlMatch[1]) {
        return NextResponse.json({
          success: true,
          url: urlMatch[1]
        })
      }
      return NextResponse.json({
        success: false,
        error: 'XML response but no URL found'
      }, { status: 400 })
    }

    // Try JSON
    try {
      const data = JSON.parse(textResponse)
      if (data.success && data.url) {
        return NextResponse.json({
          success: true,
          url: data.url
        })
      }
      return NextResponse.json({
        success: false,
        error: data.error || 'Upload failed'
      }, { status: 400 })
    } catch (parseError) {
      console.error('Parse error:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid response from server: ' + textResponse.substring(0, 100)
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
