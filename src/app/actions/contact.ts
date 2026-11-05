"use server"

import { db } from "@/lib/db"
import { CONTACT_TOPICS, isEmail, isPhone, normalizePhone } from "@/lib/peru"

export type ContactState = {
  ok?: boolean
  name?: string
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

const FIELDS = ["nombre", "celular", "email", "ciudad", "motivo", "mensaje"] as const

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "").trim()])) as Record<
    (typeof FIELDS)[number],
    string
  >
  // Campo trampa para bots: se responde "ok" sin guardar nada
  if (String(formData.get("website") ?? "")) return { ok: true, name: "" }

  const fieldErrors: Record<string, string> = {}
  if (values.nombre.length < 2) fieldErrors.nombre = "Ingresa tu nombre."
  if (!isPhone(values.celular)) fieldErrors.celular = "Ingresa un celular de 9 dígitos que empiece con 9."
  if (values.email && !isEmail(values.email)) fieldErrors.email = "Correo inválido."
  if (!CONTACT_TOPICS.includes(values.motivo)) fieldErrors.motivo = "Elige un motivo."
  if (values.mensaje.length < 5) fieldErrors.mensaje = "Cuéntanos un poco más."
  if (values.mensaje.length > 2000) fieldErrors.mensaje = "Máximo 2000 caracteres."
  if (formData.get("privacidad") !== "on") fieldErrors.privacidad = "Debes aceptar el uso de tus datos."
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, error: "Revisa los datos marcados." }

  try {
    await db.contactMessage.create({
      data: {
        name: values.nombre,
        phone: normalizePhone(values.celular),
        email: values.email || null,
        city: values.ciudad || null,
        topic: values.motivo,
        message: values.mensaje,
      },
    })
  } catch (e) {
    console.error("sendContactMessage", e)
    return { error: "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.", values }
  }
  return { ok: true, name: values.nombre.split(" ")[0] }
}
