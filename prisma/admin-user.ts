/**
 * Crea (o actualiza la contraseña de) el administrador del panel /admin.
 *
 *   npm run admin:create      → usa ADMIN_EMAIL y ADMIN_PASSWORD del .env
 *
 * También lo llama el seed. La contraseña se guarda con scrypt (mismo formato que src/lib/auth.ts).
 */
import { randomBytes, scryptSync } from "node:crypto"
import path from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

function hashPassword(password: string) {
  const salt = randomBytes(16)
  return `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`
}

export async function createAdmin(db: PrismaClient) {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? ""
  const name = process.env.ADMIN_NAME?.trim() || "Equipo RIVIBE"
  if (!email || password.length < 8) {
    console.warn("⚠ Sin administrador: define ADMIN_EMAIL y ADMIN_PASSWORD (mín. 8 caracteres) en el .env y corre `npm run admin:create`.")
    return
  }
  await db.user.upsert({
    where: { email },
    update: { passwordHash: hashPassword(password), role: "ADMIN", isActive: true },
    create: { email, name, role: "ADMIN", passwordHash: hashPassword(password) },
  })
  console.log(`Administrador listo: ${email}`)
}

// Ejecutado directamente: npm run admin:create
if (process.argv[1]?.split(path.sep).join("/").endsWith("prisma/admin-user.ts")) {
  try {
    process.loadEnvFile(".env")
  } catch {}
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
  createAdmin(db)
    .catch((e) => {
      console.error(e)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
