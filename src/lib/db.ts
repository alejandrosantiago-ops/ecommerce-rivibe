import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

/**
 * Cliente Prisma compartido (solo servidor).
 * En desarrollo se reutiliza entre recargas para no abrir conexiones de más,
 * pero se recrea si cambia DATABASE_URL (por ejemplo, al editar el .env con el servidor encendido).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaUrl?: string }

function getClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("Falta DATABASE_URL en el archivo .env")

  if (globalForPrisma.prisma && globalForPrisma.prismaUrl === connectionString) return globalForPrisma.prisma

  void globalForPrisma.prisma?.$disconnect()
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
    globalForPrisma.prismaUrl = connectionString
  }
  return client
}

export const db = getClient()
