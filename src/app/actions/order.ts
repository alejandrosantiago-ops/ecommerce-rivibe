"use server"

import { randomInt } from "node:crypto"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"

import { db } from "@/lib/db"
import { CATALOG_TAG, getProductsFresh } from "@/lib/data/catalog"
import { priceCart } from "@/lib/pricing"
import { normalizeLine, stockError, variantDemand } from "@/lib/cart/validate"
import { DEPARTAMENTOS, PAYMENT_OPTIONS, isDni, isEmail, isPhone, normalizePhone } from "@/lib/peru"
import { getCart } from "@/app/actions/cart"
import type { PaymentMethod } from "@/generated/prisma/client"

export type CheckoutState = {
  ok?: boolean
  order?: { number: string; total: number; method: string; firstName: string }
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

const FIELDS = [
  "nombres", "apellidos", "dni", "celular", "email", "departamento", "provincia", "distrito", "agencia", "notas", "pago",
] as const

class OutOfStockError extends Error {}

/** RV-AAMMDD-XXXX (zona horaria de Lima) */
function orderNumber() {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace(/-/g, "")
  return `RV-${ymd}-${String(randomInt(0, 10000)).padStart(4, "0")}`
}

export async function createOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "").trim()])) as Record<
    (typeof FIELDS)[number],
    string
  >

  // Campo trampa para bots (oculto para personas)
  if (String(formData.get("website") ?? "")) return { error: "No se pudo procesar el pedido.", values }

  /* ---------------------------- validación ---------------------------- */
  const fieldErrors: Record<string, string> = {}
  if (values.nombres.length < 2) fieldErrors.nombres = "Ingresa tus nombres."
  if (values.apellidos.length < 2) fieldErrors.apellidos = "Ingresa tus apellidos."
  if (!isDni(values.dni)) fieldErrors.dni = "El DNI debe tener 8 dígitos."
  if (!isPhone(values.celular)) fieldErrors.celular = "Ingresa un celular de 9 dígitos que empiece con 9."
  if (values.email && !isEmail(values.email)) fieldErrors.email = "Correo inválido."
  if (!DEPARTAMENTOS.includes(values.departamento)) fieldErrors.departamento = "Elige un departamento."
  if (values.provincia.length < 2) fieldErrors.provincia = "Ingresa la provincia."
  if (values.distrito.length < 2) fieldErrors.distrito = "Ingresa el distrito."
  if (values.agencia.length < 3) fieldErrors.agencia = "Indica la agencia Shalom de destino."
  const payment = PAYMENT_OPTIONS.find((p) => p.value === values.pago && !("disabled" in p && p.disabled))
  if (!payment) fieldErrors.pago = "Elige un método de pago."
  if (formData.get("terminos") !== "on") fieldErrors.terminos = "Debes aceptar los términos."
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, error: "Revisa los datos marcados." }

  /* --------------------- carrito con datos frescos --------------------- */
  const { lines } = await getCart()
  if (!lines.length) return { error: "Tu carrito está vacío.", values }

  const products = await getProductsFresh(lines.map((l) => l.slug))
  for (const l of lines) {
    const product = products.find((p) => p.slug === l.slug)
    const { line, error } = normalizeLine(product, l)
    if (!line || !product) return { error: error ?? "Un producto de tu carrito ya no está disponible.", values }
  }
  // Stock total por variante (varias líneas pueden usar la misma prenda)
  for (const d of variantDemand(lines, products)) {
    const product = products.find((p) => p.slug === d.slug)!
    const err = stockError(product, { slug: d.slug, colorSlug: d.colorSlug, size: d.size, qty: d.qty }, d.qty)
    if (err) return { error: err, values }
  }

  const priced = priceCart(lines, products)

  /* ------------------------- transacción ------------------------- */
  const sessionId = (await cookies()).get("rivibe_cart")?.value
  const productIds = new Map(
    (await db.product.findMany({ where: { slug: { in: products.map((p) => p.slug) } }, select: { id: true, slug: true } })).map(
      (p) => [p.slug, p.id],
    ),
  )
  const colorIds = new Map((await db.color.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]))

  let number = ""
  try {
    await db.$transaction(async (tx) => {
      // Descuento atómico: solo si hay stock suficiente en ese instante
      for (const d of variantDemand(lines, products)) {
        const product = products.find((p) => p.slug === d.slug)!
        const { count } = await tx.productVariant.updateMany({
          where: {
            productId: productIds.get(d.slug)!,
            colorId: product.colors.length ? colorIds.get(d.colorSlug!) : null,
            size: d.size,
            stock: { gte: d.qty },
          },
          data: { stock: { decrement: d.qty } },
        })
        if (count === 0) throw new OutOfStockError(`${product.name}: se agotó mientras comprabas.`)
      }

      for (let attempt = 0; attempt < 5; attempt++) {
        number = orderNumber()
        if (!(await tx.order.findUnique({ where: { number }, select: { id: true } }))) break
      }

      await tx.order.create({
        data: {
          number,
          firstName: values.nombres,
          lastName: values.apellidos,
          dni: values.dni,
          phone: normalizePhone(values.celular),
          email: values.email || null,
          department: values.departamento,
          province: values.provincia,
          district: values.distrito,
          shalomAgency: values.agencia,
          notes: values.notas || null,
          subtotal: priced.regular,
          discount: priced.savings,
          total: priced.subtotal,
          items: {
            create: priced.lines.map((l) => ({
              productId: productIds.get(l.slug)!,
              productName: l.product.name,
              colorName: l.colorName ?? null,
              size: l.size ?? null,
              pieceSizes: l.pieceSizes ?? [],
              pieceOptions: (l.pieceOptions ?? []).map((o) => o ?? ""),
              qty: l.qty,
              regularPrice: l.product.price,
              unitPrice: l.unitPrice,
              total: l.total,
            })),
          },
          payment: { create: { method: payment!.value as PaymentMethod, amount: priced.subtotal } },
        },
      })

      if (sessionId) {
        const cart = await tx.cart.findUnique({ where: { sessionId }, select: { id: true } })
        if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      }
    })
  } catch (e) {
    if (e instanceof OutOfStockError) return { error: e.message, values }
    console.error("createOrder", e)
    return { error: "No pudimos registrar tu pedido. Inténtalo de nuevo o escríbenos por WhatsApp.", values }
  }

  // El stock cambió: la tienda se actualiza en la próxima visita
  revalidateTag(CATALOG_TAG, "max")

  return {
    ok: true,
    order: { number, total: priced.subtotal, method: payment!.label, firstName: values.nombres.split(" ")[0] },
  }
}
