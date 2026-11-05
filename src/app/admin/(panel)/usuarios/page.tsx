import type { Metadata } from "next"
import { UsersAdmin } from "@/components/admin/users-admin"

export const metadata: Metadata = { title: "Usuarios" }

export default function AdminUsersPage() {
  return <UsersAdmin />
}
