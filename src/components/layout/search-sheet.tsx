"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"

import { formatPrice, isLifestyle, productImages } from "@/lib/catalog"
import { useCatalog } from "@/components/catalog-provider"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const suggestions = ["Polo oversized", "Boxy fit", "Jogger", "Hoodie", "Conjunto"]

export function SearchSheet({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { products, categories, setsCategory } = useCatalog()

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return []
    return products.filter((p) =>
      normalize(
        [
          p.name,
          p.fit,
          [...categories, setsCategory].find((c) => c.slug === p.categorySlug)?.name ?? "",
          p.kind,
          ...p.colors.map((c) => c.name),
        ].join(" "),
      ).includes(q),
    )
  }, [query, products, categories, setsCategory])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label="Buscar" className={triggerClassName}>
        <Search className="size-[18px]" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent side="top" className="max-h-[85svh] gap-0 rounded-none border-carbon-ink shadow-none">
        <SheetTitle className="sr-only">Buscar productos</SheetTitle>
        <div className="page-container pt-6 pb-4">
          <label className="flex items-center gap-3 border-b border-carbon-ink pb-3">
            <Search className="size-5 shrink-0" strokeWidth={1.5} />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar polos, joggers, conjuntos, colores…"
              className="w-full bg-transparent text-heading outline-none placeholder:text-smoke-charcoal/60"
            />
          </label>
        </div>

        <div className="page-container overflow-y-auto pb-8">
          {!query && (
            <div className="flex flex-wrap items-center gap-2 text-caption">
              <span className="text-smoke-charcoal">Sugerencias:</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="border border-stone-gray px-2.5 py-1 hover:border-carbon-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <p className="py-6 text-body text-smoke-charcoal">No encontramos resultados para “{query}”.</p>
          )}

          {results.length > 0 && (
            <>
              <p className="mb-4 text-caption text-smoke-charcoal">{results.length} resultado(s)</p>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
                {results.map((p) => {
                  const { primary } = productImages(p)
                  return (
                    <li key={p.slug}>
                      <Link href={`/producto/${p.slug}`} onClick={() => setOpen(false)} className="group block">
                        <div className="relative aspect-[3/4] bg-white">
                          <Image
                            src={primary}
                            alt={p.name}
                            fill
                            sizes="200px"
                            className={isLifestyle(p, primary) ? "object-cover" : "object-contain p-2"}
                          />
                        </div>
                        <p className="mt-2 text-caption group-hover:underline">{p.name}</p>
                        <p className="text-caption text-smoke-charcoal">{formatPrice(p.price)}</p>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
