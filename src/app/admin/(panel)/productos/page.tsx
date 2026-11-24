import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"
import { getAdminCatalog } from "@/lib/data/admin"
import { ProductsAdmin } from "@/components/admin/products-admin"

export const metadata: Metadata = { title: "Productos" }

export default async function AdminProductsPage() {
  await requireAdmin()
  return <ProductsAdmin catalog={await getAdminCatalog()} />
}
