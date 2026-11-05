"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Ruler, Truck } from "lucide-react"

import {
  type Product,
  type Size,
  type SizeGuide,
  LOW_STOCK,
  colorInStock,
  lineStock,
  stockFor,
  totalStock,
  formatPrice, isLifestyle, nextTier, unitPriceFor } from "@/lib/catalog"
import { addToCart, useQtyInCart } from "@/lib/cart-store"
import { buttonVariants } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { QtyStepper } from "@/components/cart/cart-line"
import { FavoriteButton } from "@/components/product/favorite-button"
import { SizeGuideSheet } from "@/components/product/size-guide"
import { cn } from "@/lib/utils"

export function ProductDetail({ product, sizeGuide }: { product: Product; sizeGuide?: SizeGuide }) {
  const [colorSlug, setColorSlug] = useState(product.colors[0]?.slug)
  const [size, setSize] = useState<Size | null>(null)
  const [pieceSizes, setPieceSizes] = useState<(Size | null)[]>(() => (product.pieces ?? []).map(() => null))
  const [pieceOptions, setPieceOptions] = useState<(string | null)[]>(() =>
    (product.pieces ?? []).map((p) => p.options?.[0] ?? null),
  )
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inCart = useQtyInCart(product.slug)

  const color = product.colors.find((c) => c.slug === colorSlug)
  const gallery = [...(color?.image ? [color.image] : []), ...product.lifestyle].filter(
    (src, i, arr) => arr.indexOf(src) === i,
  )
  const current = gallery[Math.min(activeImage, gallery.length - 1)]

  // El precio especial cuenta lo que ya está en el carrito + lo que se va a agregar
  const totalQty = inCart + qty
  const unitPrice = unitPriceFor(product, totalQty)
  const next = nextTier(product, totalQty)

  const hasPieces = !!product.pieces?.length
  const isOffer = product.kind === "oferta"
  const soldOut = totalStock(product) === 0
  const sizeAvailable = (s: Size) => (stockFor(product, colorSlug, s) ?? 1) > 0
  // Stock de la combinación elegida (conjuntos/ofertas: la pieza con menos stock manda)
  const available = lineStock(product, { colorSlug, size, pieceSizes })
  const ready = (hasPieces ? pieceSizes.every(Boolean) : !!size) && available !== 0 && !soldOut
  const maxQty = Math.max(1, Math.min(available ?? 50, 50))

  const pickColor = (slug: string) => {
    setColorSlug(slug)
    setActiveImage(0)
    setError(null)
    // Si la talla elegida no existe en el nuevo color, se limpia
    if (size && (stockFor(product, slug, size) ?? 1) === 0) setSize(null)
    setPieceSizes((prev) => prev.map((s) => (s && (stockFor(product, slug, s) ?? 1) === 0 ? null : s)))
  }

  const add = async () => {
    if (!ready || busy) return
    setBusy(true)
    setError(null)
    const result = await addToCart({
      slug: product.slug,
      colorSlug,
      size: hasPieces ? undefined : size!,
      pieceSizes: hasPieces ? (pieceSizes as Size[]) : undefined,
      pieceOptions: product.pieces?.some((p) => p.options) ? pieceOptions : undefined,
      qty: Math.min(qty, maxQty),
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error ?? "No se pudo agregar.")
      return
    }
    setAdded(true)
    setQty(1)
    window.setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-10 lg:gap-16">
      {/* Galería */}
      <div className="md:col-span-7">
        <div className="flex flex-col-reverse gap-3 lg:flex-row">
          {gallery.length > 1 && (
            <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
              {gallery.map((src, i) => (
                <li key={src} className="w-16 shrink-0 lg:w-full">
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-current={src === current}
                    className={cn(
                      "relative block aspect-[3/4] w-full bg-white outline-offset-2",
                      src === current ? "outline outline-1 outline-carbon-ink" : "opacity-70 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="80px"
                      className={isLifestyle(product, src) ? "object-cover" : "object-contain p-1"}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={cn("relative flex-1 bg-white", isOffer ? "aspect-[466/659]" : "aspect-[3/4]")}>
            <Image
              key={current}
              src={current}
              alt={`${product.name}${color ? ` — ${color.name}` : ""}`}
              fill
              preload
              sizes="(min-width: 768px) 55vw, 100vw"
              className={cn(
                "animate-in duration-500 fade-in",
                isLifestyle(product, current) ? "object-cover" : "object-contain p-[8%]",
              )}
            />
            <FavoriteButton slug={product.slug} name={product.name} className="absolute top-3 right-3" />
          </div>
        </div>
      </div>

      {/* Información y compra */}
      <div className="md:col-span-5">
        <div className="md:sticky md:top-[calc(var(--header-h)+24px)]">
          <p className="label-caps text-smoke-charcoal">
            {product.fit}
            {product.material ? ` · ${product.material}` : ""}
          </p>
          <h1 className="mt-2 text-display font-normal">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-heading">{formatPrice(unitPrice)}</span>
            {unitPrice < product.price && (
              <span className="text-body text-smoke-charcoal line-through">{formatPrice(product.price)}</span>
            )}
            {product.tiers.length > 0 && <span className="text-caption text-smoke-charcoal">c/u</span>}
          </div>

          {product.tiers.length > 0 && <TierTable product={product} totalQty={totalQty} />}
          {product.tiers.length > 0 && (
            <p className="mt-2 text-caption text-smoke-charcoal">
              {next
                ? `Agrega ${next.minQty - totalQty} más del mismo producto (puedes variar colores y tallas) y paga ${formatPrice(next.unitPrice)} c/u.`
                : "¡Tienes el mejor precio! Puedes combinar colores y tallas."}
              {inCart > 0 && ` Ya tienes ${inCart} en tu carrito.`}
            </p>
          )}

          {product.colors.length > 0 && (
            <fieldset className="mt-8">
              <legend className="label-caps">
                Color: <span className="font-normal tracking-brand normal-case">{color?.name}</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={c.slug === colorSlug}
                    onClick={() => pickColor(c.slug)}
                    className={cn(
                      "relative size-7 p-0.5",
                      c.slug === colorSlug ? "border border-carbon-ink" : "border border-transparent hover:border-stone-gray",
                    )}
                  >
                    <span className="block size-full border border-black/10" style={{ backgroundColor: c.hex }} />
                    {!colorInStock(product, c.slug) && (
                      <>
                        <span aria-hidden className="pointer-events-none absolute inset-0 sold-out-slash" />
                        <span className="sr-only"> (agotado)</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="label-caps">{hasPieces ? "Talla de cada prenda" : "Talla"}</p>
            {sizeGuide ? (
              <SizeGuideSheet guide={sizeGuide} />
            ) : (
              <Link href="/guia-de-tallas" className="inline-flex items-center gap-1.5 text-caption underline underline-offset-2">
                <Ruler className="size-3.5" strokeWidth={1.5} /> Guía de tallas
              </Link>
            )}
          </div>

          {hasPieces ? (
            <div className="mt-3 divide-y divide-soft-mist border-y border-soft-mist">
              {product.pieces!.map((piece, i) => (
                <div key={piece.label} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
                  {piece.options ? (
                    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={piece.label}>
                      {piece.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          role="radio"
                          aria-checked={pieceOptions[i] === opt}
                          onClick={() => setPieceOptions((prev) => prev.map((v, j) => (j === i ? opt : v)))}
                          className={cn(
                            "h-9 border px-3 text-[12px] transition-colors",
                            pieceOptions[i] === opt
                              ? "border-carbon-ink bg-carbon-ink text-white"
                              : "border-stone-gray hover:border-carbon-ink",
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-caption">{piece.label}</span>
                  )}
                  <SizePicker
                    sizes={product.sizes}
                    value={pieceSizes[i]}
                    label={piece.label}
                    onChange={(s) => setPieceSizes((prev) => prev.map((v, j) => (j === i ? s : v)))}
                    isAvailable={sizeAvailable}
                    compact
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3">
              <SizePicker sizes={product.sizes} value={size} onChange={setSize} isAvailable={sizeAvailable} />
            </div>
          )}

          {available !== undefined && available > 0 && available <= LOW_STOCK && (
            <p className="mt-3 text-caption font-medium">
              ¡Últimas {available} {available === 1 ? "unidad" : "unidades"} en esta combinación!
            </p>
          )}

          <div className="mt-8 flex gap-3">
            <QtyStepper value={Math.min(qty, maxQty)} onChange={(n) => setQty(Math.min(n, maxQty))} size="lg" />
            <button
              type="button"
              disabled={!ready || busy}
              onClick={add}
              className={cn(
                buttonVariants({ size: "cta" }),
                "h-12 flex-1 disabled:bg-soft-mist disabled:text-smoke-charcoal disabled:opacity-100",
              )}
            >
              {soldOut ? (
                "Agotado"
              ) : available === 0 ? (
                "Sin stock en esa combinación"
              ) : added ? (
                <>
                  <Check className="size-4" /> Agregado
                </>
              ) : busy ? (
                "Agregando…"
              ) : ready ? (
                `Agregar · ${formatPrice(unitPrice * qty)}`
              ) : hasPieces ? (
                "Elige las tallas"
              ) : (
                "Selecciona una talla"
              )}
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-3 border-l-2 border-[#d03b3b] bg-[#d03b3b]/5 px-3 py-2 text-caption">
              {error}
            </p>
          )}

          <p className="mt-4 flex items-center gap-2 text-caption text-smoke-charcoal">
            <Truck className="size-4" strokeWidth={1.5} /> Envíos a nivel nacional vía Shalom
          </p>

          <Accordion className="mt-8 border-t border-carbon-ink">
            <AccordionItem value="descripcion">
              <AccordionTrigger className="label-caps rounded-none py-4">Descripción</AccordionTrigger>
              <AccordionContent className="text-body text-smoke-charcoal">
                {product.description}
                {product.material && <> Elaborado en {product.material.toLowerCase()}.</>}
              </AccordionContent>
            </AccordionItem>
            {product.tiers.length > 0 && (
              <AccordionItem value="volumen">
                <AccordionTrigger className="label-caps rounded-none py-4">Precios por volumen</AccordionTrigger>
                <AccordionContent className="text-body text-smoke-charcoal">
                  El precio especial se activa al llevar {product.tiers.map((t) => t.minQty).join(" o ")} unidades o
                  más de este mismo producto. Puedes mezclar colores y tallas; el descuento se aplica solo en tu carrito.
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="envios">
              <AccordionTrigger className="label-caps rounded-none py-4">Envíos y cambios</AccordionTrigger>
              <AccordionContent className="text-body text-smoke-charcoal">
                Enviamos a todo el Perú vía Shalom. Recoges tu pedido en la agencia que elijas presentando tu DNI.{" "}
                <Link href="/ayuda" className="underline">Más información</Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

function SizePicker({
  sizes,
  value,
  onChange,
  label,
  compact,
  isAvailable = () => true,
}: {
  sizes: Size[]
  value: Size | null
  onChange: (s: Size) => void
  label?: string
  compact?: boolean
  isAvailable?: (s: Size) => boolean
}) {
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-3")} role="radiogroup" aria-label={label ? `Talla de ${label}` : "Talla"}>
      {sizes.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={isAvailable(s) ? `Talla ${s}` : `Talla ${s}, agotada`}
          disabled={!isAvailable(s)}
          onClick={() => onChange(s)}
          className={cn(
            "rounded-md border text-[12px] font-medium transition-colors",
            compact ? "h-9 w-11" : "h-11",
            value === s ? "border-carbon-ink bg-carbon-ink text-white" : "border-stone-gray hover:border-carbon-ink",
            "disabled:cursor-not-allowed disabled:border-soft-mist disabled:text-stone-gray disabled:line-through",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

function TierTable({ product, totalQty }: { product: Product; totalQty: number }) {
  const steps = [{ minQty: 1, unitPrice: product.price }, ...[...product.tiers].sort((a, b) => a.minQty - b.minQty)]
  const active = unitPriceFor(product, totalQty)
  return (
    <ul className="mt-4 grid border border-carbon-ink" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
      {steps.map((s, i) => {
        const nextMin = steps[i + 1]?.minQty
        const label = nextMin ? (nextMin - 1 === s.minQty ? `${s.minQty} u.` : `${s.minQty}–${nextMin - 1} u.`) : `${s.minQty}+ u.`
        const isActive = s.unitPrice === active
        return (
          <li
            key={s.minQty}
            className={cn(
              "border-carbon-ink px-3 py-2.5 text-center not-last:border-r",
              isActive ? "bg-carbon-ink text-white" : "bg-white",
            )}
          >
            <p className="text-micro uppercase tracking-label opacity-80">{label}</p>
            <p className="mt-0.5 text-body font-medium">{formatPrice(s.unitPrice)}</p>
          </li>
        )
      })}
    </ul>
  )
}
