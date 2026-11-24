"use server"

import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { createSession, destroySession, verifyPassword } from "@/lib/auth"

export type LoginState = { error?: string; email?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  if (!email || !password) return { error: "Ingresa tu correo y contraseña.", email }

  const user = await db.user.findUnique({ where: { email } })
  const ok = user && user.role === "ADMIN" && user.isActive && (await verifyPassword(password, user.passwordHash))
  if (!ok) return { error: "Correo o contraseña incorrectos.", email }

  await createSession(user.id)
  redirect("/admin")
}

export async function logout() {
  await destroySession()
  redirect("/admin/login")
}
