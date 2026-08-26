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
  const [stock, setStock] = useState('')
  const [isVariant, setIsVariant] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isSale, setIsSale] = useState(false)
  const [discount, setDiscount] = useState('')
  
  // Images (up to 5)
  const [images, setImages] = useState(['', '', '', '', ''])
  
  // Variants (up to 6)
  const [variants, setVariants] = useState([
    { label: '', stock: '', price: '' },
    { label: '', stock: '', price: '' },
    { label: '', stock: '', price: '' },
    { label: '', stock: '', price: '' },
    { label: '', stock: '', price: '' },
    { label: '', stock: '', price: '' }
  ])

  // 🎯 Upload image to PostImages
  const uploadImage = async (file, index) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch('/api/upload/postimages', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (data.success) {
        const newImages = [...images]
        newImages[index] = data.url
        setImages(newImages)
        alert('✅ Image uploaded successfully!')
      } else {
        alert('❌ Upload failed: ' + data.error)
      }
    } catch (error) {
      alert('❌ Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // 🎯 Remove image
  const removeImage = (index) => {
    const newImages = [...images]
    newImages[index] = ''
    setImages(newImages)
  }

  // 🎯 Submit product
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const productData = {
        name,
        description,
        categories: category.split(',').map(c => c.trim()),
        brand: brand || null,
        material: material || null,
        isVariant,
        image1: images[0] || null,
        image2: images[1] || null,
        image3: images[2] || null,
        image4: images[3] || null,
        image5: images[4] || null,
        isNew,
        isSale,
        discount: parseInt(discount) || 0,
      }
      
      if (isVariant) {
        variants.forEach((v, i) => {
          const num = i + 1
          productData[`variant${num}_label`] = v.label || null
          productData[`variant${num}_stock`] = v.stock ? parseInt(v.stock) : 0
          productData[`variant${num}_price`] = v.price ? parseFloat(v.price) : 0
        })
      } else {
        productData.price = parseFloat(price) || 0
        productData.stock = parseInt(stock) || 0
      }
      
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      if (res.ok) {
        alert('✅ Product added successfully!')
        router.push('/admin/products')
        router.refresh()
      } else {
        const error = await res.json()
        alert('❌ Failed to add product: ' + error.error)
      }
    } catch (error) {
      alert('❌ Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="e.g., Premium Lawn Suit"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Categories *</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="e.g., stitch, lawn, adult, 3-piece"
            />
            <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="Detailed product description..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., PremiumWear"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Material</label>
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Pure Lawn"
            />
          </div>
        </div>
        
        {/* Product Type */}
        <div className="border p-4 rounded">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isVariant}
                onChange={() => setIsVariant(false)}
              />
              Simple Product
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isVariant}
                onChange={() => setIsVariant(true)}
              />
              Variant Product
            </label>
          </div>
          
          {!isVariant ? (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="49.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="25"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Variants (Size, Color)</h3>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium">Size, Color</span>
                <span className="text-sm font-medium">Stock</span>
                <span className="text-sm font-medium">Price</span>
              </div>
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <input
                    value={variant.label}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[index].label = e.target.value
                      setVariants(newVariants)
                    }}
                    className="p-2 border rounded"
                    placeholder="e.g., S, Black"
                  />
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[index].stock = e.target.value
                      setVariants(newVariants)
                    }}
                    className="p-2 border rounded"
                    placeholder="10"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => {
                      const newVariants = [...variants]
                      newVariants[index].price = e.target.value
                      setVariants(newVariants)
                    }}
                    className="p-2 border rounded"
                    placeholder="29.99"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Images (Upload up to 5)</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="border-2 border-dashed rounded p-4 text-center relative aspect-square">
                {images[index] ? (
                  <div className="relative h-full">
                    <img 
                      src={images[index]} 
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block h-full">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) uploadImage(file, index)
                      }}
                    />
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-3xl">📸</span>
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                    </div>
                  </label>
                )}
              </div>
            ))}
          </div>
          {uploading && <p className="text-sm text-blue-500 mt-2">⏳ Uploading image...</p>}
          <p className="text-xs text-gray-400 mt-1">Images hosted on PostImages (free)</p>
        </div>
        
        {/* Additional Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              id="isNew"
            />
            <label htmlFor="isNew">Mark as New</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSale}
              onChange={(e) => setIsSale(e.target.checked)}
              id="isSale"
            />
            <label htmlFor="isSale">Mark as Sale</label>
          </div>
        </div>
        
        {isSale && (
          <div>
            <label className="block text-sm font-medium mb-1">Discount %</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="20"
            />
          </div>
        )}
        
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  )
    }
