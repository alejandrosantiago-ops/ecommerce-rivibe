"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePlus, Pencil, Plus } from "lucide-react"

import { type Product, SIZES, formatPrice, isLifestyle, productImages } from "@/lib/catalog"
// Fase 5: reemplazar por datos de PostgreSQL (con productos inactivos y stock real)
import { categories, products } from "@/lib/catalog-data"
import { stockBySlug } from "@/lib/admin-data"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CategoryTabs } from "@/components/product/category-tabs"
import { AdminPageHeader, Panel, td, th } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

const kinds = [
  { value: "todos", label: "Todos" },
  { value: "prenda", label: "Prendas" },
  { value: "conjunto", label: "Conjuntos" },
  { value: "oferta", label: "Ofertas" },
]

const inputCls =
  "mt-1.5 h-10 w-full rounded-md border border-stone-gray bg-white px-3 text-[13px] focus:border-carbon-ink focus:outline-none"

export function ProductsAdmin() {
  const [kind, setKind] = useState("todos")
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<Product | "nuevo" | null>(null)

  const list = products.filter(
    (p) => (kind === "todos" || p.kind === kind) && p.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description={`${products.length} productos · precios, colores, tallas y stock`}
        actions={
          <button type="button" onClick={() => setEditing("nuevo")} className={cn(buttonVariants({ size: "cta" }))}>
            <Plus className="size-4" /> Nuevo producto
          </button>
        }
      />

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soft-mist px-4 py-3">
          <CategoryTabs
            items={kinds.map((k) => ({ ...k, active: k.value === kind, onSelect: () => setKind(k.value) }))}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            className="h-9 w-full rounded-md border border-stone-gray px-3 text-[13px] focus:border-carbon-ink focus:outline-none sm:w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-soft-mist">
              <tr>
                <th className={th}>Producto</th>
                <th className={th}>Sección</th>
                <th className={cn(th, "text-right")}>Precio</th>
                <th className={cn(th, "text-right")}>+3 u.</th>
                <th className={cn(th, "text-right")}>+5 u.</th>
                <th className={th}>Colores</th>
                <th className={cn(th, "text-right")}>Stock</th>
                <th className={th}>Estado</th>
                <th className={th}><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-mist">
              {list.map((p) => {
                const { primary } = productImages(p)
                const stock = stockBySlug[p.slug] ?? 0
                const t3 = p.tiers.find((t) => t.minQty === 3)
                const t5 = p.tiers.find((t) => t.minQty === 5)
                return (
                  <tr key={p.slug} className="hover:bg-warm-fog/50">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-9 shrink-0 bg-white">
                          <Image
                            src={primary}
                            alt=""
                            fill
                            sizes="36px"
                            className={isLifestyle(p, primary) ? "object-cover" : "object-contain"}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-[11px] text-smoke-charcoal">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>
                      {categories.find((c) => c.slug === p.categorySlug)?.name ?? (p.kind === "conjunto" ? "Conjuntos" : "Ofertas")}
                    </td>
                    <td className={cn(td, "text-right tabular-nums")}>{formatPrice(p.price)}</td>
                    <td className={cn(td, "text-right tabular-nums")}>{t3 ? formatPrice(t3.unitPrice) : "—"}</td>
                    <td className={cn(td, "text-right tabular-nums")}>{t5 ? formatPrice(t5.unitPrice) : "—"}</td>
                    <td className={td}>
                      <div className="flex items-center gap-0.5">
                        {p.colors.slice(0, 6).map((c) => (
                          <span key={c.slug} title={c.name} className="size-3 border border-black/15" style={{ background: c.hex }} />
                        ))}
                        {p.colors.length > 6 && <span className="pl-1 text-[11px] text-smoke-charcoal">+{p.colors.length - 6}</span>}
                        {p.colors.length === 0 && <span className="text-smoke-charcoal">—</span>}
                      </div>
                    </td>
                    <td className={cn(td, "text-right tabular-nums", stock === 0 && "text-[#d03b3b]")}>
                      {stock === 0 ? "Agotado" : stock}
                    </td>
                    <td className={td}>
                      <span className="inline-flex items-center gap-1.5 text-[12px]">
                        <span className="size-1.5 rounded-full" style={{ background: stock > 0 ? "#0ca30c" : "#cccccc" }} aria-hidden />
                        {stock > 0 ? "Publicado" : "Oculto"}
                      </span>
                    </td>
                    <td className={cn(td, "text-right")}>
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        aria-label={`Editar ${p.name}`}
                        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist"
                      >
                        <Pencil className="size-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-xl">
          {editing !== null && <ProductForm product={editing === "nuevo" ? null : editing} onClose={() => setEditing(null)} />}
        </SheetContent>
      </Sheet>
    </>
  )
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const t3 = product?.tiers.find((t) => t.minQty === 3)?.unitPrice
  const t5 = product?.tiers.find((t) => t.minQty === 5)?.unitPrice
  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-carbon-ink px-5">
        <SheetTitle className="label-caps">{product ? "Editar producto" : "Nuevo producto"}</SheetTitle>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto p-5 text-[13px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label-caps">Nombre</span>
            <input defaultValue={product?.name} required className={inputCls} />
          </label>
          <label>
            <span className="label-caps">Tipo</span>
            <select defaultValue={product?.kind ?? "prenda"} className={inputCls}>
              <option value="prenda">Prenda</option>
              <option value="conjunto">Conjunto</option>
              <option value="oferta">Oferta Shopping Days</option>
            </select>
          </label>
          <label>
            <span className="label-caps">Sección</span>
            <select defaultValue={product?.categorySlug ?? "polos"} className={inputCls}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
              <option value="conjuntos">Conjuntos</option>
              <option value="ofertas">Ofertas</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="label-caps">Descripción</span>
            <textarea
              defaultValue={product?.description}
              className="mt-1.5 min-h-20 w-full rounded-md border border-stone-gray px-3 py-2 focus:border-carbon-ink focus:outline-none"
            />
          </label>
        </div>

        <fieldset className="border-t border-soft-mist pt-5">
          <legend className="label-caps">Precios (S/)</legend>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <label>
              <span className="text-[12px] text-smoke-charcoal">Unitario</span>
              <input type="number" step="0.01" defaultValue={product?.price} className={inputCls} />
            </label>
            <label>
              <span className="text-[12px] text-smoke-charcoal">Desde 3 u.</span>
              <input type="number" step="0.01" defaultValue={t3} placeholder="—" className={inputCls} />
            </label>
            <label>
              <span className="text-[12px] text-smoke-charcoal">Desde 5 u.</span>
              <input type="number" step="0.01" defaultValue={t5} placeholder="—" className={inputCls} />
            </label>
          </div>
          <p className="mt-2 text-[12px] text-smoke-charcoal">Se aplican por unidades del mismo producto, sin importar color ni talla.</p>
        </fieldset>

        <fieldset className="border-t border-soft-mist pt-5">
          <legend className="label-caps">Colores</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(product?.colors ?? []).map((c) => (
              <span key={c.slug} className="inline-flex items-center gap-1.5 border border-stone-gray px-2 py-1 text-[12px]">
                <span className="size-3 border border-black/15" style={{ background: c.hex }} /> {c.name}
              </span>
            ))}
            <button type="button" className="inline-flex items-center gap-1 border border-dashed border-stone-gray px-2 py-1 text-[12px] hover:border-carbon-ink">
              <Plus className="size-3" /> Agregar color
            </button>
          </div>
        </fieldset>

        <fieldset className="border-t border-soft-mist pt-5">
          <legend className="label-caps">Stock por talla</legend>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {SIZES.map((s) => (
              <label key={s}>
                <span className="text-[12px] text-smoke-charcoal">Talla {s}</span>
                <input type="number" min={0} defaultValue={product ? Math.round((stockBySlug[product.slug] ?? 0) / 3) : 0} className={inputCls} />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-t border-soft-mist pt-5">
          <legend className="label-caps">Imágenes</legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(product ? [...product.lifestyle, ...product.colors.flatMap((c) => (c.image ? [c.image] : []))].slice(0, 7) : []).map((src) => (
              <div key={src} className="relative aspect-[3/4] border border-soft-mist bg-white">
                <Image src={src} alt="" fill sizes="100px" className="object-contain" />
              </div>
            ))}
            <button
              type="button"
              className="flex aspect-[3/4] flex-col items-center justify-center gap-1 border border-dashed border-stone-gray text-[11px] text-smoke-charcoal hover:border-carbon-ink"
            >
              <ImagePlus className="size-5" strokeWidth={1.25} /> Subir
            </button>
          </div>
        </fieldset>

        <label className="flex items-center gap-3 border-t border-soft-mist pt-5">
          <input type="checkbox" defaultChecked className="size-4 accent-black" />
          Publicado en la tienda
        </label>
      </div>
      <div className="flex gap-2 border-t border-carbon-ink p-5">
        <button type="button" onClick={onClose} className={cn(buttonVariants({ variant: "ink", size: "cta" }), "flex-1")}>
          Cancelar
        </button>
        <button type="submit" className={cn(buttonVariants({ size: "cta" }), "flex-1")}>
          Guardar
        </button>
      </div>
    </form>
  )
}
