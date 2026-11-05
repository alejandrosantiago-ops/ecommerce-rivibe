"use client"

import { useState } from "react"
import { Download, ImageIcon } from "lucide-react"

import { formatPrice } from "@/lib/catalog"
import { type Payment, type PaymentStatus, payments as initial } from "@/lib/admin-data"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CategoryTabs } from "@/components/product/category-tabs"
import { AdminPageHeader, Panel, StatTile, StatusBadge, td, th } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

const filters: { value: PaymentStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Por verificar" },
  { value: "verificado", label: "Verificados" },
  { value: "rechazado", label: "Rechazados" },
]

export function PaymentsAdmin() {
  // Estado local solo para el diseño: aprobar/rechazar cambia la fila en pantalla
  const [rows, setRows] = useState(initial)
  const [filter, setFilter] = useState<PaymentStatus | "todos">("todos")
  const [selected, setSelected] = useState<Payment | null>(null)

  const list = rows.filter((p) => filter === "todos" || p.status === filter)
  const sum = (s: PaymentStatus) => rows.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0)
  const count = (s: PaymentStatus) => rows.filter((p) => p.status === s).length

  const setStatus = (id: string, status: PaymentStatus) => {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    setSelected(null)
  }

  return (
    <>
      <AdminPageHeader
        title="Pagos"
        description="Verifica los pagos por Yape, Plin y transferencia antes de despachar por Shalom"
        actions={
          <button type="button" className={cn(buttonVariants({ variant: "ink", size: "cta" }))}>
            <Download className="size-4" /> Exportar
          </button>
        }
      />

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Por verificar" value={formatPrice(sum("pendiente"))} note={`${count("pendiente")} pagos`} />
        <StatTile label="Verificados" value={formatPrice(sum("verificado"))} note={`${count("verificado")} pagos`} />
        <StatTile label="Rechazados" value={formatPrice(sum("rechazado"))} note={`${count("rechazado")} pagos`} />
      </div>

      <Panel>
        <div className="border-b border-soft-mist px-4 py-3">
          <CategoryTabs
            items={filters.map((f) => ({ ...f, active: f.value === filter, onSelect: () => setFilter(f.value) }))}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-soft-mist">
              <tr>
                <th className={th}>Pedido</th>
                <th className={th}>Cliente</th>
                <th className={th}>Método</th>
                <th className={th}>Fecha</th>
                <th className={cn(th, "text-right")}>Monto</th>
                <th className={th}>Estado</th>
                <th className={th}><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-mist">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-warm-fog/50">
                  <td className={td}>
                    <p className="font-medium">{p.orderId}</p>
                    <p className="text-[11px] text-smoke-charcoal">{p.id}</p>
                  </td>
                  <td className={td}>
                    <p>{p.customer}</p>
                    <p className="text-[11px] text-smoke-charcoal">{p.destination}</p>
                  </td>
                  <td className={td}>{p.method}</td>
                  <td className={cn(td, "text-smoke-charcoal tabular-nums")}>{p.date}</td>
                  <td className={cn(td, "text-right font-medium tabular-nums")}>{formatPrice(p.amount)}</td>
                  <td className={td}><StatusBadge status={p.status} /></td>
                  <td className={cn(td, "text-right")}>
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      className="text-[12px] underline underline-offset-2 hover:no-underline"
                    >
                      {p.status === "pendiente" ? "Verificar" : "Ver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-md">
          {selected && (
            <>
              <div className="flex h-14 shrink-0 items-center border-b border-carbon-ink px-5">
                <SheetTitle className="label-caps">Pago {selected.id}</SheetTitle>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-5 text-[13px]">
                <StatusBadge status={selected.status} />
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    ["Pedido", selected.orderId],
                    ["Monto", formatPrice(selected.amount)],
                    ["Cliente", selected.customer],
                    ["Celular", selected.phone],
                    ["Método", selected.method],
                    ["Fecha", selected.date],
                    ["Prendas", String(selected.items)],
                    ["Destino", selected.destination],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] tracking-label text-smoke-charcoal uppercase">{k}</dt>
                      <dd className="mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <p className="text-[11px] tracking-label text-smoke-charcoal uppercase">Comprobante</p>
                  <div className="mt-2 flex aspect-[3/4] max-h-80 flex-col items-center justify-center gap-2 border border-dashed border-stone-gray bg-warm-fog/50 text-[12px] text-smoke-charcoal">
                    <ImageIcon className="size-6" strokeWidth={1.25} />
                    Captura de {selected.method} enviada por el cliente
                  </div>
                </div>
                <label className="block">
                  <span className="text-[11px] tracking-label text-smoke-charcoal uppercase">Nota interna</span>
                  <textarea
                    className="mt-1.5 min-h-20 w-full rounded-md border border-stone-gray px-3 py-2 focus:border-carbon-ink focus:outline-none"
                    placeholder="Ej.: monto coincide con el pedido"
                  />
                </label>
              </div>
              {selected.status === "pendiente" && (
                <div className="flex gap-2 border-t border-carbon-ink p-5">
                  <button
                    type="button"
                    onClick={() => setStatus(selected.id, "rechazado")}
                    className={cn(buttonVariants({ variant: "ink", size: "cta" }), "flex-1")}
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(selected.id, "verificado")}
                    className={cn(buttonVariants({ size: "cta" }), "flex-1")}
                  >
                    Aprobar pago
                  </button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
