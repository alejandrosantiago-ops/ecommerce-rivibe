import { Suspense } from "react"
import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Admin RIVIBE" },
  robots: { index: false, follow: false },
}

/** Panel de administración: solo administradores con sesión (ver src/lib/auth.ts y src/proxy.ts) */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-warm-fog/40" />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  )
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  return <AdminShell admin={{ name: admin.name, email: admin.email }}>{children}</AdminShell>
}
