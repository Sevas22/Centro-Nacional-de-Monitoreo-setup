import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL no está configurado en las variables de entorno')
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const client = createPrismaClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
    return client
  }
  return globalForPrisma.prisma
}

// Lazy proxy: importing this module must never touch DATABASE_URL — Next.js evaluates
// route modules during build ("collecting page data") without ever calling a handler,
// so eagerly connecting here would fail the build whenever no DB is configured yet.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient() as object, prop, receiver)
  },
})
