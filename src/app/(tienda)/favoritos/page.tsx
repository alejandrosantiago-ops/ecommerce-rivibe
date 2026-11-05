import type { Metadata } from "next"

import { PageHeader } from "@/components/product/shop-view"
import { FavoritesGrid } from "@/components/product/favorites-grid"

export const metadata: Metadata = { title: "Favoritos" }

export default function FavoritesPage() {
  return (
    <div className="page-container">
      <PageHeader title="Favoritos" crumbs={[{ label: "Favoritos" }]} />
      <FavoritesGrid />
    </div>
  )
}
