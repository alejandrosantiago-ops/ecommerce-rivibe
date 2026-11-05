"use client"

import { type ReactNode, useMemo, useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"

import { type Product, lowestPrice, totalStock } from "@/lib/catalog"
import { ProductGrid } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

const sorts = {
  destacados: { label: "Destacados", fn: () => 0 },
  "precio-asc": { label: "Precio: menor a mayor", fn: (a: Product, b: Product) => a.price - b.price },
  "precio-desc": { label: "Precio: mayor a menor", fn: (a: Product, b: Product) => b.price - a.price },
  volumen: { label: "Mejor precio por volumen", fn: (a: Product, b: Product) => lowestPrice(a) - lowestPrice(b) },
} as const
type SortKey = keyof typeof sorts

const PRICE_CAPS = [40, 70, 100, 150]

export function SortableGrid({
  products,
  quickAdd,
  tabs,
}: {
  products: Product[]
  quickAdd?: boolean
  tabs?: ReactNode
}) {
  const [sort, setSort] = useState<SortKey>("destacados")
  const [showFilters, setShowFilters] = useState(false)
  const [colors, setColors] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [inStockOnly, setInStockOnly] = useState(false)

  // Colores presentes en esta lista (sin repetir)
  const colorOptions = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; hex: string; count: number }>()
    for (const p of products)
      for (const c of p.colors) {
        const prev = map.get(c.slug)
        map.set(c.slug, { slug: c.slug, name: c.name, hex: c.hex, count: (prev?.count ?? 0) + 1 })
      }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [products])

  const activeCount = colors.length + (maxPrice ? 1 : 0) + (inStockOnly ? 1 : 0)
  const clear = () => {
    setColors([])
    setMaxPrice(null)
    setInStockOnly(false)
  }

  const visible = products
    .filter((p) => !colors.length || p.colors.some((c) => colors.includes(c.slug)))
    // El precio que cuenta es el mejor alcanzable (por volumen)
    .filter((p) => !maxPrice || lowestPrice(p) <= maxPrice)
    .filter((p) => !inStockOnly || (totalStock(p) ?? 1) > 0)
    .sort(sorts[sort].fn)

  return (
    <>
      <div className="sticky top-(--header-h) z-20 -mx-4 border-y border-carbon-ink bg-white px-4 py-2 md:mx-0 md:px-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {tabs ?? <span className="label-caps">Todos los productos</span>}
          <div className="flex shrink-0 items-center gap-4">
            <span className="text-caption text-smoke-charcoal" aria-live="polite">
              {visible.length} productos
            </span>
            <button
              type="button"
              aria-expanded={showFilters}
              aria-controls="filters"
              onClick={() => setShowFilters((s) => !s)}
              className="label-caps inline-flex items-center gap-1.5"
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={1.5} /> Filtrar
              {activeCount > 0 && (
                <span className="flex size-4 items-center justify-center bg-carbon-ink text-[9px] text-white">{activeCount}</span>
              )}
            </button>
            <label className="flex items-center gap-2">
              <span className="label-caps sr-only sm:not-sr-only">Ordenar</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-8 rounded-md border border-stone-gray bg-white px-2 text-caption focus:border-carbon-ink focus:outline-none"
              >
                {Object.entries(sorts).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {showFilters && (
          <div id="filters" className="mt-2 grid gap-5 border-t border-soft-mist pt-4 pb-2 md:grid-cols-[1fr_auto_auto]">
            {colorOptions.length > 0 && (
              <fieldset>
                <legend className="label-caps mb-2">Color</legend>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((c) => {
                    const on = colors.includes(c.slug)
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setColors((prev) => (on ? prev.filter((s) => s !== c.slug) : [...prev, c.slug]))}
                        className={cn(
                          "inline-flex h-7 items-center gap-1.5 border px-2 text-[12px]",
                          on ? "border-carbon-ink bg-carbon-ink text-white" : "border-stone-gray hover:border-carbon-ink",
                        )}
                      >
                        <span className="size-3 border border-black/15" style={{ backgroundColor: c.hex }} />
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}
            <fieldset>
              <legend className="label-caps mb-2">Precio desde (por volumen)</legend>
              <div className="flex flex-wrap gap-1.5">
                {PRICE_CAPS.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    aria-pressed={maxPrice === cap}
                    onClick={() => setMaxPrice(maxPrice === cap ? null : cap)}
                    className={cn(
                      "h-7 border px-2 text-[12px]",
                      maxPrice === cap ? "border-carbon-ink bg-carbon-ink text-white" : "border-stone-gray hover:border-carbon-ink",
                    )}
                  >
                    Hasta S/ {cap}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col justify-between gap-3">
              <label className="flex items-center gap-2 text-[12px]">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="size-4 accent-black" />
                Solo con stock
              </label>
              {activeCount > 0 && (
                <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-[12px] underline underline-offset-2">
                  <X className="size-3" /> Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {visible.length > 0 ? (
        <ProductGrid products={visible} quickAdd={quickAdd} className="pt-8" eager />
      ) : (
        <div className="py-24 text-center">
          <p className="text-body text-smoke-charcoal">No hay productos con esos filtros.</p>
          {activeCount > 0 && (
            <button type="button" onClick={clear} className="mt-3 text-caption underline underline-offset-2">
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </>
  )
}
