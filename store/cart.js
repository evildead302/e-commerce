// ============================================
// FILE: store/cart.js
// LOCATION: /store/cart.js
// PURPOSE: Zustand cart store with persistence
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // ✅ FIXED: Preserve productId when adding to cart
      addToCart: (item) => {
        const { items } = get()
        const existingItem = items.find(
          i => i.id === item.id && i.size === item.size && i.color === item.color
        )
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.id === item.id && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          })
        } else {
          // ✅ Make sure productId is preserved
          set({ 
            items: [...items, { 
              ...item, 
              id: `${item.id}-${Date.now()}`,
              productId: item.productId || item.id // ✅ ADD THIS
            }] 
          })
        }
      },
      
      removeFromCart: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        })
      },
      
      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map(item =>
            item.id === id
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      },
      
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
