"use client"

import { useState } from "react"
import Link from "next/link"

import { type Product, type Size, colorInStock, productHref, stockFor, totalStock } from "@/lib/catalog"
import { addToCart } from "@/lib/cart-store"
import { cn } from "@/lib/utils"

/** Agregar al carrito desde el catálogo: color + talla + botón */
export function QuickAdd({ product }: { product: Product }) {
  const firstInStock = product.colors.find((c) => colorInStock(product, c.slug)) ?? product.colors[0]
  const [color, setColor] = useState(firstInStock?.slug)
  const [size, setSize] = useState<Size | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Conjuntos/ofertas requieren talla por pieza: se eligen en la ficha
  if (product.pieces) {
    return (
      <Link
        href={productHref(product)}
        className="mt-3 inline-flex h-8 items-center justify-center rounded-md border border-carbon-ink text-[12px] font-medium tracking-label uppercase hover:bg-carbon-ink hover:text-white"
      >
        Elegir tallas
      </Link>
    )
  }

  if (totalStock(product) === 0) {
    return <p className="mt-3 text-[12px] text-smoke-charcoal">Agotado por ahora</p>
  }

  const colorName = product.colors.find((c) => c.slug === color)?.name
  const available = (s: Size) => (stockFor(product, color, s) ?? 1) > 0

  const add = async () => {
    if (!size || busy) return
    setBusy(true)
    setError(null)
    const result = await addToCart({ slug: product.slug, colorSlug: color, size, qty: 1 })
    setBusy(false)
    if (!result.ok) setError(result.error ?? "No se pudo agregar.")
  }

  return (
    <div className="mt-3 space-y-2.5">
      {product.colors.length > 0 && (
        <div>
          <p className="mb-1.5 text-micro text-smoke-charcoal">{colorName}</p>
          <div className="flex flex-wrap gap-1">
            {product.colors.map((c) => {
              const inStock = colorInStock(product, c.slug)
              return (
                <button
                  key={c.slug}
                  type="button"
                  title={inStock ? c.name : `${c.name} (agotado)`}
                  aria-label={inStock ? c.name : `${c.name}, agotado`}
                  aria-pressed={c.slug === color}
                  onClick={() => {
                    setColor(c.slug)
                    setError(null)
                    if (size && (stockFor(product, c.slug, size) ?? 1) === 0) setSize(null)
                  }}
                  className={cn(
                    "relative size-5 p-px",
                    c.slug === color ? "border border-carbon-ink" : "border border-transparent hover:border-stone-gray",
                  )}
                >
                  <span className="block size-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  {!inStock && <span aria-hidden className="pointer-events-none absolute inset-0 sold-out-slash" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div className="flex gap-1.5">
        {product.sizes.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={size === s}
            aria-label={available(s) ? `Talla ${s}` : `Talla ${s}, agotada`}
            disabled={!available(s)}
            onClick={() => {
              setSize(s)
              setError(null)
            }}
            className={cn(
              "h-8 flex-1 rounded-md border text-[12px] font-medium",
              size === s ? "border-carbon-ink bg-carbon-ink text-white" : "border-stone-gray hover:border-carbon-ink",
              "disabled:cursor-not-allowed disabled:border-soft-mist disabled:text-stone-gray disabled:line-through",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!size || busy}
        onClick={add}
        className="h-9 w-full rounded-md bg-carbon-ink text-[12px] font-medium tracking-label text-white uppercase transition-opacity hover:opacity-80 disabled:bg-soft-mist disabled:text-smoke-charcoal"
      >
        {busy ? "Agregando…" : size ? "Agregar al carrito" : "Elige tu talla"}
      </button>
      {error && (
        <p role="alert" className="text-[11px] leading-snug text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  )
}
