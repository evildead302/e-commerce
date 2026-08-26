// ============================================
// FILE: app/products/[id]/page.jsx
// LOCATION: /app/products/[id]/page.jsx
// PURPOSE: Single product detail page
// ============================================

import { prisma } from '@/lib/prisma'
import ProductDetail from '@/components/products/ProductDetail'

export default async function ProductPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  })

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return <ProductDetail product={product} />
}
