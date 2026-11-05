"use client"

import Link from "next/link"

import { formatPrice } from "@/lib/catalog"
import { clearCart, useCart } from "@/lib/cart-store"
import { buttonVariants } from "@/components/ui/button"
import { CartLineItem, VolumeProgress } from "@/components/cart/cart-line"
import { CartAlert } from "@/components/cart/cart-alert"
import { cn } from "@/lib/utils"

export function CartPage() {
  const cart = useCart()

  if (!cart.ready) {
    return <p className="py-24 text-center text-body text-smoke-charcoal">Cargando tu carrito…</p>
  }

  if (cart.lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-heading">Tu carrito está vacío</p>
        <p className="mt-2 text-body text-smoke-charcoal">
          Lleva 3 o 5 unidades del mismo producto y accede a precios especiales.
        </p>
        <Link href="/catalogo" className={cn(buttonVariants({ variant: "ink", size: "cta" }), "mt-8")}>
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-8">
        <CartAlert message={cart.error} className="mb-3" />
        <div className="space-y-px">
          {cart.groups.map((g) => (
            <VolumeProgress key={g.product.slug} group={g} />
          ))}
        </div>
        <ul className="divide-y divide-soft-mist border-b border-soft-mist">
          {cart.lines.map((l) => (
            <CartLineItem key={l.id} line={l} />
          ))}
        </ul>
        <button type="button" onClick={clearCart} className="mt-4 text-caption underline underline-offset-2">
          Vaciar carrito
        </button>
      </div>

      <aside className="md:col-span-4">
        <div className="border border-carbon-ink p-5 md:sticky md:top-[calc(var(--header-h)+24px)]">
          <h2 className="label-caps">Resumen</h2>
          <dl className="mt-5 space-y-2 text-caption">
            <div className="flex justify-between">
              <dt>Prendas</dt>
              <dd>{cart.units}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Precio regular</dt>
              <dd>{formatPrice(cart.regular)}</dd>
            </div>
            {cart.savings > 0 && (
              <div className="flex justify-between">
                <dt>Ahorro por volumen</dt>
                <dd>− {formatPrice(cart.savings)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-soft-mist pt-3 text-body font-medium">
              <dt>Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-caption text-smoke-charcoal">El envío vía Shalom se coordina en el checkout.</p>
          <Link href="/checkout" className={cn(buttonVariants({ size: "cta" }), "mt-5 h-12 w-full")}>
            Finalizar compra
          </Link>
          <Link href="/catalogo" className="mt-3 block text-center text-caption underline underline-offset-2">
            Seguir comprando
          </Link>
        </div>
      </aside>
    </div>
  )
}
