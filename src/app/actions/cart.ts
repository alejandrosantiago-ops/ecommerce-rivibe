"use server"

import { randomUUID } from "node:crypto"
import { cookies } from "next/headers"

import { db } from "@/lib/db"
import { getProductsFresh } from "@/lib/data/catalog"
import { type CartLine, lineId } from "@/lib/pricing"
import { type LineInput, normalizeLine, stockError } from "@/lib/cart/validate"
import type { Size } from "@/lib/catalog"

const COOKIE = "rivibe_cart"
const MAX_AGE = 60 * 60 * 24 * 60 // 60 días

export type CartResult = { lines: CartLine[]; error?: string }

const cartInclude = { items: { include: { product: { select: { slug: true } } }, orderBy: { id: "asc" as const } } }

async function findCart() {
  const sessionId = (await cookies()).get(COOKIE)?.value
  if (!sessionId) return null
  return db.cart.findUnique({ where: { sessionId }, include: cartInclude })
}

async function findOrCreateCart() {
  const existing = await findCart()
  if (existing) return existing
  const sessionId = randomUUID()
  const cart = await db.cart.create({ data: { sessionId }, include: cartInclude })
  ;(await cookies()).set(COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  })
  return cart
}

type CartWithItems = NonNullable<Awaited<ReturnType<typeof findCart>>>

function itemToLine(item: CartWithItems["items"][number]): CartLine {
  const line = {
    slug: item.product.slug,
    colorSlug: item.colorSlug ?? undefined,
    size: (item.size ?? undefined) as Size | undefined,
    pieceSizes: item.pieceSizes.length ? (item.pieceSizes as Size[]) : undefined,
    pieceOptions: item.pieceOptions.length ? item.pieceOptions.map((o) => o || null) : undefined,
  }
  return { ...line, id: lineId(line), qty: item.qty }
}

const toLines = (cart: CartWithItems | null): CartLine[] => (cart ? cart.items.map(itemToLine) : [])

/** Busca el ítem de BD que corresponde a un id de línea */
const findItem = (cart: CartWithItems, id: string) => cart.items.find((i) => itemToLine(i).id === id)

/* ------------------------------- acciones ------------------------------- */

export async function getCart(): Promise<CartResult> {
  return { lines: toLines(await findCart()) }
}

export async function addToCart(input: LineInput): Promise<CartResult> {
  const [product] = await getProductsFresh([String(input.slug)])
  const { line, error } = normalizeLine(product, input)
  if (!line || !product) return { ...(await getCart()), error }

  const cart = await findOrCreateCart()
  const id = lineId(line)
  const existing = findItem(cart, id)
  const newQty = (existing?.qty ?? 0) + line.qty
  const outOfStock = stockError(product, line, newQty)
  if (outOfStock) return { lines: toLines(cart), error: outOfStock }

  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { qty: newQty } })
  } else {
    const productRow = await db.product.findUniqueOrThrow({ where: { slug: product.slug }, select: { id: true } })
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: productRow.id,
        colorSlug: line.colorSlug ?? null,
        size: line.size ?? null,
        pieceSizes: line.pieceSizes ?? [],
        pieceOptions: (line.pieceOptions ?? []).map((o) => o ?? ""),
        qty: line.qty,
      },
    })
  }
  return getCart()
}

export async function setLineQty(id: string, qty: number): Promise<CartResult> {
  const cart = await findCart()
  const item = cart && findItem(cart, id)
  if (!cart || !item) return getCart()

  if (!Number.isInteger(qty) || qty <= 0) {
    await db.cartItem.delete({ where: { id: item.id } })
    return getCart()
  }

  const line = itemToLine(item)
  const [product] = await getProductsFresh([line.slug])
  const { line: valid, error } = normalizeLine(product, { ...line, qty })
  if (!valid || !product) return { lines: toLines(cart), error }
  const outOfStock = stockError(product, valid, qty)
  if (outOfStock) return { lines: toLines(cart), error: outOfStock }

  await db.cartItem.update({ where: { id: item.id }, data: { qty } })
  return getCart()
}

export async function removeLine(id: string): Promise<CartResult> {
  const cart = await findCart()
  const item = cart && findItem(cart, id)
  if (item) await db.cartItem.delete({ where: { id: item.id } })
  return getCart()
}

export async function clearCart(): Promise<CartResult> {
  const cart = await findCart()
  if (cart) await db.cartItem.deleteMany({ where: { cartId: cart.id } })
  return { lines: [] }
}

/** Migra el carrito antiguo guardado en el navegador (localStorage) al carrito en BD */
export async function importLocalCart(lines: LineInput[]): Promise<CartResult> {
  if (!Array.isArray(lines)) return getCart()
  for (const l of lines.slice(0, 30)) await addToCart(l)
  return getCart()
}
