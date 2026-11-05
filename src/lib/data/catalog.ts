import { cacheLife, cacheTag } from "next/cache"

import { db } from "@/lib/db"
import type { Prisma } from "@/generated/prisma/client"
import { type Category, type Product, type ProductKind, type Size, type SizeGuide, stockKey } from "@/lib/catalog"

/**
 * Lectura del catálogo desde PostgreSQL (solo servidor).
 * Cacheado con la etiqueta CATALOG_TAG: al editar productos desde el admin (fase 5)
 * se llama `revalidateTag(CATALOG_TAG, "max")` y la tienda se actualiza.
 */
export const CATALOG_TAG = "catalog"

const productInclude = {
  category: true,
  sizeGuide: true,
  images: { orderBy: { sortOrder: "asc" } },
  colors: { include: { color: true }, orderBy: { sortOrder: "asc" } },
  tiers: { orderBy: { minQty: "asc" } },
  pieces: { orderBy: { sortOrder: "asc" } },
  variants: { include: { color: true } },
} satisfies Prisma.ProductInclude

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>

const SIZE_ORDER: Size[] = ["S", "M", "L"]

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    kind: row.kind.toLowerCase() as ProductKind,
    categorySlug: row.category.slug,
    fit: row.fit,
    description: row.description,
    material: row.material ?? undefined,
    price: Number(row.price),
    tiers: row.tiers.map((t) => ({ minQty: t.minQty, unitPrice: Number(t.unitPrice) })),
    lifestyle: row.images.map((i) => i.url),
    colors: row.colors.map((c) => ({
      slug: c.color.slug,
      name: c.color.name,
      hex: c.color.hex,
      image: c.imageUrl ?? undefined,
    })),
    sizes: SIZE_ORDER,
    pieces: row.pieces.length
      ? row.pieces.map((p) => ({ label: p.label, options: p.options.length ? p.options : undefined }))
      : undefined,
    sizeGuide: row.sizeGuide?.key,
    tags: [...(row.isNew ? (["nuevo"] as const) : []), ...(row.isBestSeller ? (["mas-vendido"] as const) : [])],
    stock: Object.fromEntries(row.variants.map((v) => [stockKey(v.color?.slug, v.size), v.stock])),
  }
}

/** Para Server Actions: productos SIN caché (precio y stock al instante) */
export async function getProductsFresh(slugs: string[]) {
  const rows = await db.product.findMany({
    where: { slug: { in: [...new Set(slugs)] }, isActive: true },
    include: productInclude,
  })
  return rows.map(toProduct)
}

export type Catalog = {
  products: Product[]
  /** Secciones de prendas (polos, camiseros…) para menús y filtros */
  categories: Category[]
  setsCategory: Category
}

/** Catálogo completo publicado. Es pequeño (decenas de productos): se carga entero y se cachea. */
export async function getCatalog(): Promise<Catalog> {
  "use cache"
  cacheLife("hours")
  cacheTag(CATALOG_TAG)

  const [rows, categoryRows] = await Promise.all([
    db.product.findMany({ where: { isActive: true }, include: productInclude, orderBy: { sortOrder: "asc" } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ])
  const products = rows.map(toProduct)
  const toCategory = (c: (typeof categoryRows)[number]): Category => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    cover: c.coverUrl,
  })
  const garmentCategorySlugs = new Set(products.filter((p) => p.kind === "prenda").map((p) => p.categorySlug))

  const sets = categoryRows.find((c) => c.slug === "conjuntos")
  return {
    products,
    categories: categoryRows.filter((c) => garmentCategorySlugs.has(c.slug)).map(toCategory),
    setsCategory: sets
      ? toCategory(sets)
      : { slug: "conjuntos", name: "Conjuntos", description: "", cover: "" },
  }
}

export async function getProduct(slug: string) {
  const { products } = await getCatalog()
  return products.find((p) => p.slug === slug)
}

export async function getCategory(slug: string) {
  const { categories, setsCategory } = await getCatalog()
  return slug === setsCategory.slug ? setsCategory : categories.find((c) => c.slug === slug)
}

export async function getSizeGuides(): Promise<SizeGuide[]> {
  "use cache"
  cacheLife("days")
  cacheTag(CATALOG_TAG)

  const rows = await db.sizeGuide.findMany({ orderBy: { title: "asc" } })
  return rows.map((g) => ({
    key: g.key,
    title: g.title,
    columns: g.columns,
    rows: g.rows as Record<Size, number[]>,
  }))
}

export async function getSizeGuide(key: string | undefined) {
  if (!key) return undefined
  return (await getSizeGuides()).find((g) => g.key === key)
}
