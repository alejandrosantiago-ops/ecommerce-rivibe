"use client"

import { useEffect, useMemo } from "react"

import { createStore } from "@/lib/store"
import { type CartLine, lineId, priceCart } from "@/lib/pricing"
import { useCatalog } from "@/components/catalog-provider"
import * as actions from "@/app/actions/cart"

/**
 * Carrito del navegador sincronizado con la BD (tabla Cart, cookie de sesión).
 * Los cambios se ven al instante (optimista) y luego el servidor confirma:
 * su respuesta siempre reemplaza al estado local, así precio y stock los decide el servidor.
 */
type CartState = { lines: CartLine[]; ready: boolean; error?: string }

const cart = createStore<CartState>({ lines: [], ready: false })
const favorites = createStore<string[]>([], "rivibe:favorites")
/** Estado de UI: panel del carrito abierto */
export const cartUi = createStore({ open: false })

const LEGACY_KEY = "rivibe:cart"
let loading: Promise<void> | null = null
/** Las operaciones se encadenan para que las respuestas no lleguen desordenadas */
let queue: Promise<unknown> = Promise.resolve()

function apply(result: actions.CartResult) {
  cart.set({ lines: result.lines, ready: true, error: result.error })
  return { ok: !result.error, error: result.error }
}

function run(optimistic: (lines: CartLine[]) => CartLine[], call: () => Promise<actions.CartResult>) {
  cart.set((s) => ({ ...s, lines: optimistic(s.lines), error: undefined }))
  const next = queue.then(call).then(apply, () =>
    apply({ lines: cart.get().lines, error: "No pudimos actualizar tu carrito. Revisa tu conexión." }),
  )
  queue = next
  return next
}

export function loadCart() {
  loading ??= (async () => {
    let result = await actions.getCart().catch(() => ({ lines: [] as CartLine[] }))
    // Migración única del carrito que antes vivía solo en el navegador
    try {
      const legacy = window.localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        window.localStorage.removeItem(LEGACY_KEY)
        const old = JSON.parse(legacy) as CartLine[]
        if (Array.isArray(old) && old.length && !result.lines.length) {
          // El servidor recalcula el id de cada línea; se envía tal cual
          result = await actions.importLocalCart(old)
        }
      }
    } catch {
      /* almacenamiento no disponible */
    }
    apply(result)
  })()
  return loading
}

export function addToCart(line: Omit<CartLine, "id">) {
  const id = lineId(line)
  cartUi.set({ open: true })
  return run(
    (lines) =>
      lines.some((l) => l.id === id)
        ? lines.map((l) => (l.id === id ? { ...l, qty: l.qty + line.qty } : l))
        : [...lines, { ...line, id }],
    () => actions.addToCart(line),
  )
}

export const setLineQty = (id: string, qty: number) =>
  run(
    (lines) => (qty <= 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { ...l, qty } : l))),
    () => actions.setLineQty(id, qty),
  )

export const removeLine = (id: string) =>
  run((lines) => lines.filter((l) => l.id !== id), () => actions.removeLine(id))

export const clearCart = () => run(() => [], () => actions.clearCart())

/** Tras confirmar un pedido el servidor ya vació el carrito: solo sincroniza el estado local */
export const resetLocalCart = () => cart.set({ lines: [], ready: true })

export const dismissCartError = () => cart.set((s) => ({ ...s, error: undefined }))

function useCartState() {
  const state = cart.useStore()
  useEffect(() => {
    void loadCart()
  }, [])
  return state
}

export function useCart() {
  const { lines, ready, error } = useCartState()
  const { products } = useCatalog()
  return useMemo(() => ({ ...priceCart(lines, products), ready, error }), [lines, products, ready, error])
}

/** Unidades de un producto que ya están en el carrito (para mostrar el precio por volumen en la ficha) */
export function useQtyInCart(slug: string) {
  const { lines } = useCartState()
  return lines.filter((l) => l.slug === slug).reduce((a, l) => a + l.qty, 0)
}

export const useFavorites = favorites.useStore
export const toggleFavorite = (slug: string) =>
  favorites.set((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
