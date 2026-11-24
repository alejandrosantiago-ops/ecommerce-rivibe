"use server"

import { updateTag } from "next/cache"

import { db } from "@/lib/db"
import { assertAdmin } from "@/lib/auth"
import { CATALOG_TAG } from "@/lib/data/catalog"
import { HOME_TAG } from "@/lib/data/home"
import { SIZES } from "@/lib/catalog"
import { type AdminColor, type ProductKindDb, adminStockKey } from "@/lib/admin-types"
import type { Prisma } from "@/generated/prisma/client"

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

const fail = (error: string) => ({ ok: false as const, error })

/** Errores de Prisma más comunes, en castellano */
function friendly(e: unknown): string {
  const code = (e as { code?: string })?.code
  if (code === "P2002") return "Ya existe un registro con ese nombre o dirección (slug). Usa otro."
  if (e instanceof Error) return e.message
  return "No se pudo guardar. Intenta de nuevo."
}

function refreshStore() {
  updateTag(CATALOG_TAG)
  updateTag(HOME_TAG)
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const KINDS: ProductKindDb[] = ["PRENDA", "CONJUNTO", "OFERTA"]

/** Solo imágenes locales (/images/…, /uploads/…) o de Cloudinary: next/image no acepta otros dominios */
const imageError = (url: string) =>
  `La imagen "${url.slice(0, 60)}" no es válida: súbela con el botón (o usa una ruta /images/… o un enlace de Cloudinary).`

/* =============================== Productos =============================== */

export type ProductInput = {
  id?: string
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
  stock: Record<string, number>
  pieces: { label: string; options: string[] }[]
}

function validateProduct(p: ProductInput): string | null {
  if (!p.name.trim()) return "Escribe el nombre del producto."
  if (!SLUG_RE.test(p.slug)) return "La dirección (slug) solo puede tener minúsculas, números y guiones."
  if (!KINDS.includes(p.kind)) return "Tipo de producto no válido."
  if (!p.categoryId) return "Elige una sección."
  if (!(p.price > 0)) return "El precio unitario debe ser mayor que 0."
  if (p.tier3 !== null && !(p.tier3 > 0 && p.tier3 <= p.price)) return "El precio desde 3 u. debe ser menor o igual al unitario."
  if (p.tier5 !== null && !(p.tier5 > 0 && p.tier5 <= (p.tier3 ?? p.price)))
    return "El precio desde 5 u. debe ser menor o igual al de 3 u."
  if (!p.images.length && !p.colors.some((c) => c.imageUrl)) return "Agrega al menos una foto."
  for (const url of [...p.images, ...p.colors.map((c) => c.imageUrl).filter(Boolean)]) {
    if (!(url.startsWith("/") || url.startsWith("https://res.cloudinary.com/"))) return imageError(url)
  }
  if (new Set(p.colors.map((c) => c.colorId)).size !== p.colors.length) return "Hay un color repetido."
  if (Object.values(p.stock).some((n) => !Number.isInteger(n) || n < 0)) return "El stock debe ser un número entero, 0 o mayor."
  if (p.kind !== "PRENDA" && p.pieces.some((x) => !x.label.trim())) return "Cada pieza del conjunto necesita un nombre."
  return null
}

export async function saveProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  await assertAdmin()
  const p = { ...input, name: input.name.trim(), slug: input.slug.trim() }
  const invalid = validateProduct(p)
  if (invalid) return fail(invalid)

  try {
    const id = await db.$transaction(async (tx) => {
      const data = {
        slug: p.slug,
        name: p.name,
        kind: p.kind,
        categoryId: p.categoryId,
        fit: p.fit.trim(),
        description: p.description.trim(),
        material: p.material.trim() || null,
        price: p.price,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        isActive: p.isActive,
        sizeGuideId: p.sizeGuideId || null,
      } satisfies Prisma.ProductUncheckedUpdateInput

      let productId = p.id
      if (productId) {
        await tx.product.update({ where: { id: productId }, data })
      } else {
        const last = await tx.product.aggregate({ _max: { sortOrder: true } })
        productId = (await tx.product.create({ data: { ...data, sortOrder: (last._max.sortOrder ?? 0) + 1 } })).id
      }

      // Fotos, colores, precios por volumen y piezas: se reemplazan completos
      await tx.productImage.deleteMany({ where: { productId } })
      await tx.productImage.createMany({
        data: p.images.map((url, i) => ({
          productId,
          url,
          alt: p.name,
          kind: p.kind === "OFERTA" ? ("FLYER" as const) : ("LIFESTYLE" as const),
          sortOrder: i,
        })),
      })
      await tx.productColor.deleteMany({ where: { productId } })
      await tx.productColor.createMany({
        data: p.colors.map((c, i) => ({ productId, colorId: c.colorId, imageUrl: c.imageUrl || null, sortOrder: i })),
      })
      await tx.priceTier.deleteMany({ where: { productId } })
      await tx.priceTier.createMany({
        data: [
          ...(p.tier3 !== null ? [{ productId, minQty: 3, unitPrice: p.tier3 }] : []),
          ...(p.tier5 !== null ? [{ productId, minQty: 5, unitPrice: p.tier5 }] : []),
        ],
      })
      await tx.bundlePiece.deleteMany({ where: { productId } })
      if (p.kind !== "PRENDA") {
        await tx.bundlePiece.createMany({
          data: p.pieces.map((x, i) => ({
            productId,
            label: x.label.trim(),
            options: x.options.map((o) => o.trim()).filter(Boolean),
            sortOrder: i,
          })),
        })
      }

      // Stock por color × talla: se actualiza la variante existente o se crea; las de colores quitados se borran
      const slots: (string | null)[] = p.colors.length ? p.colors.map((c) => c.colorId) : [null]
      const existing = await tx.productVariant.findMany({ where: { productId } })
      const keep = new Set<string>()
      for (const colorId of slots) {
        for (const size of SIZES) {
          const stock = p.stock[adminStockKey(colorId, size)] ?? 0
          const found = existing.find((v) => v.colorId === colorId && v.size === size)
          if (found) {
            keep.add(found.id)
            if (found.stock !== stock) await tx.productVariant.update({ where: { id: found.id }, data: { stock } })
          } else {
            const created = await tx.productVariant.create({
              data: { productId, colorId, size, stock, sku: `${productId}-${colorId ?? "unico"}-${size}`.toUpperCase() },
            })
            keep.add(created.id)
          }
        }
      }
      await tx.productVariant.deleteMany({ where: { productId, id: { notIn: [...keep] } } })
      return productId
    })

    refreshStore()
    return { ok: true, data: { id } }
  } catch (e) {
    return fail(friendly(e))
  }
}

/** Borra el producto; si ya tiene pedidos, solo lo oculta (los pedidos guardan la referencia) */
export async function deleteProduct(id: string): Promise<ActionResult<{ hidden: boolean }>> {
  await assertAdmin()
  try {
    const orders = await db.orderItem.count({ where: { productId: id } })
    if (orders > 0) {
      await db.product.update({ where: { id }, data: { isActive: false } })
      refreshStore()
      return { ok: true, data: { hidden: true } }
    }
    await db.$transaction([db.cartItem.deleteMany({ where: { productId: id } }), db.product.delete({ where: { id } })])
    refreshStore()
    return { ok: true, data: { hidden: false } }
  } catch (e) {
    return fail(friendly(e))
  }
}

/** Orden de los productos en la tienda */
export async function reorderProducts(ids: string[]): Promise<ActionResult> {
  await assertAdmin()
  await db.$transaction(ids.map((id, i) => db.product.update({ where: { id }, data: { sortOrder: i } })))
  refreshStore()
  return { ok: true }
}

/* ================================ Colores ================================ */

export async function createColor(name: string, hex: string): Promise<ActionResult<AdminColor>> {
  await assertAdmin()
  const clean = name.trim()
  if (!clean) return fail("Escribe el nombre del color.")
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return fail("El color debe ser un código como #1a1a1a.")
  const slug = clean
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  try {
    const color = await db.color.upsert({ where: { slug }, update: {}, create: { slug, name: clean, hex: hex.toLowerCase() } })
    return { ok: true, data: { id: color.id, slug: color.slug, name: color.name, hex: color.hex } }
  } catch (e) {
    return fail(friendly(e))
  }
}

/* =============================== Secciones =============================== */

/** Slugs con página propia en la tienda: no se renombran ni se borran */
const RESERVED = ["conjuntos", "ofertas"]

export type CategoryInput = { id?: string; slug: string; name: string; description: string; coverUrl: string }

export async function saveCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  await assertAdmin()
  const c = { ...input, name: input.name.trim(), slug: input.slug.trim(), description: input.description.trim() }
  if (!c.name) return fail("Escribe el nombre de la sección.")
  if (!SLUG_RE.test(c.slug)) return fail("La dirección (slug) solo puede tener minúsculas, números y guiones.")
  if (!c.coverUrl) return fail("Sube una foto de portada.")
  if (!(c.coverUrl.startsWith("/") || c.coverUrl.startsWith("https://res.cloudinary.com/"))) return fail(imageError(c.coverUrl))

  try {
    if (c.id) {
      const current = await db.category.findUniqueOrThrow({ where: { id: c.id } })
      if (RESERVED.includes(current.slug) && current.slug !== c.slug) {
        return fail(`La dirección de "${current.name}" no se puede cambiar porque tiene su propia página.`)
      }
      await db.category.update({
        where: { id: c.id },
        data: { slug: c.slug, name: c.name, description: c.description, coverUrl: c.coverUrl },
      })
      refreshStore()
      return { ok: true, data: { id: c.id } }
    }
    const last = await db.category.aggregate({ _max: { sortOrder: true } })
    const row = await db.category.create({
      data: { slug: c.slug, name: c.name, description: c.description, coverUrl: c.coverUrl, sortOrder: (last._max.sortOrder ?? 0) + 1 },
    })
    refreshStore()
    return { ok: true, data: { id: row.id } }
  } catch (e) {
    return fail(friendly(e))
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await assertAdmin()
  const c = await db.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })
  if (!c) return fail("La sección ya no existe.")
  if (RESERVED.includes(c.slug)) return fail(`"${c.name}" tiene su propia página y no se puede borrar.`)
  if (c._count.products > 0) {
    return fail(`"${c.name}" tiene ${c._count.products} producto(s). Muévelos a otra sección antes de borrarla.`)
  }
  await db.category.delete({ where: { id } })
  refreshStore()
  return { ok: true }
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  await assertAdmin()
  await db.$transaction(ids.map((id, i) => db.category.update({ where: { id }, data: { sortOrder: i } })))
  refreshStore()
  return { ok: true }
}
