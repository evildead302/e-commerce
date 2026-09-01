// ============================================
// FILE: app/products/ProductsContent.jsx
// LOCATION: /app/products/ProductsContent.jsx
// PURPOSE: Product listing content with filters (Client Component)
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/products/ProductGrid'
import CategoryFilter from '@/components/products/CategoryFilter'

export default function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState([])

  useEffect(() => {
    const categories = searchParams.get('categories')?.split(',') || []
    setSelectedCategories(categories)
    fetchProducts(categories)
  }, [searchParams])

  const fetchProducts = async (categories) => {
    setLoading(true)
    try {
      const url = categories.length > 0 
        ? `/api/products?categories=${categories.join(',')}`
        : '/api/products'
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (categories) => {
    setSelectedCategories(categories)
    fetchProducts(categories)
  }

  if (loading) return <div className="text-center py-12">Loading products...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <CategoryFilter 
            selectedCategories={selectedCategories}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="md:col-span-3">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
        }
