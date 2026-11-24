"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react"

import {
  BENEFIT_ICONS,
  type BenefitIcon,
  CUSTOM_SECTION_TYPES,
  type HeroSlide,
  type HomeSection,
  SECTION_META,
  type SectionType,
} from "@/lib/home"
import {
  createSection,
  deleteSection,
  reorderSections,
  saveSection,
  setSectionVisible,
} from "@/app/actions/admin/home"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { AdminPageHeader, Panel } from "@/components/admin/ui"
import { Field, Fieldset, FormError, ImageField, inputCls, textareaCls } from "@/components/admin/form"
import { benefitIcons } from "@/components/home/benefits"
import { cn } from "@/lib/utils"

export type PickerProduct = { slug: string; name: string; image: string; hasTiers: boolean; isActive: boolean }
export type LinkOption = { href: string; label: string }

const iconLabels: Record<BenefitIcon, string> = {
  truck: "Envío",
  package: "Paquete",
  ruler: "Medidas",
  message: "Mensaje",
  star: "Estrella",
  shield: "Garantía",
  tag: "Etiqueta",
  heart: "Corazón",
  store: "Tienda",
}

function summary(s: HomeSection) {
  if (s.type === "HERO") return `${s.data.slides?.length ?? 0} diapositiva(s)`
  if (s.type === "BENEFITS") return (s.data.items ?? []).map((i) => i.title).join(" · ")
  return s.title || s.eyebrow || "Sin título"
}

export function HomeAdmin({
  sections,
  products,
  links,
}: {
  sections: HomeSection[]
  products: PickerProduct[]
  links: LinkOption[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<HomeSection | null>(null)
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null)
      const res = await fn()
      if (!res.ok) setError(res.error ?? "No se pudo guardar")
      router.refresh()
    })

  const move = (index: number, dir: -1 | 1) => {
    const ids = sections.map((s) => s.id)
    const j = index + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    run(() => reorderSections(ids))
  }

  const add = (type: SectionType) => {
    setAdding(false)
    startTransition(async () => {
      setError(null)
      const res = await createSection(type)
      if (!res.ok) return setError(res.error)
      router.refresh()
      if (res.data) setEditing(res.data)
    })
  }

  return (
    <>
      <AdminPageHeader
        title="Página de inicio"
        description="Edita, ordena, oculta o agrega bloques. Los cambios se ven en la tienda al guardar."
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "ink", size: "cta" }))}>
              <ExternalLink className="size-4" /> Ver inicio
            </a>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAdding((a) => !a)}
                aria-expanded={adding}
                className={cn(buttonVariants({ size: "cta" }))}
              >
                <Plus className="size-4" /> Agregar bloque <ChevronDown className="size-3.5" />
              </button>
              {adding && (
                <ul className="absolute right-0 z-20 mt-1 w-72 border border-carbon-ink bg-white py-1 text-[13px]">
                  {CUSTOM_SECTION_TYPES.map((t) => (
                    <li key={t}>
                      <button type="button" onClick={() => add(t)} className="block w-full px-4 py-2.5 text-left hover:bg-warm-fog">
                        <span className="font-medium">{SECTION_META[t].label}</span>
                        <span className="block text-[12px] text-smoke-charcoal">{SECTION_META[t].description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        }
      />

      {error && <div className="mb-3"><FormError message={error} /></div>}

      <Panel>
        <ol className={cn("divide-y divide-soft-mist", pending && "opacity-60")}>
          {sections.map((s, i) => {
            const meta = SECTION_META[s.type]
            return (
              <li key={s.id} className={cn("flex items-center gap-3 px-4 py-3", !s.isVisible && "bg-warm-fog/40")}>
                <span className="w-5 shrink-0 text-center text-[12px] text-smoke-charcoal tabular-nums">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => setEditing(s)} className="text-left">
                    <span className={cn("block text-[14px] font-medium hover:underline", !s.isVisible && "text-smoke-charcoal")}>
                      {meta.label}
                    </span>
                    <span className="block truncate text-[12px] text-smoke-charcoal">
                      {s.isVisible ? summary(s) : `Oculto · ${summary(s)}`}
                    </span>
                  </button>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <button type="button" disabled={pending || i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${meta.label}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
                    <ArrowUp className="size-4" strokeWidth={1.5} />
                  </button>
                  <button type="button" disabled={pending || i === sections.length - 1} onClick={() => move(i, 1)} aria-label={`Bajar ${meta.label}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
                    <ArrowDown className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setSectionVisible(s.id, !s.isVisible))}
                    aria-label={s.isVisible ? `Ocultar ${meta.label}` : `Mostrar ${meta.label}`}
                    title={s.isVisible ? "Ocultar en la tienda" : "Mostrar en la tienda"}
                    className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist"
                  >
                    {s.isVisible ? <Eye className="size-4" strokeWidth={1.5} /> : <EyeOff className="size-4 text-smoke-charcoal" strokeWidth={1.5} />}
                  </button>
                  <button type="button" onClick={() => setEditing(s)} aria-label={`Editar ${meta.label}`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-soft-mist">
                    <Pencil className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>
      <p className="mt-3 text-[12px] text-smoke-charcoal">
        El ojo muestra u oculta un bloque sin borrarlo. Los bloques nuevos empiezan ocultos para que los prepares con calma.
      </p>

      <datalist id="store-links">
        {links.map((l) => (
          <option key={l.href} value={l.href}>{l.label}</option>
        ))}
      </datalist>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-2xl">
          {editing && (
            <SectionForm
              key={editing.id}
              section={editing}
              products={products}
              onDone={() => {
                setEditing(null)
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

function SectionForm({ section, products, onDone }: { section: HomeSection; products: PickerProduct[]; onDone: () => void }) {
  const meta = SECTION_META[section.type]
  const [form, setForm] = useState(section)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const has = (f: (typeof meta.fields)[number]) => meta.fields.includes(f)
  const set = <K extends keyof HomeSection>(key: K, value: HomeSection[K]) => setForm((f) => ({ ...f, [key]: value }))
  const setData = (patch: Partial<HomeSection["data"]>) => setForm((f) => ({ ...f, data: { ...f.data, ...patch } }))

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        startSaving(async () => {
          const res = await saveSection(form)
          if (!res.ok) return setError(res.error)
          if (form.isVisible !== section.isVisible) await setSectionVisible(section.id, form.isVisible)
          onDone()
        })
      }}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-carbon-ink px-5">
        <SheetTitle className="label-caps">{meta.label}</SheetTitle>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 text-[13px]">
        <p className="text-smoke-charcoal">{meta.description}</p>

        {(has("eyebrow") || has("title")) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {has("eyebrow") && (
              <Field label="Texto pequeño superior" hint="Opcional. Ej. Shopping Days">
                <input value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className={inputCls} />
              </Field>
            )}
            {has("title") && (
              <Field label="Título">
                <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
              </Field>
            )}
          </div>
        )}
        {has("body") && (
          <Field label="Texto">
            <textarea value={form.body} onChange={(e) => set("body", e.target.value)} className={textareaCls} />
          </Field>
        )}
        {has("cta") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto del botón / enlace" hint="Déjalo vacío para no mostrar botón">
              <input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} placeholder="Ej. Ver catálogo" className={inputCls} />
            </Field>
            <Field label="Lleva a" hint="Elige una página de la lista o escribe una dirección">
              <input list="store-links" value={form.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} placeholder="/catalogo" className={inputCls} />
            </Field>
          </div>
        )}

        {section.type === "BANNER" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="label-caps">Foto (computadora)</span>
                <ImageField className="mt-2" aspect="aspect-video" value={form.imageUrl} allowClear={false} onChange={(r) => r && set("imageUrl", r.src)} />
              </div>
              <div>
                <span className="label-caps">Foto (celular, opcional)</span>
                <ImageField className="mt-2 w-32" aspect="aspect-[2/3]" value={form.mobileImageUrl} onChange={(r) => set("mobileImageUrl", r?.src ?? "")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Posición del texto">
                <select value={form.data.align ?? "left"} onChange={(e) => setData({ align: e.target.value as "left" })} className={inputCls}>
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </Field>
              <Field label="Color del texto (computadora)" hint="En celular el texto siempre va en blanco">
                <select value={form.data.tone ?? "dark"} onChange={(e) => setData({ tone: e.target.value as "dark" })} className={inputCls}>
                  <option value="dark">Negro (foto clara)</option>
                  <option value="light">Blanco (foto oscura)</option>
                </select>
              </Field>
            </div>
          </>
        )}

        {section.type === "HERO" && <SlidesEditor slides={form.data.slides ?? []} onChange={(slides) => setData({ slides })} />}

        {section.type === "BENEFITS" && (
          <Fieldset legend="Beneficios" hint="Se ven de 2 en 2 en celular y de 4 en 4 en computadora.">
            <ul className="space-y-3">
              {(form.data.items ?? []).map((item, i, items) => {
                const update = (patch: Partial<typeof item>) => setData({ items: items.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
                const Icon = benefitIcons[item.icon]
                return (
                  <li key={i} className="grid gap-2 border border-soft-mist p-3 sm:grid-cols-[140px_1fr_auto]">
                    <Field label="Ícono">
                      <div className="mt-1.5 flex items-center gap-2">
                        <Icon className="size-5 shrink-0" strokeWidth={1.25} />
                        <select value={item.icon} onChange={(e) => update({ icon: e.target.value as BenefitIcon })} className={cn(inputCls, "mt-0")}>
                          {BENEFIT_ICONS.map((ic) => (
                            <option key={ic} value={ic}>{iconLabels[ic]}</option>
                          ))}
                        </select>
                      </div>
                    </Field>
                    <div className="space-y-2">
                      <Field label="Título">
                        <input value={item.title} onChange={(e) => update({ title: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label="Texto">
                        <input value={item.text} onChange={(e) => update({ text: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                    <ListControls
                      index={i}
                      length={items.length}
                      onMove={(to) => setData({ items: moveItem(items, i, to) })}
                      onRemove={() => setData({ items: items.filter((_, j) => j !== i) })}
                    />
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              onClick={() => setData({ items: [...(form.data.items ?? []), { icon: "star", title: "", text: "" }] })}
              className="mt-2 inline-flex items-center gap-1 border border-dashed border-stone-gray px-2 py-1 text-[12px] hover:border-carbon-ink"
            >
              <Plus className="size-3" /> Agregar beneficio
            </button>
          </Fieldset>
        )}

        {(section.type === "PRODUCTS" || section.type === "VOLUME_PRICING") && (
          <ProductPicker
            legend={section.type === "VOLUME_PRICING" ? "Productos de la tabla" : "Productos"}
            hint={section.type === "VOLUME_PRICING" ? "Solo productos con precio desde 3 o 5 unidades." : "Se muestran en este orden."}
            products={section.type === "VOLUME_PRICING" ? products.filter((p) => p.hasTiers) : products}
            value={form.data.productSlugs ?? []}
            onChange={(productSlugs) => setData({ productSlugs })}
          />
        )}

        {["CATEGORIES", "BEST_SELLERS", "OFFERS", "SETS"].includes(section.type) && (
          <p className="border border-soft-mist bg-warm-fog/40 px-3 py-2.5 text-[12px] text-smoke-charcoal">
            {section.type === "CATEGORIES" && "Las secciones y sus portadas se editan en Admin › Secciones."}
            {section.type === "BEST_SELLERS" && "Los productos salen de los marcados como “Lo más vendido” en Admin › Productos."}
            {section.type === "OFFERS" && "Muestra los productos de tipo “Oferta Shopping Days” de Admin › Productos."}
            {section.type === "SETS" && "Muestra los productos de tipo “Conjunto” de Admin › Productos."}
          </p>
        )}

        <label className="flex items-center gap-3 border-t border-soft-mist pt-5">
          <input type="checkbox" checked={form.isVisible} onChange={(e) => set("isVisible", e.target.checked)} className="size-4 accent-black" />
          Mostrar este bloque en la tienda
        </label>

        {meta.custom && (
          <div className="border-t border-soft-mist pt-5">
            {confirmDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span>¿Borrar este bloque?</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    startSaving(async () => {
                      const res = await deleteSection(section.id)
                      if (!res.ok) return setError(res.error)
                      onDone()
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
                <Trash2 className="size-3.5" /> Borrar bloque
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-carbon-ink p-5">
        <FormError message={error} />
        <div className="flex gap-2">
          <button type="button" onClick={onDone} className={cn(buttonVariants({ variant: "ink", size: "cta" }), "flex-1")}>
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

/* ------------------------------- ayudantes ------------------------------- */

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

function ListControls({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number
  length: number
  onMove: (to: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex gap-0.5 sm:flex-col">
      <button type="button" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Subir" className="flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
        <ArrowUp className="size-4" strokeWidth={1.5} />
      </button>
      <button type="button" disabled={index === length - 1} onClick={() => onMove(index + 1)} aria-label="Bajar" className="flex size-8 items-center justify-center rounded-md hover:bg-soft-mist disabled:opacity-30">
        <ArrowDown className="size-4" strokeWidth={1.5} />
      </button>
      <button type="button" onClick={onRemove} aria-label="Quitar" className="flex size-8 items-center justify-center rounded-md text-[#b42c2c] hover:bg-soft-mist">
        <X className="size-4" />
      </button>
    </div>
  )
}

const POSITIONS = [
  { value: "15% 50%", label: "Izquierda" },
  { value: "50% 50%", label: "Centro" },
  { value: "85% 50%", label: "Derecha" },
]

function SlidesEditor({ slides, onChange }: { slides: HeroSlide[]; onChange: (s: HeroSlide[]) => void }) {
  const update = (i: number, patch: Partial<HeroSlide>) => onChange(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  return (
    <Fieldset legend="Diapositivas" hint="Cada una lleva una foto horizontal (computadora) y una vertical (celular). Cambian solas cada 6 segundos.">
      <ol className="space-y-4">
        {slides.map((s, i) => (
          <li key={s.id} className="border border-soft-mist p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-caps">Diapositiva {i + 1}</span>
              <ListControls
                index={i}
                length={slides.length}
                onMove={(to) => onChange(moveItem(slides, i, to))}
                onRemove={() => onChange(slides.filter((_, j) => j !== i))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_96px]">
              <div>
                <span className="text-[12px] text-smoke-charcoal">Foto computadora (horizontal)</span>
                <ImageField className="mt-1" aspect="aspect-video" value={s.desktop.src} allowClear={false} onChange={(r) => r && update(i, { desktop: r })} />
              </div>
              <div>
                <span className="text-[12px] text-smoke-charcoal">Celular</span>
                <ImageField className="mt-1" aspect="aspect-[2/3]" value={s.mobile.src} allowClear={false} onChange={(r) => r && update(i, { mobile: r })} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Título" className="sm:col-span-2">
                <input value={s.title} onChange={(e) => update(i, { title: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Texto" className="sm:col-span-2">
                <input value={s.text} onChange={(e) => update(i, { text: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Texto del botón">
                <input value={s.ctaLabel} onChange={(e) => update(i, { ctaLabel: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Lleva a">
                <input list="store-links" value={s.ctaHref} onChange={(e) => update(i, { ctaHref: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Lado del texto (computadora)">
                <select value={s.align} onChange={(e) => update(i, { align: e.target.value as HeroSlide["align"] })} className={inputCls}>
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                </select>
              </Field>
              <Field label="Color del texto (computadora)">
                <select value={s.tone} onChange={(e) => update(i, { tone: e.target.value as HeroSlide["tone"] })} className={inputCls}>
                  <option value="light">Blanco (foto oscura)</option>
                  <option value="dark">Negro (foto clara)</option>
                </select>
              </Field>
              <Field label="Encuadre de la foto" hint="Qué parte de la foto se prioriza si la pantalla la recorta">
                <select value={s.position} onChange={(e) => update(i, { position: e.target.value })} className={inputCls}>
                  {!POSITIONS.some((p) => p.value === s.position) && <option value={s.position}>Personalizado ({s.position})</option>}
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Descripción de la foto" hint="Para lectores de pantalla y Google">
                <input value={s.alt} onChange={(e) => update(i, { alt: e.target.value })} className={inputCls} />
              </Field>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() =>
          onChange([
            ...slides,
            {
              id: `slide-${Date.now()}`,
              title: "Nuevo título",
              text: "",
              ctaLabel: "Ver catálogo",
              ctaHref: "/catalogo",
              desktop: slides[0]?.desktop ?? { src: "", width: 1600, height: 900 },
              mobile: slides[0]?.mobile ?? { src: "", width: 1024, height: 1536 },
              position: "50% 50%",
              alt: "",
              tone: "light",
              align: "left",
            },
          ])
        }
        className="mt-3 inline-flex items-center gap-1 border border-dashed border-stone-gray px-2 py-1 text-[12px] hover:border-carbon-ink"
      >
        <Plus className="size-3" /> Agregar diapositiva
      </button>
    </Fieldset>
  )
}

function ProductPicker({
  legend,
  hint,
  products,
  value,
  onChange,
}: {
  legend: string
  hint: string
  products: PickerProduct[]
  value: string[]
  onChange: (slugs: string[]) => void
}) {
  const available = products.filter((p) => !value.includes(p.slug))
  return (
    <Fieldset legend={legend} hint={hint}>
      <ul className="space-y-1.5">
        {value.map((slug, i) => {
          const p = products.find((x) => x.slug === slug)
          return (
            <li key={slug} className="flex items-center gap-3 border border-soft-mist p-2">
              <span className="relative h-12 w-9 shrink-0 overflow-hidden bg-warm-fog">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
                {p?.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {p?.name ?? slug}
                {p && !p.isActive && <span className="ml-2 text-[11px] text-smoke-charcoal">(oculto, no se mostrará)</span>}
                {!p && <span className="ml-2 text-[11px] text-[#b42c2c]">(ya no existe)</span>}
              </span>
              <ListControls
                index={i}
                length={value.length}
                onMove={(to) => onChange(moveItem(value, i, to))}
                onRemove={() => onChange(value.filter((s) => s !== slug))}
              />
            </li>
          )
        })}
      </ul>
      <select
        value=""
        aria-label="Agregar producto"
        onChange={(e) => e.target.value && onChange([...value, e.target.value])}
        className={cn(inputCls, "mt-3 w-full sm:w-auto")}
      >
        <option value="">+ Agregar producto</option>
        {available.map((p) => (
          <option key={p.slug} value={p.slug}>{p.name}{p.isActive ? "" : " (oculto)"}</option>
        ))}
      </select>
    </Fieldset>
  )
}
