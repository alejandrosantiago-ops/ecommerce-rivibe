"use client"

import { useActionState, useState } from "react"
import { Check } from "lucide-react"

import { type ContactState, sendContactMessage } from "@/app/actions/contact"
import { CONTACT_TOPICS } from "@/lib/peru"
import { buttonVariants } from "@/components/ui/button"
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/forms/fields"
import { cn } from "@/lib/utils"

/** Formulario de contacto: se guarda en la BD (tabla ContactMessage) */
export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, {})
  // "Enviar otro mensaje" descarta ESTA respuesta y monta un formulario limpio (nueva key)
  const [dismissed, setDismissed] = useState<ContactState | null>(null)
  const [formKey, setFormKey] = useState(0)
  const showSuccess = state.ok && state !== dismissed

  if (showSuccess) {
    return (
      <div className="mt-8 border border-carbon-ink p-6" role="status">
        <Check className="size-6" strokeWidth={1.5} />
        <p className="mt-4 text-heading">¡Gracias{state.name ? `, ${state.name}` : ""}!</p>
        <p className="mt-2 text-body text-smoke-charcoal">
          Recibimos tu mensaje. Te contactaremos pronto por WhatsApp o correo.
        </p>
        <button
          type="button"
          onClick={() => {
            setDismissed(state)
            setFormKey((k) => k + 1)
          }}
          className="mt-6 text-caption underline underline-offset-2"
        >
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  const v = state.ok ? {} : (state.values ?? {})
  const e = state.ok ? {} : (state.fieldErrors ?? {})

  return (
    <form key={formKey} action={action} noValidate className="relative mt-8 grid gap-5 sm:grid-cols-2">
      <Honeypot />
      {state.error && !state.ok && (
        <p role="alert" className="border-l-2 border-[#d03b3b] bg-[#d03b3b]/5 px-3 py-2 text-caption sm:col-span-2">
          {state.error}
        </p>
      )}
      <TextField label="Nombre y apellido" name="nombre" required autoComplete="name" defaultValue={v.nombre} error={e.nombre} className="sm:col-span-2" />
      <TextField label="Celular" name="celular" type="tel" inputMode="tel" required autoComplete="tel" placeholder="9XX XXX XXX" defaultValue={v.celular} error={e.celular} />
      <TextField label="Correo" name="email" type="email" autoComplete="email" defaultValue={v.email} error={e.email} />
      <TextField label="Ciudad" name="ciudad" autoComplete="address-level2" defaultValue={v.ciudad} />
      <SelectField label="Motivo" name="motivo" options={CONTACT_TOPICS} required defaultValue={v.motivo} error={e.motivo} />
      <TextAreaField
        label="Mensaje"
        name="mensaje"
        required
        maxLength={2000}
        className="sm:col-span-2"
        placeholder="Ej.: Quiero 5 polos boxy fit (2 negros, 3 beige) en talla M, envío a Arequipa."
        defaultValue={v.mensaje}
        error={e.mensaje}
      />
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-caption text-smoke-charcoal">
          <input type="checkbox" name="privacidad" className="mt-0.5 size-4 accent-black" aria-invalid={e.privacidad ? true : undefined} />
          Acepto que RIVIBE use mis datos para responder esta consulta.
        </label>
        {e.privacidad && <p className="mt-1 text-[12px] text-[#b42318]">{e.privacidad}</p>}
      </div>
      <button type="submit" disabled={pending} className={cn(buttonVariants({ size: "cta" }), "h-12 sm:col-span-2")}>
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  )
}
