// ============================================
// FILE: app/admin/products/new/page.jsx
// LOCATION: /app/admin/products/new/page.jsx
// PURPOSE: Add new product with image upload
// ============================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Product fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [material, setMaterial] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock]
