/**
 * Seed de RIVIBE: carga el catálogo real (src/lib/catalog.ts) y datos de ejemplo
 * para el panel (usuarios, pedidos y pagos de src/lib/admin-data.ts).
 *
 *   npx prisma db seed            → catálogo + datos de ejemplo
 *   SEED_DEMO=false npx prisma db seed → solo catálogo
 *
 * Es idempotente: borra y vuelve a crear todo. NO usar contra producción con pedidos reales.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, type ImageKind, type PaymentMethod, type PaymentStatus, type ProductKind, type Size } from "../src/generated/prisma/client"
import type { SizeGuideKey } from "../src/lib/catalog"
import { SIZES, categories, offers, products, setsCategory, sizeGuides } from "../src/lib/catalog-data"
import { payments, stockBySlug, users } from "../src/lib/admin-data"

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
const withDemo = process.env.SEED_DEMO !== "false"

const kindMap: Record<string, ProductKind> = { prenda: "PRENDA", conjunto: "CONJUNTO", oferta: "OFERTA" }
const methodMap: Record<string, PaymentMethod> = { Yape: "YAPE", Plin: "PLIN", Transferencia: "TRANSFERENCIA" }
const paymentStatusMap: Record<string, PaymentStatus> = {
  pendiente: "PENDIENTE",
  verificado: "VERIFICADO",
  rechazado: "RECHAZADO",
}

/** "02/11/2026 09:00" → Date */
function parseDate(s: string) {
  const [d, m, rest] = s.split("/")
  const [y, time] = rest.split(" ")
  return new Date(`${y}-${m}-${d}T${time}:00-05:00`)
}

async function reset() {
  // Orden inverso a las dependencias
  await db.payment.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cartItem.deleteMany()
  await db.cart.deleteMany()
  await db.user.deleteMany()
  await db.contactMessage.deleteMany()
  await db.productVariant.deleteMany()
  await db.priceTier.deleteMany()
  await db.bundlePiece.deleteMany()
  await db.productImage.deleteMany()
  await db.productColor.deleteMany()
  await db.product.deleteMany()
  await db.sizeGuide.deleteMany()
  await db.color.deleteMany()
  await db.category.deleteMany()
}

async function seedCatalog() {
  // Categorías (incluye conjuntos y ofertas)
  const allCategories = [
    ...categories,
    setsCategory,
    {
      slug: "ofertas",
      name: "Ofertas",
      description: "Packs Shopping Days por tiempo limitado.",
      cover: offers[0]?.lifestyle[0] ?? "",
    },
  ]
  const categoryId = new Map<string, string>()
  for (const [i, c] of allCategories.entries()) {
    const row = await db.category.create({
      data: { slug: c.slug, name: c.name, description: c.description, coverUrl: c.cover, sortOrder: i },
    })
    categoryId.set(c.slug, row.id)
  }

  // Colores únicos de todo el catálogo
  const colorId = new Map<string, string>()
  for (const p of products) {
    for (const c of p.colors) {
      if (colorId.has(c.slug)) continue
      const row = await db.color.create({ data: { slug: c.slug, name: c.name, hex: c.hex } })
      colorId.set(c.slug, row.id)
    }
  }

  // Guías de tallas
  const guideId = new Map<string, string>()
  for (const [key, g] of Object.entries(sizeGuides)) {
    const row = await db.sizeGuide.create({ data: { key, title: g.title, columns: g.columns, rows: g.rows } })
    guideId.set(key as SizeGuideKey, row.id)
  }

  // Productos
  for (const [i, p] of products.entries()) {
    const totalStock = stockBySlug[p.slug] ?? 0
    const colorSlots = p.colors.length ? p.colors.map((c) => c.slug) : [null]
    const variantCount = colorSlots.length * SIZES.length
    const imageKind: ImageKind = p.kind === "oferta" ? "FLYER" : "LIFESTYLE"

    await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        kind: kindMap[p.kind],
        categoryId: categoryId.get(p.categorySlug)!,
        fit: p.fit,
        description: p.description,
        material: p.material,
        price: p.price,
        isNew: p.tags?.includes("nuevo") ?? false,
        isBestSeller: p.tags?.includes("mas-vendido") ?? false,
        sortOrder: i,
        sizeGuideId: p.sizeGuide ? guideId.get(p.sizeGuide) : undefined,
        images: {
          create: p.lifestyle.map((url, j) => ({ url, alt: p.name, kind: imageKind, sortOrder: j })),
        },
        colors: {
          create: p.colors.map((c, j) => ({ colorId: colorId.get(c.slug)!, imageUrl: c.image, sortOrder: j })),
        },
        tiers: { create: p.tiers.map((t) => ({ minQty: t.minQty, unitPrice: t.unitPrice })) },
        pieces: {
          create: (p.pieces ?? []).map((piece, j) => ({
            label: piece.label,
            options: piece.options ?? [],
            sortOrder: j,
          })),
        },
        // Stock de ejemplo repartido entre colores y tallas
        variants: {
          create: colorSlots.flatMap((slug, ci) =>
            SIZES.map((size, si) => ({
              colorId: slug ? colorId.get(slug) : undefined,
              size: size as Size,
              sku: [p.slug, slug ?? "unico", size].join("-").toUpperCase(),
              stock: Math.floor(totalStock / variantCount) + ((ci * SIZES.length + si) < totalStock % variantCount ? 1 : 0),
            })),
          ),
        },
      },
    })
  }

  console.log(
    `Catálogo: ${allCategories.length} categorías, ${colorId.size} colores, ${products.length} productos, ${guideId.size} guías de tallas`,
  )
}

async function seedDemo() {
  const userIds = new Map<string, string>()
  for (const u of users) {
    const [d, m, y] = u.joined.split("/")
    const row = await db.user.create({
      data: {
        email: u.email,
        name: u.name,
        phone: u.phone,
        city: u.city,
        role: u.role === "admin" ? "ADMIN" : "CLIENTE",
        isActive: u.active,
        createdAt: new Date(`${y}-${m}-${d}T12:00:00-05:00`),
      },
    })
    userIds.set(u.name, row.id)
  }
  const adminId = userIds.get(users.find((u) => u.role === "admin")!.name)

  // Un pedido por cada pago de ejemplo, con una línea de producto coherente con el monto
  const sellable = products.filter((p) => p.kind !== "oferta")
  for (const [i, pay] of payments.entries()) {
    const product = offers.find((o) => o.price === pay.amount) ?? sellable[i % sellable.length]
    const qty = product.kind === "oferta" ? 1 : pay.items
    const unitPrice = Math.round((pay.amount / qty) * 100) / 100
    const [first, ...rest] = pay.customer.split(" ")
    const createdAt = parseDate(pay.date)
    const status = paymentStatusMap[pay.status]

    await db.order.create({
      data: {
        number: pay.orderId,
        userId: userIds.get(pay.customer),
        status: status === "VERIFICADO" ? "PAGADO" : status === "RECHAZADO" ? "CANCELADO" : "PENDIENTE_PAGO",
        firstName: first,
        lastName: rest.join(" "),
        dni: String(40000000 + i * 1234567).slice(0, 8),
        phone: pay.phone,
        department: pay.destination.replace("Shalom ", ""),
        province: pay.destination.replace("Shalom ", ""),
        district: "Cercado",
        shalomAgency: pay.destination,
        subtotal: pay.amount,
        total: pay.amount,
        createdAt,
        items: {
          create: [
            {
              productId: (await db.product.findUniqueOrThrow({ where: { slug: product.slug } })).id,
              productName: product.name,
              colorName: product.colors[0]?.name,
              size: product.pieces ? undefined : "M",
              pieceSizes: product.pieces ? product.pieces.map(() => "M" as Size) : [],
              qty,
              regularPrice: product.price,
              unitPrice,
              total: pay.amount,
            },
          ],
        },
        payment: {
          create: {
            method: methodMap[pay.method],
            amount: pay.amount,
            status,
            createdAt,
            verifiedById: status === "PENDIENTE" ? undefined : adminId,
            verifiedAt: status === "PENDIENTE" ? undefined : createdAt,
          },
        },
      },
    })
  }

  console.log(`Demo: ${users.length} usuarios, ${payments.length} pedidos con pago`)
}

async function main() {
  await reset()
  await seedCatalog()
  if (withDemo) await seedDemo()
}

main()
  .then(() => console.log("Seed completado ✔"))
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
