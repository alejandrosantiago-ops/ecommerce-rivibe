import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import { formatPrice } from "@/lib/catalog"
import { products } from "@/lib/catalog-data"
import { dailySales, kpis, payments, stockBySlug, topProducts } from "@/lib/admin-data"
import { AdminPageHeader, Panel, StatTile, StatusBadge } from "@/components/admin/ui"
import { SalesChart } from "@/components/admin/sales-chart"

export default function AdminHome() {
  const pending = payments.filter((p) => p.status === "pendiente").slice(0, 5)
  const lowStock = products.filter((p) => (stockBySlug[p.slug] ?? 0) < 10).slice(0, 5)
  const maxUnits = Math.max(...topProducts.map((t) => t.units))

  return (
    <>
      <AdminPageHeader title="Resumen" description="Noviembre 2026 · datos de ejemplo" />

      {/* Cifra principal + KPIs */}
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="border border-soft-mist bg-white px-6 py-5 lg:col-span-4">
          <p className="text-[12px] text-smoke-charcoal">Ventas del mes</p>
          <p className="mt-3 text-[40px] leading-none font-medium whitespace-nowrap tabular-nums sm:text-[48px]">{formatPrice(kpis.monthSales)}</p>
          <p className="mt-3 text-[12px] text-smoke-charcoal">
            <span className="text-black">+{(kpis.monthSalesDelta * 100).toFixed(0)}%</span> vs. octubre
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-8 lg:grid-cols-4">
          <StatTile label="Pedidos" value={String(kpis.orders)} delta={kpis.ordersDelta} />
          <StatTile label="Ticket promedio" value={formatPrice(kpis.avgTicket)} delta={kpis.avgTicketDelta} />
          <StatTile label="Clientes nuevos" value={String(kpis.newCustomers)} delta={kpis.newCustomersDelta} />
          <StatTile label="Pagos por verificar" value={String(kpis.pendingPayments)} note="Yape, Plin y transferencias" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-12">
        <Panel title="Ventas diarias (S/) · últimos 14 días" className="lg:col-span-8">
          <SalesChart data={dailySales} />
        </Panel>

        <Panel title="Más vendidos del mes (unidades)" className="lg:col-span-4">
          <ul className="space-y-4 px-5 py-5">
            {topProducts.map((t) => (
              <li key={t.slug}>
                <div className="flex justify-between gap-3 text-[12px]">
                  <span className="truncate">{t.name}</span>
                  <span className="tabular-nums">{t.units}</span>
                </div>
                <div className="mt-1.5 h-2 bg-soft-mist">
                  <div className="h-full bg-carbon-ink" style={{ width: `${(t.units / maxUnits) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-12">
        <Panel
          title="Pagos por verificar"
          className="lg:col-span-8"
          action={<Link href="/admin/pagos" className="text-[12px] underline underline-offset-2">Ver todos</Link>}
        >
          <ul className="divide-y divide-soft-mist">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3 text-[13px]">
                <span className="w-24 font-medium">{p.orderId}</span>
                <span className="min-w-32 flex-1">{p.customer}</span>
                <span className="w-24 text-smoke-charcoal">{p.method}</span>
                <span className="w-24 text-right tabular-nums">{formatPrice(p.amount)}</span>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Stock bajo"
          className="lg:col-span-4"
          action={<Link href="/admin/productos" className="text-[12px] underline underline-offset-2">Inventario</Link>}
        >
          <ul className="divide-y divide-soft-mist">
            {lowStock.map((p) => {
              const stock = stockBySlug[p.slug] ?? 0
              return (
                <li key={p.slug} className="flex items-center justify-between gap-3 px-5 py-3 text-[13px]">
                  <span className="truncate">{p.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px]">
                    <AlertTriangle
                      className="size-3.5"
                      style={{ color: stock === 0 ? "#d03b3b" : "#c98a00" }}
                      aria-hidden
                    />
                    {stock === 0 ? "Agotado" : `${stock} u.`}
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </>
  )
}
