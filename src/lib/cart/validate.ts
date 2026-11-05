import { type Product, type Size, SIZES, lineStock, stockKey } from "@/lib/catalog"
import type { CartLine } from "@/lib/pricing"

export const MAX_QTY_PER_LINE = 50

/** Entrada de una línea tal como llega del navegador (no confiable) */
export type LineInput = Omit<CartLine, "id">

const isSize = (s: unknown): s is Size => typeof s === "string" && (SIZES as string[]).includes(s)

/**
 * Normaliza y valida una línea contra el producto (color, tallas por pieza, opciones, cantidad).
 * Devuelve la línea limpia o un mensaje de error para mostrar al cliente.
 */
export function normalizeLine(product: Product | undefined, input: LineInput): { line?: LineInput; error?: string } {
  if (!product) return { error: "Este producto ya no está disponible." }

  const qty = Number(input.qty)
  if (!Number.isInteger(qty) || qty < 1) return { error: "Cantidad inválida." }
  if (qty > MAX_QTY_PER_LINE) return { error: `Máximo ${MAX_QTY_PER_LINE} unidades por línea. Escríbenos para pedidos mayores.` }

  let colorSlug: string | undefined
  if (product.colors.length) {
    if (!product.colors.some((c) => c.slug === input.colorSlug)) return { error: "Elige un color disponible." }
    colorSlug = input.colorSlug
  }

  if (product.pieces?.length) {
    const sizes = input.pieceSizes ?? []
    if (sizes.length !== product.pieces.length || !sizes.every(isSize)) return { error: "Elige la talla de cada prenda." }
    const options = product.pieces.map((piece, i) => {
      if (!piece.options) return null
      const chosen = input.pieceOptions?.[i]
      return chosen && piece.options.includes(chosen) ? chosen : undefined
    })
    if (options.includes(undefined)) return { error: "Elige una de las opciones del pack." }
    const hasOptions = product.pieces.some((p) => p.options)
    return {
      line: {
        slug: product.slug,
        colorSlug,
        pieceSizes: sizes,
        pieceOptions: hasOptions ? (options as (string | null)[]) : undefined,
        qty,
      },
    }
  }

  if (!isSize(input.size)) return { error: "Elige una talla." }
  return { line: { slug: product.slug, colorSlug, size: input.size, qty } }
}

/** Mensaje si la cantidad pedida supera el stock disponible de la línea */
export function stockError(product: Product, line: LineInput, qty: number) {
  const available = lineStock(product, line)
  if (available === undefined || qty <= available) return undefined
  if (available <= 0) return `${product.name}: agotado en esa combinación de color y talla.`
  return available === 1
    ? `${product.name}: solo queda 1 disponible en esa combinación.`
    : `${product.name}: solo quedan ${available} disponibles en esa combinación.`
}

/**
 * Unidades que consume cada variante (producto + color + talla).
 * Los conjuntos y ofertas consumen una unidad por pieza.
 */
export function variantDemand(lines: LineInput[], products: Product[]) {
  const demand = new Map<string, { slug: string; colorSlug?: string; size: Size; qty: number }>()
  for (const l of lines) {
    const product = products.find((p) => p.slug === l.slug)
    if (!product) continue
    const sizes = product.pieces?.length ? (l.pieceSizes ?? []) : l.size ? [l.size] : []
    for (const size of sizes) {
      const key = `${l.slug}#${stockKey(product.colors.length ? l.colorSlug : "", size)}`
      const prev = demand.get(key)
      demand.set(key, { slug: l.slug, colorSlug: l.colorSlug, size, qty: (prev?.qty ?? 0) + l.qty })
    }
  }
  return [...demand.values()]
}
