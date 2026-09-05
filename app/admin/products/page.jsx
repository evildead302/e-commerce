// ============================================
// FILE: app/admin/products/page.jsx
// LOCATION: /app/admin/products/page.jsx
// PURPOSE: List all products with variant details
// ============================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get all variants for a product with their IDs
  const getVariants = (product) => {
    const variants = []
    const variantData = [
      { id: 'var1', label: product.variant1_label, stock: product.variant1_stock, price: product.variant1_price },
      { id: 'var2', label: product.variant2_label, stock: product.variant2_stock, price: product.variant2_price },
      { id: 'var3', label: product.variant3_label, stock: product.variant3_stock, price: product.variant3_price },
      { id: 'var4', label: product.variant4_label, stock: product.variant4_stock, price: product.variant4_price },
      { id: 'var5', label: product.variant5_label, stock: product.variant5_stock, price: product.variant5_price },
      { id: 'var6', label: product.variant6_label, stock: product.variant6_stock, price: product.variant6_price }
    ]
    
    variantData.forEach(v => {
      if (v.label) {
        variants.push(v)
      }
    })
    
    return variants
  }

  // Get total stock for a product
  const getTotalStock = (product) => {
    if (!product.isVariant) return product.stock || 0
    const variants = getVariants(product)
    return variants.reduce((sum, v) => sum + (v.stock || 0), 0)
  }

  // Search by productNumber, name, brand, or variant label
  const filteredProducts = products.filter(product => {
    const searchTerm = search.toLowerCase()
    const variants = getVariants(product)
    const variantMatch = variants.some(v => 
      v.label?.toLowerCase().includes(searchTerm) ||
      v.id?.toLowerCase().includes(searchTerm)
    )
    
    return (
      product.productNumber?.toLowerCase().includes(searchTerm) ||
      product.name?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      variantMatch
    )
  })

  if (loading) return <div className="text-center py-12">Loading products...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search by Product #, Name, Variant ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          />
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            + Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Product #</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Variants</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Total Stock</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">No products found</td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const variants = getVariants(product)
                  const totalStock = getTotalStock(product)
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <span className="font-mono text-sm font-bold">
                          {product.productNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.isVariant ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.isVariant ? 'Variant' : 'Simple'}
                        </span>
                      </td>
                      <td className="p-3">
                        {product.isVariant ? (
                          <div className="space-y-1">
                            {variants.map((v) => (
                              <div key={v.id} className="text-xs flex items-center gap-2">
                                <span className="font-mono text-gray-400">{v.id}</span>
                                <span className="font-medium">{v.label}</span>
                                <span className="text-gray-400">|</span>
                                <span>Stock: {v.stock || 0}</span>
                                <span className="text-gray-400">|</span>
                                <span>Rs. {(v.price || 0).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No variants</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{totalStock}</span>
                        <span className="text-xs text-gray-400 ml-1">units</span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
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
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
