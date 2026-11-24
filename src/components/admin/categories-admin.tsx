"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react"

import type { AdminCategory } from "@/lib/admin-types"
import { type CategoryInput, deleteCategory, reorderCategories, saveCategory } from "@/app/actions/admin/catalog"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { AdminPageHeader, Panel } from "@/components/admin/ui"
import { Field, FormError, ImageField, inputCls, slugify, textareaCls } from "@/components/admin/form"
import { cn } from "@/lib/utils"

const RESERVED = ["conjuntos", "ofertas"]
const storeHref = (slug: string) => (RESERVED.includes(slug) ? `/${slug}` : `/productos/${slug}`)

export function CategoriesAdmin({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<AdminCategory | "nueva" | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const move = (index: number, dir: -1 | 1) => {
    const ids = categories.map((c) => c.id)
    const j = index + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    startTransition(async () => {
      await reorderCategories(ids)
      router.refresh()
    })
  }

  return (
    <>
      <AdminPageHeader
        title="Secciones"
        description="Las secciones agrupan los productos (polos, joggers, hoodies…) y aparecen en el menú Productos y en el inicio"
        actions={
          <button type="button" onClick={() => setEditing("nueva")} className={cn(buttonVariants({ size: "cta" }))}>
            <Plus className="size-4" /> Nueva sección
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
        <ul className={cn("divide-y divide-soft-mist", pending && "opacity-60")}>
          {categories.map((c, i) => (
            <li key={c.id} className="flex items-center gap-4 px-4 py-3">
              <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-warm-fog">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
                {c.coverUrl && <img src={c.coverUrl} alt="" className="h-full w-full object-cover" />}
              </span>
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => setEditing(c)} className="text-[14px] font-medium hover:underline">
                  {c.name}
                </button>
                <p className="truncate text-[12px] text-smoke-charcoal">
                  {c.productCount} producto{c.productCount === 1 ? "" : "s"} · {storeHref(c.slug)}
                  {c.productCount === 0 && !RESERVED.includes(c.slug) && " · aparece en la tienda cuando tenga productos"}
                </p>
              </div>
              <div className="flex shrink-0 gap-0.5">
                <button type="button" disabled={pending || i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${c.name}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
                  <ArrowUp className="size-4" strokeWidth={1.5} />
                </button>
                <button type="button" disabled={pending || i === categories.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar ${c.name}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
                  <ArrowDown className="size-4" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => setEditing(c)} aria-label={`Editar ${c.name}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist">
                  <Pencil className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-lg">
          {editing !== null && (
            <CategoryForm
              key={editing === "nueva" ? "nueva" : editing.id}
              category={editing === "nueva" ? null : editing}
              onDone={(message) => {
                setEditing(null)
                if (message) setNotice(message)
                router.refresh()
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function CategoryForm({ category, onDone }: { category: AdminCategory | null; onDone: (message: string) => void }) {
  const [form, setForm] = useState<CategoryInput>(
    category
      ? { id: category.id, slug: category.slug, name: category.name, description: category.description, coverUrl: category.coverUrl }
      : { slug: "", name: "", description: "", coverUrl: "" },
  )
  const [slugTouched, setSlugTouched] = useState(!!category)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const reserved = !!category && RESERVED.includes(category.slug)

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        startSaving(async () => {
          const res = await saveCategory(form)
          if (!res.ok) return setError(res.error)
          onDone(category ? `“${form.name}” se guardó.` : `Se creó la sección “${form.name}”. Ahora asígnale productos.`)
        })
      }}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-carbon-ink px-5">
        <SheetTitle className="label-caps">{category ? "Editar sección" : "Nueva sección"}</SheetTitle>
        {category && category.productCount > 0 && (
          <a href={storeHref(category.slug)} target="_blank" rel="noreferrer" className="mr-8 inline-flex items-center gap-1 text-[12px] underline underline-offset-2">
            Ver en la tienda <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5 text-[13px]">
        <Field label="Nombre">
          <input
            value={form.name}
            required
            onChange={(e) => {
              const name = e.target.value
              setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }))
            }}
            placeholder="Ej. Casacas"
            className={inputCls}
          />
        </Field>
        <Field
          label="Dirección web (slug)"
          hint={reserved ? "Esta sección tiene su propia página; su dirección no cambia." : `rivibe.pe${storeHref(form.slug || "…")}`}
        >
          <input
            value={form.slug}
            required
            disabled={reserved}
            onChange={(e) => {
              setSlugTouched(true)
              setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
            }}
            className={inputCls}
          />
        </Field>
        <Field label="Descripción" hint="Aparece debajo del título de la sección">
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={textareaCls} />
        </Field>
        <div>
          <span className="label-caps">Foto de portada</span>
          <p className="mt-1 text-[12px] text-smoke-charcoal">Se muestra en “Compra por sección” (vertical, 3:4).</p>
          <ImageField
            className="mt-2 w-40"
            value={form.coverUrl}
            allowClear={false}
            onChange={(ref) => ref && setForm((f) => ({ ...f, coverUrl: ref.src }))}
          />
        </div>

        {category && !reserved && (
          <div className="border-t border-soft-mist pt-5">
            {category.productCount > 0 ? (
              <p className="text-[12px] text-smoke-charcoal">
                Para borrar esta sección, primero mueve sus {category.productCount} producto(s) a otra sección.
              </p>
            ) : confirmDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span>¿Borrar “{category.name}”?</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    startSaving(async () => {
                      const res = await deleteCategory(category.id)
                      if (!res.ok) return setError(res.error)
                      onDone(`Se borró la sección “${category.name}”.`)
                    })
                  }
                  className="h-8 rounded-md bg-[#b42c2c] px-3 text-[12px] text-white"
                >
                  Sí, borrar
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="h-8 px-2 text-[12px] underline">
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-[12px] text-[#b42c2c] hover:underline">
                <Trash2 className="size-3.5" /> Borrar sección
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
