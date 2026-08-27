// ============================================
// FILE: lib/prisma.js
// LOCATION: /lib/prisma.js
// PURPOSE: Database client
// ============================================

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
