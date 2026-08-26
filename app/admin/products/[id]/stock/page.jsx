// ============================================
// FILE: app/admin/products/[id]/stock/page.jsx
// LOCATION: /app/admin/products/[id]/stock/page.jsx
// PURPOSE: Manage product stock levels
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ManageStock({ params }) {
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`)
      const data = await res.json()
      setProduct(data)
    } catch (error) {
      alert('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (field, value) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/products/${params.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: parseInt(value) })
      })
      
      if (res.ok) {
        await fetchProduct()
        alert('✅ Stock updated!')
      }
    } catch (error) {
      alert('❌ Failed to update stock')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!product) return <div className="text-center py-12">Product not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Manage Stock: {product.name}
      </h1>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Variant</th>
              <th className="p-3 text-left">Current Stock</th>
              <th className="p-3 text-left">Update</th>
            </tr>
          </thead>
          <tbody>
            {!product.isVariant ? (
              <tr className="border-t">
                <td className="p-3">Simple Product</td>
                <td className="p-3">
                  <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-orange-500' : 'text-green-500'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue={product.stock}
                      className="w-24 p-1 border rounded"
                      id="stock-input"
                    />
                    <button
                      onClick={() => {
                        const value = document.getElementById('stock-input').value
                        updateStock('stock', value)
                      }}
                      disabled={updating}
                      className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              // Variant Product
              [
                { label: product.variant1_label, stock: product.variant1_stock, field: 'variant1_stock' },
                { label: product.variant2_label, stock: product.variant2_stock, field: 'variant2_stock' },
                { label: product.variant3_label, stock: product.variant3_stock, field: 'variant3_stock' },
                { label: product.variant4_label, stock: product.variant4_stock, field: 'variant4_stock' },
                { label: product.variant5_label, stock: product.variant5_stock, field: 'variant5_stock' },
                { label: product.variant6_label, stock: product.variant6_stock, field: 'variant6_stock' }
              ].map((variant, index) => (
                variant.label && (
                  <tr key={index} className="border-t">
                    <td className="p-3">{variant.label}</td>
                    <td className="p-3">
                      <span className={`font-medium ${variant.stock === 0 ? 'text-red-500' : variant.stock < 5 ? 'text-orange-500' : 'text-green-500'}`}>
                        {variant.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          defaultValue={variant.stock}
                          className="w-24 p-1 border rounded"
                          id={`stock-${index}`}
                        />
                        <button
                          onClick={() => {
                            const value = document.getElementById(`stock-${index}`).value
                            updateStock(variant.field, value)
                          }}
                          disabled={updating}
                          className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Stock</p>
          <p className="text-2xl font-bold">
            {!product.isVariant ? product.stock : 
              [product.variant1_stock, product.variant2_stock, product.variant3_stock,
               product.variant4_stock, product.variant5_stock, product.variant6_stock]
                .reduce((sum, s) => sum + (s || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Variants</p>
          <p className="text-2xl font-bold">
            {!product.isVariant ? 1 : 
              [product.variant1_label, product.variant2_label, product.variant3_label,
               product.variant4_label, product.variant5_label, product.variant6_label]
                .filter(Boolean).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-orange-500">
            {!product.isVariant ? (product.stock < 5 && product.stock > 0 ? 1 : 0) :
              [product.variant1_stock, product.variant2_stock, product.variant3_stock,
               product.variant4_stock, product.variant5_stock, product.variant6_stock]
                .filter(s => s < 5 && s > 0).length}
          </p>
        </div>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 px-4 py-2 border rounded hover:bg-gray-50"
      >
        ← Back to Products
      </button>
    </div>
  )
}
