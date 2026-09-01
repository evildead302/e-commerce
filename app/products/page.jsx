// ============================================
// FILE: app/products/page.jsx
// LOCATION: /app/products/page.jsx
// PURPOSE: Product listing with filters
// ============================================

import { Suspense } from 'react'
import ProductsContent from './ProductsContent'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
