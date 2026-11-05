"use client"

import Link from "next/link"
import { Ruler } from "lucide-react"

import { type SizeGuide, SIZES } from "@/lib/catalog"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function SizeTable({ guide }: { guide: SizeGuide }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-caption">
        <caption className="label-caps mb-3 text-left">{guide.title}</caption>
        <thead>
          <tr className="bg-carbon-ink text-white">
            <th scope="col" className="px-3 py-2.5 text-left font-medium">Talla</th>
            {guide.columns.map((c) => (
              <th key={c} scope="col" className="px-3 py-2.5 text-right font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIZES.map((s) => (
            <tr key={s} className="border-b border-soft-mist">
              <th scope="row" className="px-3 py-2.5 text-left font-medium">{s}</th>
              {(guide.rows[s] ?? []).map((v, i) => (
                <td key={i} className="px-3 py-2.5 text-right tabular-nums">{v} cm</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SizeGuideSheet({ guide }: { guide: SizeGuide }) {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center gap-1.5 text-caption underline underline-offset-2">
        <Ruler className="size-3.5" strokeWidth={1.5} /> Guía de tallas
      </SheetTrigger>
      <SheetContent className="w-full gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-lg">
        <div className="flex h-(--header-h) shrink-0 items-center border-b border-carbon-ink px-5">
          <SheetTitle className="label-caps">Guía de tallas</SheetTitle>
        </div>
        <div className="space-y-6 overflow-y-auto p-5">
          <SizeTable guide={guide} />
          <p className="text-caption text-smoke-charcoal">
            Medidas de la prenda en plano, en centímetros. Si dudas entre dos tallas, escríbenos por WhatsApp.
          </p>
          <Link href="/guia-de-tallas" className="text-caption underline underline-offset-2">
            Ver todas las guías
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
