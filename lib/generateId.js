// ============================================
// FILE: lib/generateId.js
// LOCATION: /lib/generateId.js
// PURPOSE: Generate unique IDs
// ============================================

import { prisma } from '@/lib/prisma'

// 🎯 Generate Order Number (with collision check)
export async function generateOrderNumber() {
  const now = new Date()
  
  // YYMMDDHHMMSS
  const year = String(now.getFullYear()).slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
  
  // 3-digit random (001-999)
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  let orderNumber = `${timestamp}${random}`
  
  // Check if order number already exists
  let exists = await prisma.order.findUnique({
    where: { orderNumber: orderNumber }
  })
  
  // If collision, regenerate random part (max 5 attempts)
  let attempts = 0
  while (exists && attempts < 5) {
    const newRandom = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    orderNumber = `${timestamp}${newRandom}`
    exists = await prisma.order.findUnique({
      where: { orderNumber: orderNumber }
    })
    attempts++
  }
  
  return orderNumber
}

// 🎯 Get next Product ID (auto-increment)
export async function generateProductId() {
  // Count existing products
  const count = await prisma.product.count()
  
  // Next ID = count + 1
  const nextId = count + 1
  
  return nextId.toString()
}
