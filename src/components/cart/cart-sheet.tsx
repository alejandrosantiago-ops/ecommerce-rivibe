"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { formatPrice } from "@/lib/catalog"
import { cartUi, useCart } from "@/lib/cart-store"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CartLineItem, VolumeProgress } from "@/components/cart/cart-line"
import { CartAlert } from "@/components/cart/cart-alert"
import { cn } from "@/lib/utils"

export function CartSheet({ triggerClassName }: { triggerClassName?: string }) {
  const { open } = cartUi.useStore()
  const cart = useCart()
  const close = () => cartUi.set({ open: false })

  return (
    <Sheet open={open} onOpenChange={(o) => cartUi.set({ open: o })}>
      <SheetTrigger aria-label={`Carrito, ${cart.units} prendas`} className={triggerClassName}>
        <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
        {cart.units > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center bg-carbon-ink px-0.5 text-[9px] font-medium text-white">
            {cart.units}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-md">
        <div className="flex h-(--header-h) shrink-0 items-center border-b border-carbon-ink px-5">
          <SheetTitle className="label-caps">Carrito ({cart.units})</SheetTitle>
        </div>

        <CartAlert message={cart.error} />
        {!cart.ready ? (
          <div className="flex flex-1 items-center justify-center text-caption text-smoke-charcoal">Cargando tu carrito…</div>
        ) : cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <ShoppingBag className="size-8" strokeWidth={1} />
            <p className="text-body">Tu carrito está vacío.</p>
            <p className="text-caption text-smoke-charcoal">
              Lleva 3 o 5 unidades del mismo producto y accede a precios especiales.
            </p>
            <Link href="/catalogo" onClick={close} className={cn(buttonVariants({ variant: "ink", size: "cta" }))}>
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-px">
              {cart.groups.map((g) => (
                <VolumeProgress key={g.product.slug} group={g} compact />
              ))}
            </div>
            <ul className="flex-1 divide-y divide-soft-mist overflow-y-auto px-5">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} onNavigate={close} />
              ))}
            </ul>
            <div className="space-y-2 border-t border-carbon-ink px-5 py-5 text-caption">
              {cart.savings > 0 && (
                <div className="flex justify-between">
                  <span>Ahorro por volumen</span>
                  <span>− {formatPrice(cart.savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-body font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <p className="text-smoke-charcoal">El envío vía Shalom se coordina en el checkout.</p>
              <div className="grid gap-2 pt-3">
                <Link href="/checkout" onClick={close} className={cn(buttonVariants({ size: "cta" }), "h-11 w-full")}>
                  Finalizar compra
                </Link>
                <Link
                  href="/carrito"
                  onClick={close}
                  className={cn(buttonVariants({ variant: "ink", size: "cta" }), "h-11 w-full")}
                >
                  Ver carrito
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
