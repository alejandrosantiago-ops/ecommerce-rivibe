/**
 * Tipos del catálogo RIVIBE y funciones puras de precio/imagen.
 * Los datos viven en PostgreSQL (ver prisma/schema.prisma) y se leen con src/lib/data/catalog.ts.
 * El catálogo en código (src/lib/catalog-data.ts) solo alimenta el seed.
 */

export type Size = "S" | "M" | "L"
export const SIZES: Size[] = ["S", "M", "L"]

/** Precio por volumen: se activa cuando se llevan `minQty` unidades del MISMO producto (colores y tallas libres) */
export type PriceTier = { minQty: number; unitPrice: number }

export type ProductKind = "prenda" | "conjunto" | "oferta"

export type Color = {
  slug: string
  name: string
  hex: string
  /** Foto plana de ese color (si existe) */
  image?: string
}

/**
 * Para conjuntos y ofertas: cada pieza lleva su propia talla.
 * `options`: la pieza se elige entre varias prendas (ej. "Polera Star o Casaca").
 */
export type Piece = { label: string; options?: string[] }

export type SizeGuideKey = "polo-oversize" | "polo-boxyfit" | "hoodie-oversize" | "jogger"

export type SizeGuide = {
  key: string
  title: string
  columns: string[]
  rows: Record<Size, number[]>
}

export type Product = {
  slug: string
  name: string
  kind: ProductKind
  categorySlug: string
  fit: string
  description: string
  material?: string
  price: number
  tiers: PriceTier[]
  lifestyle: string[]
  colors: Color[]
  sizes: Size[]
  pieces?: Piece[]
  sizeGuide?: string
  tags?: ("nuevo" | "mas-vendido")[]
  /** Stock por variante, clave `${colorSlug}|${talla}` (colorSlug vacío si el producto no tiene colores) */
  stock?: Record<string, number>
}

export type Category = {
  slug: string
  name: string
  description: string
  cover: string
}

/* -------------------------------- stock -------------------------------- */

/** Desde cuántas unidades se muestra "Últimas unidades" */
export const LOW_STOCK = 3

export const stockKey = (colorSlug: string | undefined | null, size: Size) => `${colorSlug ?? ""}|${size}`

/** Stock de una variante; `undefined` si no se conoce (datos sin stock cargado) */
export function stockFor(product: Product, colorSlug: string | undefined | null, size: Size) {
  if (!product.stock) return undefined
  return product.stock[stockKey(product.colors.length ? colorSlug : "", size)] ?? 0
}

/** Unidades disponibles para una línea (conjuntos/ofertas: la pieza con menos stock manda) */
export function lineStock(
  product: Product,
  line: { colorSlug?: string | null; size?: Size | null; pieceSizes?: (Size | null)[] },
) {
  const sizes = product.pieces?.length ? line.pieceSizes ?? [] : line.size ? [line.size] : []
  if (!sizes.length || sizes.some((s) => !s)) return undefined
  // Varias piezas de la misma talla consumen el mismo stock
  const need = new Map<Size, number>()
  for (const s of sizes as Size[]) need.set(s, (need.get(s) ?? 0) + 1)
  let max = Infinity
  for (const [s, n] of need) {
    const available = stockFor(product, line.colorSlug, s)
    if (available === undefined) return undefined
    max = Math.min(max, Math.floor(available / n))
  }
  return max
}

export const totalStock = (product: Product) =>
  product.stock ? Object.values(product.stock).reduce((a, n) => a + n, 0) : undefined

/** ¿Hay stock en alguna talla de este color? */
export const colorInStock = (product: Product, colorSlug: string | undefined) =>
  product.sizes.some((s) => (stockFor(product, colorSlug, s) ?? 1) > 0)

/* ------------------------------ helpers ------------------------------ */

export const formatPrice = (value: number) =>
  `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const findProduct = (products: Product[], slug: string) => products.find((p) => p.slug === slug)
export const byCategory = (products: Product[], slug: string) => products.filter((p) => p.categorySlug === slug)

/** Más vendidos primero; el resto completa la grilla */
export const bestSellersFirst = (products: Product[]) =>
  [...products].sort(
    (a, b) => Number(!!b.tags?.includes("mas-vendido")) - Number(!!a.tags?.includes("mas-vendido")),
  )

/** Precio unitario según la cantidad total del MISMO producto */
export function unitPriceFor(product: Product, qty: number) {
  const tier = [...product.tiers].sort((a, b) => b.minQty - a.minQty).find((t) => qty >= t.minQty)
  return tier ? tier.unitPrice : product.price
}

/** Siguiente escalón de precio (para mensajes "agrega 1 más…") */
export function nextTier(product: Product, qty: number) {
  return [...product.tiers].sort((a, b) => a.minQty - b.minQty).find((t) => qty < t.minQty)
}

export const lowestPrice = (product: Product) =>
  Math.min(product.price, ...product.tiers.map((t) => t.unitPrice))

/** Imagen principal y secundaria para tarjetas */
export function productImages(product: Product): { primary: string; secondary?: string } {
  const flats = product.colors.flatMap((c) => (c.image ? [c.image] : []))
  const all = [...product.lifestyle, ...flats]
  return { primary: all[0], secondary: all[1] }
}

/** Las fotos de modelo llenan el cuadro; las de producto plano (fondo blanco) se contienen */
export const isLifestyle = (product: Product, src: string) => product.lifestyle.includes(src)

export const productHref = (product: Product) => `/producto/${product.slug}`
