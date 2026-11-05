"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/catalog"

type Point = { day: string; value: number }

/**
 * Ventas diarias — una sola serie (sin leyenda: el título la nombra).
 * Barras finas con extremo redondeado de 4px anclado a la base, rejilla recesiva,
 * tooltip por barra y vista de tabla para lectores de pantalla.
 */
export function SalesChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.ceil(Math.max(...data.map((d) => d.value)) / 500) * 500
  const ticks = [0, max / 2, max]
  const H = 180

  return (
    <div className="px-5 pt-4 pb-5">
      <div className="relative flex gap-3">
        {/* Eje Y */}
        <div className="relative w-12 shrink-0 text-right text-[11px] text-smoke-charcoal tabular-nums" style={{ height: H }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: H - (t / max) * H }}>
              {t === 0 ? "0" : `${t / 1000}k`}
            </span>
          ))}
        </div>

        <div className="relative flex-1" style={{ height: H }}>
          {ticks.map((t) => (
            <div
              key={t}
              className={t === 0 ? "absolute inset-x-0 border-t border-stone-gray" : "absolute inset-x-0 border-t border-soft-mist"}
              style={{ top: H - (t / max) * H }}
              aria-hidden
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-0.5" role="img" aria-label="Ventas diarias de los últimos 14 días">
            {data.map((d, i) => (
              <div
                key={d.day}
                className="relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className="w-full max-w-6 rounded-t-[4px] transition-colors"
                  style={{
                    height: `${(d.value / max) * 100}%`,
                    background: hover === null || hover === i ? "#000000" : "#cccccc",
                  }}
                />
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 border border-carbon-ink bg-white px-2.5 py-1.5 text-[12px] whitespace-nowrap">
                    <p className="text-smoke-charcoal">{d.day}</p>
                    <p className="font-medium tabular-nums">{formatPrice(d.value)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eje X: etiquetas selectivas */}
      <div className="mt-2 ml-15 flex gap-0.5 text-[11px] text-smoke-charcoal">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center whitespace-nowrap">
            {i % 4 === 0 ? d.day : ""}
          </span>
        ))}
      </div>

      <details className="mt-4 text-[12px]">
        <summary className="cursor-pointer text-smoke-charcoal underline underline-offset-2">Ver como tabla</summary>
        <table className="mt-2 w-full">
          <thead>
            <tr className="text-left text-smoke-charcoal">
              <th className="py-1 font-normal">Día</th>
              <th className="py-1 text-right font-normal">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day} className="border-t border-soft-mist">
                <td className="py-1">{d.day}</td>
                <td className="py-1 text-right tabular-nums">{formatPrice(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
