// ============================================
// FILE: components/products/CategoryFilter.jsx
// LOCATION: /components/products/CategoryFilter.jsx
// PURPOSE: Filter products by categories
// ============================================

'use client'

import { useState } from 'react'

const CATEGORIES = {
  'Type': ['stitch', 'unstitch'],
  'Fabric': ['lawn', 'cotton', 'silk', 'chiffon'],
  'Age': ['adult', 'kids'],
  'Style': ['3-piece', '2-piece', '1-piece'],
  'Occasion': ['casual', 'formal', 'wedding', 'party', 'summer', 'winter'],
  'Gender': ['women', 'men', 'unisex']
}

export default function CategoryFilter({ selectedCategories = [], onFilterChange }) {
  const toggleCategory = (category) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    onFilterChange(newSelection)
  }

  const clearFilters = () => {
    onFilterChange([])
  }

  return (
    <div className="bg-white p-4 rounded-lg border sticky top-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Filter</h3>
        {selectedCategories.length > 0 && (
          <button 
            onClick={clearFilters}
            className="text-sm text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>
      
      {Object.entries(CATEGORIES).map(([group, categories]) => (
        <div key={group} className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">{group}</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`
                  px-3 py-1 rounded-full text-sm border transition
                  ${selectedCategories.includes(cat) 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">
            {selectedCategories.length} filters applied
          </p>
        </div>
      )}
    </div>
  )
}
