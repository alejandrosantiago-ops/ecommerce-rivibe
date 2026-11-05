import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Admin RIVIBE" },
  robots: { index: false, follow: false },
}

/**
 * Panel de administración — SOLO DISEÑO (fase 1).
 * En la fase 5 se protege con Auth.js (rol ADMIN) desde `proxy.ts` y se conecta a Prisma.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
