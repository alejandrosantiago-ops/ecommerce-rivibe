import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"

/**
 * Acceso al panel /admin.
 * - Contraseñas con scrypt (incluido en Node, sin dependencias).
 * - La cookie guarda un token aleatorio; en la BD (Session) solo se guarda su hash SHA-256.
 * - `proxy.ts` solo mira si existe la cookie (redirección rápida); la verificación real es `requireAdmin()`,
 *   que se llama en cada página y en cada Server Action del panel.
 */
export const ADMIN_COOKIE = "rivibe_admin"
const SESSION_DAYS = 14

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 64)
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored?.startsWith("scrypt:")) return false
  const [, saltHex, keyHex] = stored.split(":")
  const expected = Buffer.from(keyHex, "hex")
  const key = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length)
  return timingSafeEqual(key, expected)
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } })
  ;(await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } })
  jar.delete(ADMIN_COOKIE)
}

export type AdminUser = { id: string; name: string; email: string }

/** Administrador de la sesión actual, o null. Se memoriza por petición. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!token) return null
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true } } },
  })
  if (!session || session.expiresAt < new Date()) return null
  const { user } = session
  if (user.role !== "ADMIN" || !user.isActive) return null
  return { id: user.id, name: user.name, email: user.email }
})

/** Para páginas del panel: sin sesión válida, al login */
export async function requireAdmin() {
  const admin = await getAdmin()
  if (!admin) redirect("/admin/login")
  return admin
}

/** Para Server Actions del panel: lanza error en vez de redirigir */
export async function assertAdmin() {
  const admin = await getAdmin()
  if (!admin) throw new Error("Tu sesión expiró. Vuelve a ingresar al panel.")
  return admin
}
