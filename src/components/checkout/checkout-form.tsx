"use client"

import { useActionState, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"

import { type CheckoutState, createOrder } from "@/app/actions/order"
import { formatPrice, isLifestyle } from "@/lib/catalog"
import { resetLocalCart, useCart } from "@/lib/cart-store"
import { describeLine } from "@/lib/pricing"
import { DEPARTAMENTOS, PAYMENT_OPTIONS } from "@/lib/peru"
import { site } from "@/lib/site"
import { buttonVariants } from "@/components/ui/button"
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/forms/fields"
import { CartAlert } from "@/components/cart/cart-alert"
import { WhatsAppIcon } from "@/components/icons/social-icons"
import { cn } from "@/lib/utils"

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-carbon-ink pt-6">
      <legend className="flex items-center gap-3">
        <span className="flex size-6 items-center justify-center bg-carbon-ink text-[11px] text-white">{n}</span>
        <span className="label-caps">{title}</span>
      </legend>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

export function CheckoutForm() {
  const cart = useCart()
  const [state, action, pending] = useActionState<CheckoutState, FormData>(createOrder, {})
  const v = state.values ?? {}
  const e = state.fieldErrors ?? {}
  const [payment, setPayment] = useState(v.pago || "YAPE")

  // El servidor ya vació el carrito al crear el pedido
  useEffect(() => {
    if (state.ok) {
      resetLocalCart()
      window.scrollTo({ top: 0 })
    }
  }, [state.ok])

  if (state.ok && state.order) {
    const { order } = state
    return (
      <div className="mx-auto max-w-lg py-16 text-center" role="status">
        <Check className="mx-auto size-8" strokeWidth={1.5} />
        <h2 className="mt-5 text-display font-normal">¡Gracias, {order.firstName}!</h2>
        <p className="mt-3 text-body text-smoke-charcoal">
          Registramos tu pedido <strong className="font-medium text-black">{order.number}</strong> por{" "}
          <strong className="font-medium text-black">{formatPrice(order.total)}</strong>.
        </p>
        <div className="mt-6 border border-carbon-ink p-5 text-left text-caption">
          <p className="label-caps">Siguiente paso: pago con {order.method}</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-smoke-charcoal">
            <li>Escríbenos por WhatsApp indicando tu número de pedido {order.number}.</li>
            <li>Te enviamos los datos de pago; realiza el pago y envíanos la captura.</li>
            <li>Verificamos el pago y despachamos tu pedido por Shalom. Te enviamos la clave de recojo.</li>
          </ol>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={site.whatsappUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "cta" }))}>
            <WhatsAppIcon className="size-4" /> Ir a WhatsApp
          </a>
          <Link href="/" className={cn(buttonVariants({ variant: "ink", size: "cta" }))}>
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (!cart.ready) {
    return <p className="py-24 text-center text-body text-smoke-charcoal">Cargando tu carrito…</p>
  }

  if (cart.lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-heading">No hay productos en tu carrito</p>
        <Link href="/catalogo" className={cn(buttonVariants({ variant: "ink", size: "cta" }), "mt-8")}>
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <form action={action} noValidate className="relative grid gap-10 md:grid-cols-12">
      <Honeypot />
      <div className="space-y-10 md:col-span-7">
        {state.error && (
          <p role="alert" className="border-l-2 border-[#d03b3b] bg-[#d03b3b]/5 px-4 py-3 text-caption">
            {state.error}
          </p>
        )}

        <Step n={1} title="Datos personales">
          <TextField label="Nombres" name="nombres" required autoComplete="given-name" defaultValue={v.nombres} error={e.nombres} />
          <TextField label="Apellidos" name="apellidos" required autoComplete="family-name" defaultValue={v.apellidos} error={e.apellidos} />
          <TextField
            label="DNI"
            name="dni"
            required
            inputMode="numeric"
            maxLength={8}
            hint="Lo necesitas para recoger en Shalom."
            defaultValue={v.dni}
            error={e.dni}
          />
          <TextField label="Celular" name="celular" type="tel" required inputMode="tel" autoComplete="tel" placeholder="9XX XXX XXX" defaultValue={v.celular} error={e.celular} />
          <TextField label="Correo" name="email" type="email" autoComplete="email" className="sm:col-span-2" defaultValue={v.email} error={e.email} />
        </Step>

        <Step n={2} title="Envío vía Shalom">
          <SelectField label="Departamento" name="departamento" options={DEPARTAMENTOS} required defaultValue={v.departamento} error={e.departamento} />
          <TextField label="Provincia" name="provincia" required autoComplete="address-level2" defaultValue={v.provincia} error={e.provincia} />
          <TextField label="Distrito" name="distrito" required autoComplete="address-level3" defaultValue={v.distrito} error={e.distrito} />
          <TextField label="Agencia Shalom de destino" name="agencia" required placeholder="Ej.: Shalom Av. Ejército" defaultValue={v.agencia} error={e.agencia} />
          <TextAreaField
            label="Notas (opcional)"
            name="notas"
            className="sm:col-span-2"
            placeholder="Indicaciones adicionales para tu pedido"
            maxLength={500}
            defaultValue={v.notas}
          />
          <p className="text-caption text-smoke-charcoal sm:col-span-2">
            Recoges tu pedido en la agencia Shalom elegida presentando tu DNI. El costo de envío se coordina por WhatsApp
            según tu destino.
          </p>
        </Step>

        <Step n={3} title="Pago">
          <div className="grid gap-2 sm:col-span-2" role="radiogroup" aria-label="Método de pago">
            {PAYMENT_OPTIONS.map((p) => {
              const disabled = "disabled" in p && p.disabled
              return (
                <label
                  key={p.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
                    payment === p.value ? "border-carbon-ink" : "border-stone-gray",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="radio"
                    name="pago"
                    value={p.value}
                    checked={payment === p.value}
                    disabled={disabled}
                    onChange={() => setPayment(p.value)}
                    className="mt-0.5 size-4 accent-black"
                  />
                  <span>
                    <span className="block text-body">{p.label}</span>
                    <span className="mt-0.5 block text-caption text-smoke-charcoal">{p.text}</span>
                  </span>
                </label>
              )
            })}
            {e.pago && <p className="text-[12px] text-[#b42318]">{e.pago}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-caption text-smoke-charcoal">
              <input type="checkbox" name="terminos" className="mt-0.5 size-4 accent-black" aria-invalid={e.terminos ? true : undefined} />
              Acepto los términos y condiciones y la política de privacidad.
            </label>
            {e.terminos && <p className="mt-1 text-[12px] text-[#b42318]">{e.terminos}</p>}
          </div>
        </Step>
      </div>

      <aside className="md:col-span-5">
        <div className="border border-carbon-ink p-5 md:sticky md:top-[calc(var(--header-h)+24px)]">
          <h2 className="label-caps">Tu pedido ({cart.units})</h2>
          <CartAlert message={cart.error} className="mt-3" />
          <ul className="mt-4 max-h-80 divide-y divide-soft-mist overflow-y-auto">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex gap-3 py-3 text-caption">
                <div className="relative aspect-[3/4] w-14 shrink-0 bg-white">
                  <Image
                    src={l.image}
                    alt=""
                    fill
                    sizes="56px"
                    className={isLifestyle(l.product, l.image) ? "object-cover" : "object-contain"}
                  />
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center bg-carbon-ink text-[10px] text-white">
                    {l.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{l.product.name}</p>
                  <p className="text-smoke-charcoal">{describeLine(l)}</p>
                </div>
                <p className="shrink-0">{formatPrice(l.total)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-soft-mist pt-4 text-caption">
            {cart.savings > 0 && (
              <div className="flex justify-between">
                <dt>Ahorro por volumen</dt>
                <dd>− {formatPrice(cart.savings)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Envío Shalom</dt>
              <dd className="text-smoke-charcoal">Se coordina</dd>
            </div>
            <div className="flex justify-between pt-2 text-heading">
              <dt>Total</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
          </dl>
          <button type="submit" disabled={pending} className={cn(buttonVariants({ size: "cta" }), "mt-5 h-12 w-full")}>
            {pending ? "Registrando pedido…" : "Confirmar pedido"}
          </button>
          <p className="mt-3 text-center text-micro text-smoke-charcoal">
            Precios y stock se confirman al registrar el pedido.
          </p>
        </div>
      </aside>
    </form>
  )
}
