// ============================================
// FILE: components/products/ProductDetail.jsx
// LOCATION: /components/products/ProductDetail.jsx
// PURPOSE: Full product detail with variant selector
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'

export default function ProductDetail({ product }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const { addToCart } = useCartStore()

  useEffect(() => {
    if (product.isVariant && product.variants?.length > 0) {
      const firstInStock = product.variants.find(v => v.stock > 0)
      if (firstInStock) {
        setSelectedVariant(firstInStock)
        const [size, color] = firstInStock.label.split(', ').map(s => s.trim())
        setSelectedSize(size)
        setSelectedColor(color)
      }
    }
  }, [product])

  // Get images
  const images = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
    product.image5
  ].filter(Boolean)

  // For variant products, build variants array
  const variants = product.isVariant ? [
    { label: product.variant1_label, stock: product.variant1_stock, price: product.variant1_price },
    { label: product.variant2_label, stock: product.variant2_stock, price: product.variant2_price },
    { label: product.variant3_label, stock: product.variant3_stock, price: product.variant3_price },
    { label: product.variant4_label, stock: product.variant4_stock, price: product.variant4_price },
    { label: product.variant5_label, stock: product.variant5_stock, price: product.variant5_price },
    { label: product.variant6_label, stock: product.variant6_stock, price: product.variant6_price }
  ].filter(v => v.label) : []

  const sizes = [...new Set(variants.map(v => v.label?.split(', ')[0]?.trim()))]
  const colors = [...new Set(variants.map(v => v.label?.split(', ')[1]?.trim()))]

  const getVariant = (size, color) => {
    return variants.find(v => {
      const [s, c] = v.label.split(', ').map(str => str.trim())
      return s === size && c === color
    })
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
    const variant = getVariant(size, selectedColor)
    if (variant) {
      setSelectedVariant(variant)
      setSelectedColor(variant.label.split(', ')[1]?.trim() || '')
    }
  }

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    const variant = getVariant(selectedSize, color)
    if (variant) setSelectedVariant(variant)
  }

  const isVariantAvailable = (size, color) => {
    const variant = getVariant(size, color)
    return variant && variant.stock > 0
  }

  const getStockStatus = () => {
    if (!product.isVariant) {
      return { text: product.stock > 0 ? 'In Stock' : 'Out of Stock', 
               color: product.stock > 0 ? 'green' : 'red' }
    }
    if (!selectedVariant) return { text: 'Unavailable', color: 'red' }
    if (selectedVariant.stock === 0) return { text: 'Out of Stock', color: 'red' }
    if (selectedVariant.stock < 5) return { text: `Only ${selectedVariant.stock} left!`, color: 'orange' }
    return { text: 'In Stock', color: 'green' }
  }

  const stockStatus = getStockStatus()
  const displayPrice = selectedVariant?.price || product.price || 0

  // ✅ FIXED: Include productId when adding to cart
  const handleAddToCart = () => {
    if (!selectedVariant && product.isVariant) {
      alert('Please select size and color')
      return
    }

    const cartItem = {
      id: product.isVariant ? selectedVariant.id : product.id,
      productId: product.id, // ✅ ADD THIS
      name: product.name,
      size: selectedSize || 'N/A',
      color: selectedColor || 'N/A',
      price: displayPrice,
      image: images[0] || '/images/placeholder-product.jpg',
      quantity: quantity,
      stock: selectedVariant?.stock || product.stock || 0
    }

    addToCart(cartItem)
    alert('✅ Added to cart!')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT: Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            {images[currentImage] ? (
              <Image
                src={images[currentImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`
                    aspect-square bg-gray-100 rounded-lg overflow-hidden relative
                    ${currentImage === index ? 'ring-2 ring-black' : 'opacity-70 hover:opacity-100'}
                  `}
                >
                  <Image src={img} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Info */}
        <div>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{product.material}</p>
          
          <div className="mt-3 text-2xl font-bold">
            Rs. {displayPrice.toFixed(2)}
          </div>

          <div className="mt-2">
            <p className={`font-medium text-${stockStatus.color}-600`}>
              {stockStatus.text}
            </p>
          </div>

          {product.isVariant && variants.length > 0 ? (
            <>
              {/* Size Selection */}
              <div className="mt-6">
                <h3 className="font-medium">Size: {selectedSize || 'Select'}</h3>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`
                        py-2 border rounded text-sm font-medium
                        ${selectedSize === size 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 hover:border-black'
                        }
                        ${!isVariantAvailable(size, selectedColor) && 'opacity-50 cursor-not-allowed bg-gray-100'}
                      `}
                      disabled={!isVariantAvailable(size, selectedColor)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mt-6">
                <h3 className="font-medium">Color: {selectedColor || 'Select'}</h3>
                <div className="flex gap-3 mt-2">
                  {colors.map(color => {
                    const variant = getVariant(selectedSize, color)
                    const isAvailable = variant && variant.stock > 0
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`
                          w-12 h-12 rounded-full border-2 relative
                          ${selectedColor === color ? 'border-black' : 'border-gray-300'}
                          ${!isAvailable && 'opacity-50 cursor-not-allowed'}
                        `}
                        style={{ 
                          backgroundColor: variant?.colorHex || '#ccc'
                        }}
                        disabled={!isAvailable}
                        title={color}
                      >
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-4">Fixed size and color</p>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mt-8 flex gap-4">
            <div className="flex border rounded">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border-r hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 border-l hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={stockStatus.color === 'red'}
              className={`
                flex-1 py-3 rounded font-medium
                ${stockStatus.color !== 'red'
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {stockStatus.color === 'red' ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>

          {/* Description */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Material: {product.material}
            </p>
          </div>

          {/* Categories */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {product.categories?.map((cat, i) => (
              <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                #{cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
