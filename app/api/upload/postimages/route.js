// ============================================
// FILE: app/api/upload/postimages/route.js
// LOCATION: /app/api/upload/postimages/route.js
// PURPOSE: Upload image to PostImages (handles XML response)
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

    // Get response as text first
    const textResponse = await response.text()
    console.log('PostImages Response:', textResponse.substring(0, 200)) // Log first 200 chars

    // Check if response is XML
    if (textResponse.trim().startsWith('<?xml')) {
      // Extract image URL from XML
      const urlMatch = textResponse.match(/<url>(.*?)<\/url>/)
      const thumbMatch = textResponse.match(/<thumb>(.*?)<\/thumb>/)
      
      if (urlMatch && urlMatch[1]) {
        return NextResponse.json({
          success: true,
          url: urlMatch[1],
          thumb: thumbMatch ? thumbMatch[1] : urlMatch[1]
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'XML response but no URL found'
      }, { status: 400 })
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(textResponse)
      
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
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid response from server'
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
