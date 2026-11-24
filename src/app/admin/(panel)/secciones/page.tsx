import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"
import { getAdminCatalog } from "@/lib/data/admin"
import { CategoriesAdmin } from "@/components/admin/categories-admin"

export const metadata: Metadata = { title: "Secciones" }

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const { categories } = await getAdminCatalog()
  return <CategoriesAdmin categories={categories} />
}
