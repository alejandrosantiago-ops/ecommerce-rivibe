import { db } from "@/lib/db"
import {
  type AdminCatalog,
  type AdminCategory,
  type AdminColor,
  type AdminProduct,
  type AdminSizeGuide,
  adminStockKey,
} from "@/lib/admin-types"

export * from "@/lib/admin-types"

/**
 * Lecturas del panel /admin (sin caché: siempre lo último de la BD).
 * Las formas son serializables para pasarlas a componentes de cliente.
 */

export async function getAdminCatalog(): Promise<AdminCatalog> {
  const [rows, categories, colors, guides] = await Promise.all([
    db.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } },
        tiers: true,
        pieces: { orderBy: { sortOrder: "asc" } },
        variants: true,
        _count: { select: { orderItems: true } },
      },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
    db.color.findMany({ orderBy: { name: "asc" } }),
    db.sizeGuide.findMany({ orderBy: { title: "asc" } }),
  ])

  const products: AdminProduct[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    kind: p.kind,
    categoryId: p.categoryId,
    fit: p.fit,
    description: p.description,
    material: p.material ?? "",
    price: Number(p.price),
    tier3: p.tiers.find((t) => t.minQty === 3) ? Number(p.tiers.find((t) => t.minQty === 3)!.unitPrice) : null,
    tier5: p.tiers.find((t) => t.minQty === 5) ? Number(p.tiers.find((t) => t.minQty === 5)!.unitPrice) : null,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    isActive: p.isActive,
    sizeGuideId: p.sizeGuideId,
    images: p.images.map((i) => i.url),
    colors: p.colors.map((c) => ({ colorId: c.colorId, imageUrl: c.imageUrl ?? "" })),
    stock: Object.fromEntries(p.variants.map((v) => [adminStockKey(v.colorId, v.size), v.stock])),
    pieces: p.pieces.map((x) => ({ label: x.label, options: x.options })),
    orderCount: p._count.orderItems,
  }))

  return {
    products,
    categories: categories.map(
      (c): AdminCategory => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        coverUrl: c.coverUrl,
        sortOrder: c.sortOrder,
        productCount: c._count.products,
      }),
    ),
    colors: colors.map((c): AdminColor => ({ id: c.id, slug: c.slug, name: c.name, hex: c.hex })),
    sizeGuides: guides.map((g): AdminSizeGuide => ({ id: g.id, title: g.title })),
  }
}

