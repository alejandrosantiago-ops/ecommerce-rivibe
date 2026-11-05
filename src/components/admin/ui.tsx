import { ArrowDownRight, ArrowUpRight, CircleCheck, CircleX, Clock } from "lucide-react"
import type { PaymentStatus } from "@/lib/admin-data"
import { cn } from "@/lib/utils"

/** Título de página del panel */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div>
        <h1 className="text-[26px] leading-tight font-normal">{title}</h1>
        {description && <p className="mt-1.5 text-[13px] text-smoke-charcoal">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("border border-soft-mist bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-soft-mist px-5 py-3.5">
          <h2 className="text-[13px] font-medium">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * Estado de pago: el color nunca va solo, siempre con ícono + etiqueta.
 * Colores de estado reservados (good / warning / critical).
 */
const statusMap: Record<PaymentStatus, { label: string; icon: typeof Clock; color: string }> = {
  pendiente: { label: "Por verificar", icon: Clock, color: "#c98a00" },
  verificado: { label: "Verificado", icon: CircleCheck, color: "#0ca30c" },
  rechazado: { label: "Rechazado", icon: CircleX, color: "#d03b3b" },
}

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const { label, icon: Icon, color } = statusMap[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] whitespace-nowrap">
      <Icon className="size-3.5 shrink-0" style={{ color }} strokeWidth={2} aria-hidden />
      {label}
    </span>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px]">
      <span className="size-1.5 rounded-full" style={{ background: active ? "#0ca30c" : "#cccccc" }} aria-hidden />
      {active ? "Activo" : "Inactivo"}
    </span>
  )
}

/** Stat tile: etiqueta · valor · variación vs. período nombrado */
export function StatTile({
  label,
  value,
  delta,
  period = "vs. octubre",
  upIsGood = true,
  note,
}: {
  label: string
  value: string
  delta?: number
  period?: string
  upIsGood?: boolean
  note?: string
}) {
  const up = (delta ?? 0) >= 0
  const good = up === upIsGood
  const Arrow = up ? ArrowUpRight : ArrowDownRight
  return (
    <div className="border border-soft-mist bg-white px-5 py-4">
      <p className="text-[12px] text-smoke-charcoal">{label}</p>
      <p className="mt-2 text-[26px] leading-none font-medium tabular-nums">{value}</p>
      {delta !== undefined && (
        <p className="mt-2 flex items-center gap-1 text-[12px] text-smoke-charcoal">
          <Arrow className="size-3.5" style={{ color: good ? "#0ca30c" : "#d03b3b" }} aria-hidden />
          <span className="text-black tabular-nums">
            {up ? "+" : "−"}
            {Math.abs(delta * 100).toFixed(0)}%
          </span>
          {period}
        </p>
      )}
      {note && <p className="mt-2 text-[12px] text-smoke-charcoal">{note}</p>}
    </div>
  )
}

export const th = "px-4 py-3 text-left text-[11px] font-medium tracking-label text-smoke-charcoal uppercase"
export const td = "px-4 py-3 text-[13px] align-middle whitespace-nowrap"
