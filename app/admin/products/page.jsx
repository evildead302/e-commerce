// ============================================
// FILE: app/admin/products/page.jsx
// LOCATION: /app/admin/products/page.jsx
// PURPOSE: List all products with search by product number
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

  // ✅ Search by productNumber, name, brand, or internal id
  const filteredProducts = products.filter(product => {
    const searchTerm = search.toLowerCase()
    return (
      product.productNumber?.toLowerCase().includes(searchTerm) ||
      product.name?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.id?.toLowerCase().includes(searchTerm)
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
            placeholder="🔍 Search by Product #, Name, Brand..."
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
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Product #</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Brand</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Stock</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">No products found</td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <span className="font-mono text-sm font-bold">
                      {product.productNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.brand || '-'}</td>
                  <td className="p-3">
                    {product.isVariant ? (
                      <span className="text-sm">
                        {product.variant1_stock + product.variant2_stock + product.variant3_stock + 
                         product.variant4_stock + product.variant5_stock + product.variant6_stock || 0} units
                      </span>
                    ) : (
                      <span>{product.stock || 0}</span>
                    )}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
