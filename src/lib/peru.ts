export const DEPARTAMENTOS = [
  "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica",
  "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco",
  "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali",
]

export const PAYMENT_OPTIONS = [
  { value: "YAPE", label: "Yape", text: "Te enviamos el número y QR por WhatsApp al confirmar tu pedido." },
  { value: "PLIN", label: "Plin", text: "Te enviamos el número por WhatsApp al confirmar tu pedido." },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria", text: "BCP, Interbank o BBVA. Envíanos la constancia por WhatsApp." },
  { value: "TARJETA", label: "Tarjeta de crédito o débito", text: "Pago en línea (disponible próximamente).", disabled: true },
] as const

export const CONTACT_TOPICS = [
  "Quiero hacer un pedido",
  "Pedido por mayor",
  "Tallas y medidas",
  "Envío / seguimiento",
  "Cambios",
  "Otro",
]

export const isDni = (v: string) => /^\d{8}$/.test(v)
/** Celular peruano: 9 dígitos empezando en 9 (se aceptan espacios y +51) */
export const normalizePhone = (v: string) => v.replace(/[\s-]/g, "").replace(/^\+?51(?=9\d{8}$)/, "")
export const isPhone = (v: string) => /^9\d{8}$/.test(normalizePhone(v))
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
