// ============================================
// FILE: app/admin/products/page.jsx
// LOCATION: /app/admin/products/page.jsx
// PURPOSE: List all products with stock management
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [filter])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/admin/products?filter=${filter}`)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalStock = (product) => {
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

  const getStockStatus = (product) => {
    const total = getTotalStock(product)
    if (total === 0) return { label: 'Out of Stock', color: 'red' }
    if (total < 5) return { label: 'Low Stock', color: 'orange' }
    return { label: 'In Stock', color: 'green' }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        alert('✅ Product deleted!')
        fetchProducts()
      }
    } catch (error) {
      alert('❌ Failed to delete product')
    }
  }

  if (loading) return <div className="text-center py-12">Loading products...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Products</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            + Add Product
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {products.map((product) => {
          const stockStatus = getStockStatus(product)
          const totalStock = getTotalStock(product)
          
          return (
            <div key={product.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
              <div className="flex items-center gap-4">
                {product.image1 && (
                  <img 
                    src={product.image1} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <div className="flex gap-2 mt-1">
                    {product.categories?.slice(0, 3).map((cat, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold">{totalStock}</p>
                <p className={`text-sm font-medium text-${stockStatus.color}-500`}>
                  {stockStatus.label}
                </p>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}/stock`}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    Stock
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="px-3 py-1 text-sm border rounded text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
