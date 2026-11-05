import { type Product, type Size, findProduct, nextTier, unitPriceFor } from "@/lib/catalog"

export type CartLine = {
  id: string
  slug: string
  colorSlug?: string
  /** Prendas: una talla */
  size?: Size
  /** Conjuntos y ofertas: una talla por pieza */
  pieceSizes?: Size[]
  /** Prenda elegida en piezas con opciones (índice alineado con `pieces`) */
  pieceOptions?: (string | null)[]
  qty: number
}

export const lineId = (l: Omit<CartLine, "id" | "qty">) =>
  [l.slug, l.colorSlug ?? "", l.size ?? "", (l.pieceSizes ?? []).join("-"), (l.pieceOptions ?? []).join("-")].join("|")

export type PricedLine = CartLine & {
  product: Product
  colorName?: string
  image: string
  unitPrice: number
  total: number
}

export type ProductGroup = {
  product: Product
  qty: number
  unitPrice: number
  regularTotal: number
  total: number
  next?: { minQty: number; unitPrice: number; missing: number }
}

/**
 * Regla de precio: el precio especial (+3 / +5 u.) se calcula sumando todas las
 * unidades del MISMO producto en el carrito, sin importar color ni talla.
 * Función pura: en la fase 3 se reutiliza en el servidor para validar el pedido.
 */
export function priceCart(lines: CartLine[], products: Product[]) {
  const getProduct = (slug: string) => findProduct(products, slug)
  const qtyBySlug = new Map<string, number>()
  for (const l of lines) qtyBySlug.set(l.slug, (qtyBySlug.get(l.slug) ?? 0) + l.qty)

  const priced: PricedLine[] = lines.flatMap((l) => {
    const product = getProduct(l.slug)
    if (!product) return []
    const color = product.colors.find((c) => c.slug === l.colorSlug)
    const unitPrice = unitPriceFor(product, qtyBySlug.get(l.slug) ?? l.qty)
    return [
      {
        ...l,
        product,
        colorName: color?.name,
        image: color?.image ?? product.lifestyle[0],
        unitPrice,
        total: unitPrice * l.qty,
      },
    ]
  })

  const groups: ProductGroup[] = [...qtyBySlug.entries()].flatMap(([slug, qty]) => {
    const product = getProduct(slug)
    if (!product) return []
    const unitPrice = unitPriceFor(product, qty)
    const n = nextTier(product, qty)
    return [
      {
        product,
        qty,
        unitPrice,
        regularTotal: product.price * qty,
        total: unitPrice * qty,
        next: n ? { ...n, missing: n.minQty - qty } : undefined,
      },
    ]
  })

  const units = priced.reduce((a, l) => a + l.qty, 0)
  const subtotal = priced.reduce((a, l) => a + l.total, 0)
  const regular = priced.reduce((a, l) => a + l.product.price * l.qty, 0)

  return { lines: priced, groups, units, subtotal, regular, savings: regular - subtotal }
}

export const describeLine = (
  l: Pick<PricedLine, "colorName" | "size" | "pieceSizes" | "pieceOptions" | "product">,
) => {
  const parts: string[] = []
  if (l.colorName) parts.push(l.colorName)
  if (l.size) parts.push(`Talla ${l.size}`)
  if (l.pieceSizes?.length && l.product.pieces) {
    parts.push(
      l.product.pieces.map((p, i) => `${l.pieceOptions?.[i] ?? p.label}: ${l.pieceSizes![i]}`).join(" · "),
    )
  }
  return parts.join(" · ")
}
