"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus } from "lucide-react"

import { formatPrice, isLifestyle } from "@/lib/catalog"
import { removeLine, setLineQty } from "@/lib/cart-store"
import { type PricedLine, type ProductGroup, describeLine } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export function QtyStepper({
  value,
  onChange,
  min = 1,
  size = "sm",
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  size?: "sm" | "lg"
}) {
  const btn = size === "lg" ? "size-11" : "size-7"
  return (
    <div className={cn("flex items-center border border-carbon-ink", size === "lg" ? "h-12 rounded-md" : "h-7")}>
      <button
        type="button"
        aria-label="Quitar uno"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn("flex items-center justify-center", btn)}
      >
        <Minus className="size-3" />
      </button>
      <span className="w-6 text-center text-caption" aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label="Agregar uno"
        onClick={() => onChange(value + 1)}
        className={cn("flex items-center justify-center", btn)}
      >
        <Plus className="size-3" />
      </button>
    </div>
  )
}

export function CartLineItem({ line, onNavigate }: { line: PricedLine; onNavigate?: () => void }) {
  const discounted = line.unitPrice < line.product.price
  return (
    <li className="flex gap-4 py-5">
      <Link href={`/producto/${line.slug}`} onClick={onNavigate} className="relative aspect-[3/4] w-20 shrink-0 bg-white">
        <Image
          src={line.image}
          alt={line.product.name}
          fill
          sizes="80px"
          className={isLifestyle(line.product, line.image) ? "object-cover" : "object-contain"}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col text-caption">
        <div className="flex justify-between gap-3">
          <Link href={`/producto/${line.slug}`} onClick={onNavigate} className="font-medium hover:underline">
            {line.product.name}
          </Link>
          <span className="shrink-0">{formatPrice(line.total)}</span>
        </div>
        <p className="mt-1 text-smoke-charcoal">{describeLine(line)}</p>
        <p className="mt-1">
          {formatPrice(line.unitPrice)} c/u
          {discounted && <span className="ml-2 text-smoke-charcoal line-through">{formatPrice(line.product.price)}</span>}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QtyStepper value={line.qty} min={0} onChange={(n) => setLineQty(line.id, n)} />
          <button
            type="button"
            onClick={() => removeLine(line.id)}
            className="text-smoke-charcoal underline underline-offset-2 hover:text-black"
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  )
}

/** Mensaje de precio por volumen por producto: "Agrega 1 más y paga S/ 25 c/u" */
export function VolumeProgress({ group, compact }: { group: ProductGroup; compact?: boolean }) {
  const { product, qty, unitPrice, next } = group
  if (product.tiers.length === 0) return null
  const active = unitPrice < product.price
  return (
    <div className={cn("px-5 py-2.5 text-caption", active ? "bg-blush-sand" : "bg-warm-fog", !compact && "py-3")}>
      <span className="font-medium">{product.name}</span>
      <span className="text-smoke-charcoal"> · {qty} u. · </span>
      {active && <span>Precio especial {formatPrice(unitPrice)} c/u activado. </span>}
      {next && (
        <span>
          Agrega {next.missing} más (cualquier color o talla) y paga {formatPrice(next.unitPrice)} c/u.
        </span>
      )}
    </div>
  )
}
