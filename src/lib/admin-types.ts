import type { Size } from "@/lib/catalog"

/** Tipos del panel /admin que comparten servidor y navegador (sin acceso a la BD) */

export type ProductKindDb = "PRENDA" | "CONJUNTO" | "OFERTA"

export type AdminColor = { id: string; slug: string; name: string; hex: string }
export type AdminCategory = {
  id: string
  slug: string
  name: string
  description: string
  coverUrl: string
  sortOrder: number
  productCount: number
}
export type AdminSizeGuide = { id: string; title: string }

export type AdminProduct = {
  id: string
  slug: string
  name: string
  kind: ProductKindDb
  categoryId: string
  fit: string
  description: string
  material: string
  price: number
  tier3: number | null
  tier5: number | null
  isNew: boolean
  isBestSeller: boolean
  isActive: boolean
  sizeGuideId: string | null
  images: string[]
  colors: { colorId: string; imageUrl: string }[]
  /** Stock por `${colorId}|${talla}` (colorId vacío si el producto no tiene colores) */
  stock: Record<string, number>
  pieces: { label: string; options: string[] }[]
  orderCount: number
}

/** Clave de stock en el panel (por id de color, no por slug) */
export const adminStockKey = (colorId: string | null | undefined, size: Size) => `${colorId ?? ""}|${size}`

export type AdminCatalog = {
  products: AdminProduct[]
  categories: AdminCategory[]
  colors: AdminColor[]
  sizeGuides: AdminSizeGuide[]
}
