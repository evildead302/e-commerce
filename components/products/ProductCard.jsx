// ============================================
// FILE: components/products/ProductCard.jsx
// LOCATION: /components/products/ProductCard.jsx
// PURPOSE: Single product card for listing
// ============================================

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)

  const getTotalStock = () => {
    if (!product.isVariant) return product.stock || 0
    const variants = [
      product.variant1_stock,
      product.variant2_stock,
      product.variant3_stock,
      product.variant4_stock,
      product.variant5_stock,
      product.variant6_stock
    ]
    return variants.reduce((sum, s) => sum + (s || 0), 0)
  }

  const totalStock = getTotalStock()
  const isInStock = totalStock > 0

  const images = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
    product.image5
  ].filter(Boolean)

  const mainImage = images[0] || '/placeholder-product.jpg'
  const secondImage = images[1] || mainImage

  // Get display price
  const getPrice = () => {
    if (!product.isVariant) return product.price || 0
    
    const prices = [
      product.variant1_price,
      product.variant2_price,
      product.variant3_price,
      product.variant4_price,
      product.variant5_price,
      product.variant6_price
    ].filter(p => p !== null && p !== undefined)
    
    if (prices.length === 0) return 0
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    if (minPrice === maxPrice) return minPrice
    return `${minPrice} - ${maxPrice}`
  }

  const price = getPrice()
  const priceDisplay = typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          {/* Image */}
          <Image
            src={isHovered && secondImage !== mainImage ? secondImage : mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {product.isNew && (
              <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded">
                NEW
              </span>
            )}
            {product.isSale && (
              <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded">
                SALE {product.discount}%
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded font-bold">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-3">
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h3 className="font-medium hover:underline line-clamp-1">
            {product.name}
          </h3>
          
          {/* Categories */}
          <div className="flex gap-1 mt-1 flex-wrap">
            {product.categories?.slice(0, 2).map((cat, i) => (
              <span key={i} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {cat}
              </span>
            ))}
          </div>
          
          <p className="font-bold mt-1">{priceDisplay}</p>
        </div>
      </Link>
    </div>
  )
}
