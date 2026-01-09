// Prisma client - currently disabled for MVP deployment
// To enable, run: npx prisma generate

// Placeholder that won't break the build
export const prisma = null

// When ready for database, uncomment:
// import { PrismaClient } from '@prisma/client'
// const globalForPrisma = globalThis as unknown as {
//     prisma: PrismaClient | undefined
// }
// export const prisma = globalForPrisma.prisma ?? new PrismaClient()
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
