/**
 * Datos de EJEMPLO para el diseño del panel de administración.
 * En la fase 5 se reemplazan por consultas Prisma (Order, Payment, User).
 */
import { products } from "@/lib/catalog-data"

export type PaymentStatus = "pendiente" | "verificado" | "rechazado"
export type PaymentMethod = "Yape" | "Plin" | "Transferencia"

export type Payment = {
  id: string
  orderId: string
  customer: string
  phone: string
  method: PaymentMethod
  amount: number
  date: string
  status: PaymentStatus
  items: number
  destination: string
}

export type UserRole = "admin" | "cliente"
export type AdminUser = {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  orders: number
  spent: number
  joined: string
  city: string
  active: boolean
}

const names = [
  "Diego Ramírez", "Luis Fernández", "Carlos Quispe", "Andrés Torres", "Jorge Huamán", "Kevin Rojas",
  "Bruno Castillo", "Renzo Vargas", "Piero Mendoza", "Sebastián Flores", "Gabriel Chávez", "Mateo Salazar",
  "Joaquín Paredes", "Fabricio León", "Rodrigo Díaz", "Adrián Gutiérrez",
]
const cities = ["Lima", "Arequipa", "Trujillo", "Cusco", "Piura", "Chiclayo", "Huancayo", "Ica", "Tacna", "Puno"]
const methods: PaymentMethod[] = ["Yape", "Plin", "Transferencia", "Yape", "Yape", "Plin"]
const statuses: PaymentStatus[] = ["pendiente", "verificado", "verificado", "pendiente", "verificado", "rechazado", "verificado"]
const amounts = [75, 149.99, 120, 100, 238, 69.99, 180, 89.99, 225, 99.99, 300, 139.99, 60, 250, 45, 175]

export const payments: Payment[] = Array.from({ length: 16 }, (_, i) => ({
  id: `PG-${(3120 - i).toString()}`,
  orderId: `RV-${(48210 - i * 7).toString()}`,
  customer: names[i % names.length],
  phone: `9${(51000000 + i * 734521).toString().slice(0, 8)}`,
  method: methods[i % methods.length],
  amount: amounts[i % amounts.length],
  date: `${["02/11", "01/11", "31/10"][Math.floor(i / 6)]}/2026 ${String(9 + (i % 10)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
  status: statuses[i % statuses.length],
  items: 1 + (i % 5),
  destination: `Shalom ${cities[i % cities.length]}`,
}))

export const users: AdminUser[] = [
  {
    id: "U-001", name: "Alejandro Santiago", email: "admin@rivibe.pe", phone: "987 654 321", role: "admin",
    orders: 0, spent: 0, joined: "01/08/2026", city: "Lima", active: true,
  },
  {
    id: "U-002", name: "Equipo RIVIBE", email: "ventas@rivibe.pe", phone: "912 345 678", role: "admin",
    orders: 0, spent: 0, joined: "15/08/2026", city: "Lima", active: true,
  },
  ...names.map((name, i) => ({
    id: `U-${String(i + 3).padStart(3, "0")}`,
    name,
    email: `${name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${i + 7}@gmail.com`,
    phone: `9${String(40000000 + i * 3790713).slice(0, 2)} ${String(100 + i * 37).slice(0, 3)} ${String(200 + i * 53).slice(0, 3)}`,
    role: "cliente" as const,
    orders: (i * 7) % 9 + 1,
    spent: ((i * 7) % 9 + 1) * 84.5,
    joined: `${String((i % 27) + 1).padStart(2, "0")}/${i < 8 ? "09" : "10"}/2026`,
    city: cities[i % cities.length],
    active: i % 9 !== 4,
  })),
]

/** Ventas diarias (S/) — últimos 14 días */
export const dailySales = [
  { day: "20 oct", value: 640 }, { day: "21 oct", value: 520 }, { day: "22 oct", value: 780 },
  { day: "23 oct", value: 910 }, { day: "24 oct", value: 1240 }, { day: "25 oct", value: 1480 },
  { day: "26 oct", value: 860 }, { day: "27 oct", value: 590 }, { day: "28 oct", value: 720 },
  { day: "29 oct", value: 840 }, { day: "30 oct", value: 1120 }, { day: "31 oct", value: 1390 },
  { day: "1 nov", value: 1610 }, { day: "2 nov", value: 980 },
]

/** Unidades vendidas en el mes por producto (top) */
export const topProducts = [
  { slug: "polo-basic-boxy-fit", units: 214 },
  { slug: "polo-basic-oversized", units: 176 },
  { slug: "jogger-baggy-basic", units: 98 },
  { slug: "oferta-4-polos-estampados", units: 61 },
  { slug: "hoodie-basic-oversized", units: 54 },
].map((t) => ({ ...t, name: products.find((p) => p.slug === t.slug)?.name ?? t.slug }))

/** Stock de ejemplo por producto (unidades totales) */
export const stockBySlug: Record<string, number> = Object.fromEntries(
  products.map((p, i) => [p.slug, [124, 86, 7, 42, 63, 4, 51, 38, 0, 77, 22, 15, 9, 30, 40, 25, 18, 12, 60, 35][i % 20]]),
)

export const kpis = {
  monthSales: 12480.5,
  monthSalesDelta: 0.18,
  orders: 156,
  ordersDelta: 0.11,
  avgTicket: 80.0,
  avgTicketDelta: 0.06,
  pendingPayments: payments.filter((p) => p.status === "pendiente").length,
  newCustomers: 38,
  newCustomersDelta: -0.04,
}
