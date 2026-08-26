// ============================================
// FILE: app/page.jsx
// LOCATION: /app/page.jsx
// PURPOSE: Homepage with featured products
// ============================================

import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'

export default async function HomePage() {
  // Get featured products (new arrivals)
  const products = await prisma.product.findMany({
    where: { isNew: true },
    orderBy: { createdAt: 'desc' },
    take: 8
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Premium Clothing
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Discover the latest trends in fashion
        </p>
        <a 
          href="/products" 
          className="inline-block bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100"
        >
          Shop Now
        </a>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
        <ProductGrid products={products} />
      </section>
    </div>
  )
}
