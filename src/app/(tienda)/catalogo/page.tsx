import type { Metadata } from "next"

import { getCatalog } from "@/lib/data/catalog"
import { ShopView } from "@/components/product/shop-view"

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Todos los productos RIVIBE en un solo lugar. Elige color y talla y agrégalos al carrito.",
}

export default async function CatalogPage() {
  const { products } = await getCatalog()
  return (
    <ShopView
      title="Catálogo"
      description="Todos los productos en un solo lugar. Elige color y talla y agrega al carrito. Desde 3 y 5 unidades del mismo producto el precio baja automáticamente, aunque combines colores."
      crumbs={[{ label: "Catálogo" }]}
      products={products.filter((p) => p.kind !== "oferta")}
      quickAdd
    />
  )
}
