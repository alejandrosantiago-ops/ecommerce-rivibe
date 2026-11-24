"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react"

import { SIZES, formatPrice } from "@/lib/catalog"
import { type AdminCatalog, type AdminProduct, adminStockKey } from "@/lib/admin-types"
import { type ProductInput, createColor, deleteProduct, reorderProducts, saveProduct } from "@/app/actions/admin/catalog"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CategoryTabs } from "@/components/product/category-tabs"
import { AdminPageHeader, Panel, td, th } from "@/components/admin/ui"
import { Field, Fieldset, FormError, ImageField, ImageListField, inputCls, slugify, textareaCls } from "@/components/admin/form"
import { cn } from "@/lib/utils"

const kinds = [
  { value: "todos", label: "Todos" },
  { value: "PRENDA", label: "Prendas" },
  { value: "CONJUNTO", label: "Conjuntos" },
  { value: "OFERTA", label: "Ofertas" },
]

const totalStock = (p: AdminProduct) => Object.values(p.stock).reduce((a, n) => a + n, 0)

export function ProductsAdmin({ catalog }: { catalog: AdminCatalog }) {
  const router = useRouter()
  const [kind, setKind] = useState("todos")
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<AdminProduct | "nuevo" | null>(null)
  const [colors, setColors] = useState(catalog.colors)
  const [pending, startTransition] = useTransition()
  const [notice, setNotice] = useState<string | null>(null)

  const { products, categories } = catalog
  const filtering = kind !== "todos" || query !== ""
  const list = products.filter(
    (p) => (kind === "todos" || p.kind === kind) && `${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase()),
  )

  const move = (index: number, dir: -1 | 1) => {
    const ids = products.map((p) => p.id)
    const j = index + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    startTransition(async () => {
      await reorderProducts(ids)
      router.refresh()
    })
  }

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description={`${products.length} productos · precios, fotos, colores, tallas y stock`}
        actions={
          <button type="button" onClick={() => setEditing("nuevo")} className={cn(buttonVariants({ size: "cta" }))}>
            <Plus className="size-4" /> Nuevo producto
          </button>
        }
      />

      {notice && (
        <p role="status" className="mb-3 flex items-center justify-between border border-soft-mist bg-white px-4 py-2.5 text-[13px]">
          {notice}
          <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso">
            <X className="size-4" />
          </button>
        </p>
      )}

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soft-mist px-4 py-3">
          <CategoryTabs items={kinds.map((k) => ({ ...k, active: k.value === kind, onSelect: () => setKind(k.value) }))} />
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
          <table className={cn("w-full min-w-[920px]", pending && "opacity-60")}>
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
                const stock = totalStock(p)
                const cover = p.images[0] ?? p.colors.find((c) => c.imageUrl)?.imageUrl
                const index = products.indexOf(p)
                const productColors = p.colors.map((c) => colors.find((x) => x.id === c.colorId)).filter(Boolean)
                return (
                  <tr key={p.id} className="hover:bg-warm-fog/50">
                    <td className={td}>
                      <button type="button" onClick={() => setEditing(p)} className="flex items-center gap-3 text-left">
                        <span className="relative h-12 w-9 shrink-0 overflow-hidden bg-warm-fog">
                          {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
                          {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                        </span>
                        <span>
                          <span className="block font-medium hover:underline">{p.name}</span>
                          <span className="block text-[11px] text-smoke-charcoal">{p.slug}</span>
                        </span>
                      </button>
                    </td>
                    <td className={td}>{categories.find((c) => c.id === p.categoryId)?.name ?? "—"}</td>
                    <td className={cn(td, "text-right tabular-nums")}>{formatPrice(p.price)}</td>
                    <td className={cn(td, "text-right tabular-nums")}>{p.tier3 !== null ? formatPrice(p.tier3) : "—"}</td>
                    <td className={cn(td, "text-right tabular-nums")}>{p.tier5 !== null ? formatPrice(p.tier5) : "—"}</td>
                    <td className={td}>
                      <div className="flex items-center gap-0.5">
                        {productColors.slice(0, 6).map((c) => (
                          <span key={c!.id} title={c!.name} className="size-3 border border-black/15" style={{ background: c!.hex }} />
                        ))}
                        {productColors.length > 6 && <span className="pl-1 text-[11px] text-smoke-charcoal">+{productColors.length - 6}</span>}
                        {productColors.length === 0 && <span className="text-smoke-charcoal">—</span>}
                      </div>
                    </td>
                    <td className={cn(td, "text-right tabular-nums", stock === 0 && "text-[#d03b3b]")}>
                      {stock === 0 ? "Agotado" : stock}
                    </td>
                    <td className={td}>
                      <span className="inline-flex items-center gap-1.5 text-[12px]">
                        <span className="size-1.5 rounded-full" style={{ background: p.isActive ? "#0ca30c" : "#cccccc" }} aria-hidden />
                        {p.isActive ? "Publicado" : "Oculto"}
                      </span>
                    </td>
                    <td className={cn(td, "text-right")}>
                      <div className="flex justify-end gap-0.5">
                        {!filtering && (
                          <>
                            <button type="button" disabled={pending || index === 0} onClick={() => move(index, -1)} aria-label={`Subir ${p.name}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
                              <ArrowUp className="size-4" strokeWidth={1.5} />
                            </button>
                            <button type="button" disabled={pending || index === products.length - 1} onClick={() => move(index, 1)} aria-label={`Bajar ${p.name}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
                              <ArrowDown className="size-4" strokeWidth={1.5} />
                            </button>
                          </>
                        )}
                        <button type="button" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist">
                          <Pencil className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[13px] text-smoke-charcoal">
                    No hay productos que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!filtering && products.length > 1 && (
          <p className="border-t border-soft-mist px-4 py-2.5 text-[12px] text-smoke-charcoal">
            Usa las flechas para cambiar el orden en que aparecen los productos en la tienda.
          </p>
        )}
      </Panel>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-2xl">
          {editing !== null && (
            <ProductForm
              key={editing === "nuevo" ? "nuevo" : editing.id}
              product={editing === "nuevo" ? null : editing}
              catalog={{ ...catalog, colors }}
              onColorCreated={(c) => setColors((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)))}
              onDone={(message) => {
                setEditing(null)
                setNotice(message)
                router.refresh()
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

/* ------------------------------ formulario ------------------------------ */

const emptyProduct = (categoryId: string): ProductInput => ({
  slug: "",
  name: "",
  kind: "PRENDA",
  categoryId,
  fit: "",
  description: "",
  material: "",
  price: 0,
  tier3: null,
  tier5: null,
  isNew: true,
  isBestSeller: false,
  isActive: true,
  sizeGuideId: null,
  images: [],
  colors: [],
  stock: {},
  pieces: [],
})

const toNumber = (v: string) => (v.trim() === "" ? null : Number(v))

function ProductForm({
  product,
  catalog,
  onColorCreated,
  onDone,
}: {
  product: AdminProduct | null
  catalog: AdminCatalog
  onColorCreated: (c: AdminCatalog["colors"][number]) => void
  onDone: (message: string) => void
}) {
  const { categories, colors, sizeGuides } = catalog
  const [form, setForm] = useState<ProductInput>(() =>
    product ? { ...product } : emptyProduct(categories.find((c) => c.slug !== "conjuntos" && c.slug !== "ofertas")?.id ?? ""),
  )
  const [slugTouched, setSlugTouched] = useState(!!product)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()
  const [deleting, startDeleting] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  const colorSlots = useMemo(
    () => (form.colors.length ? form.colors.map((c) => colors.find((x) => x.id === c.colorId)) : [null]),
    [form.colors, colors],
  )
  const unusedColors = colors.filter((c) => !form.colors.some((x) => x.colorId === c.id))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startSaving(async () => {
      const res = await saveProduct({ ...form, id: product?.id })
      if (!res.ok) return setError(res.error)
      onDone(product ? `“${form.name}” se guardó. La tienda ya muestra los cambios.` : `“${form.name}” se creó.`)
    })
  }

  return (
    <form className="flex h-full flex-col" onSubmit={submit}>
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-carbon-ink px-5">
        <SheetTitle className="label-caps">{product ? "Editar producto" : "Nuevo producto"}</SheetTitle>
        {product?.isActive && (
          <a href={`/producto/${product.slug}`} target="_blank" rel="noreferrer" className="mr-8 inline-flex items-center gap-1 text-[12px] underline underline-offset-2">
            Ver en la tienda <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5 text-[13px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" className="sm:col-span-2">
            <input
              value={form.name}
              required
              onChange={(e) => {
                const name = e.target.value
                setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }))
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Dirección web (slug)" hint={`rivibe.pe/producto/${form.slug || "…"}`} className="sm:col-span-2">
            <input
              value={form.slug}
              required
              onChange={(e) => {
                setSlugTouched(true)
                set("slug", slugify(e.target.value))
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Tipo">
            <select value={form.kind} onChange={(e) => set("kind", e.target.value as ProductInput["kind"])} className={inputCls}>
              <option value="PRENDA">Prenda</option>
              <option value="CONJUNTO">Conjunto</option>
              <option value="OFERTA">Oferta Shopping Days</option>
            </select>
          </Field>
          <Field label="Sección">
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Fit / corte" hint="Ej. Oversize, Boxy fit, Regular">
            <input value={form.fit} onChange={(e) => set("fit", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Material">
            <input value={form.material} onChange={(e) => set("material", e.target.value)} placeholder="Ej. Algodón jersey 20/1" className={inputCls} />
          </Field>
          <Field label="Descripción" className="sm:col-span-2">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className={textareaCls} />
          </Field>
          <Field label="Guía de tallas">
            <select value={form.sizeGuideId ?? ""} onChange={(e) => set("sizeGuideId", e.target.value || null)} className={inputCls}>
              <option value="">Sin guía</option>
              {sizeGuides.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </Field>
        </div>

        <Fieldset legend="Precios (S/)" hint="El precio por volumen cuenta unidades del mismo producto, sin importar color ni talla. Déjalo vacío si no aplica.">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Unitario">
              <input type="number" step="0.01" min="0" required value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Desde 3 u.">
              <input type="number" step="0.01" min="0" value={form.tier3 ?? ""} placeholder="—" onChange={(e) => set("tier3", toNumber(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Desde 5 u.">
              <input type="number" step="0.01" min="0" value={form.tier5 ?? ""} placeholder="—" onChange={(e) => set("tier5", toNumber(e.target.value))} className={inputCls} />
            </Field>
          </div>
        </Fieldset>

        <Fieldset legend="Fotos" hint="La primera es la principal. Cambia el orden con las flechas.">
          <ImageListField values={form.images} onChange={(images) => set("images", images)} />
        </Fieldset>

        <Fieldset legend="Colores" hint="Cada color puede tener su foto de la prenda (opcional).">
          <ColorsEditor
            value={form.colors}
            colors={colors}
            unused={unusedColors}
            onChange={(next) => set("colors", next)}
            onColorCreated={onColorCreated}
          />
        </Fieldset>

        <Fieldset legend="Stock por talla" hint={form.colors.length ? "Unidades disponibles de cada color y talla." : "Sin colores: un solo stock por talla."}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-[11px] font-medium text-smoke-charcoal uppercase">Color</th>
                  {SIZES.map((s) => (
                    <th key={s} className="pb-2 text-left text-[11px] font-medium text-smoke-charcoal uppercase">Talla {s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colorSlots.map((c) => {
                  const colorId = c?.id ?? null
                  return (
                    <tr key={colorId ?? "unico"}>
                      <td className="py-1 pr-3">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          {c && <span className="size-3 border border-black/15" style={{ background: c.hex }} />}
                          {c?.name ?? "Único"}
                        </span>
                      </td>
                      {SIZES.map((s) => {
                        const key = adminStockKey(colorId, s)
                        return (
                          <td key={s} className="py-1 pr-2">
                            <input
                              type="number"
                              min={0}
                              step={1}
                              aria-label={`Stock ${c?.name ?? ""} talla ${s}`}
                              value={form.stock[key] ?? 0}
                              onChange={(e) => set("stock", { ...form.stock, [key]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                              className={cn(inputCls, "mt-0 h-9")}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Fieldset>

        {form.kind !== "PRENDA" && (
          <Fieldset legend="Piezas del pack" hint="El cliente elige una talla por pieza. Si una pieza tiene opciones (ej. Polera o Casaca), sepáralas con comas.">
            <ul className="space-y-2">
              {form.pieces.map((piece, i) => (
                <li key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    value={piece.label}
                    placeholder="Ej. Polo"
                    aria-label={`Pieza ${i + 1}`}
                    onChange={(e) => set("pieces", form.pieces.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    className={cn(inputCls, "mt-0")}
                  />
                  <input
                    value={piece.options.join(", ")}
                    placeholder="Opciones (opcional)"
                    aria-label={`Opciones de la pieza ${i + 1}`}
                    onChange={(e) =>
                      set("pieces", form.pieces.map((x, j) => (j === i ? { ...x, options: e.target.value.split(",").map((o) => o.trimStart()) } : x)))
                    }
                    className={cn(inputCls, "mt-0")}
                  />
                  <button type="button" onClick={() => set("pieces", form.pieces.filter((_, j) => j !== i))} aria-label="Quitar pieza" className="flex size-10 items-center justify-center rounded-md hover:bg-soft-mist">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => set("pieces", [...form.pieces, { label: "", options: [] }])} className="mt-2 inline-flex items-center gap-1 border border-dashed border-stone-gray px-2 py-1 text-[12px] hover:border-carbon-ink">
              <Plus className="size-3" /> Agregar pieza
            </button>
          </Fieldset>
        )}

        <Fieldset legend="Publicación">
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="size-4 accent-black" />
              Publicado en la tienda
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => set("isBestSeller", e.target.checked)} className="size-4 accent-black" />
              Mostrar en “Lo más vendido”
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.isNew} onChange={(e) => set("isNew", e.target.checked)} className="size-4 accent-black" />
              Etiqueta “Nuevo”
            </label>
          </div>
        </Fieldset>

        {product && (
          <div className="border-t border-soft-mist pt-5">
            {confirmDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  {product.orderCount > 0
                    ? "Este producto tiene pedidos: se ocultará de la tienda en vez de borrarse."
                    : "¿Borrar este producto para siempre?"}
                </span>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() =>
                    startDeleting(async () => {
                      const res = await deleteProduct(product.id)
                      if (!res.ok) return setError(res.error)
                      onDone(res.data?.hidden ? `“${product.name}” se ocultó de la tienda.` : `“${product.name}” se borró.`)
                    })
                  }
                  className="h-8 rounded-md bg-[#b42c2c] px-3 text-[12px] text-white disabled:opacity-60"
                >
                  {deleting ? "Borrando…" : product.orderCount > 0 ? "Sí, ocultar" : "Sí, borrar"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="h-8 px-2 text-[12px] underline">
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-[12px] text-[#b42c2c] hover:underline">
                <Trash2 className="size-3.5" /> Borrar producto
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-carbon-ink p-5">
        <FormError message={error} />
        <div className="flex gap-2">
          <button type="button" onClick={() => onDone("")} className={cn(buttonVariants({ variant: "ink", size: "cta" }), "flex-1")}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={cn(buttonVariants({ size: "cta" }), "flex-1")}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  )
}

function ColorsEditor({
  value,
  colors,
  unused,
  onChange,
  onColorCreated,
}: {
  value: ProductInput["colors"]
  colors: AdminCatalog["colors"]
  unused: AdminCatalog["colors"]
  onChange: (next: ProductInput["colors"]) => void
  onColorCreated: (c: AdminCatalog["colors"][number]) => void
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [hex, setHex] = useState("#1a1a1a")
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  return (
    <div>
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((entry, i) => {
            const c = colors.find((x) => x.id === entry.colorId)
            return (
              <li key={entry.colorId}>
                <ImageField
                  value={entry.imageUrl}
                  fit="contain"
                  onChange={(ref) => onChange(value.map((x, j) => (j === i ? { ...x, imageUrl: ref?.src ?? "" } : x)))}
                />
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1.5 text-[12px]">
                    <span className="size-3 border border-black/15" style={{ background: c?.hex }} />
                    {c?.name}
                  </span>
                  <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar ${c?.name}`} className="flex size-7 items-center justify-center rounded-md hover:bg-soft-mist">
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value=""
          aria-label="Agregar color"
          onChange={(e) => e.target.value && onChange([...value, { colorId: e.target.value, imageUrl: "" }])}
          className={cn(inputCls, "mt-0 h-9 w-auto")}
        >
          <option value="">+ Agregar color existente</option>
          {unused.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="button" onClick={() => setCreating((v) => !v)} className="inline-flex h-9 items-center gap-1 border border-dashed border-stone-gray px-2.5 text-[12px] hover:border-carbon-ink">
          <Plus className="size-3" /> Color nuevo
        </button>
      </div>

      {creating && (
        <div className="mt-3 flex flex-wrap items-end gap-2 border border-soft-mist p-3">
          <Field label="Nombre" className="min-w-40 flex-1">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Verde oliva" className={inputCls} />
          </Field>
          <Field label="Tono">
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="mt-1.5 h-10 w-14 cursor-pointer rounded-md border border-stone-gray bg-white p-1" />
          </Field>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError(null)
                const res = await createColor(name, hex)
                if (!res.ok || !res.data) return setError(res.ok ? "No se pudo crear" : res.error)
                const created = res.data
                if (!colors.some((c) => c.id === created.id)) onColorCreated(created)
                if (!value.some((x) => x.colorId === created.id)) onChange([...value, { colorId: created.id, imageUrl: "" }])
                setName("")
                setCreating(false)
              })
            }
            className="h-10 rounded-md bg-carbon-ink px-3 text-[12px] text-white disabled:opacity-60"
          >
            {pending ? "Creando…" : "Crear y agregar"}
          </button>
          {error && <p className="w-full text-[12px] text-[#b42c2c]">{error}</p>}
        </div>
      )}
    </div>
  )
}
