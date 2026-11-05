import type { Metadata } from "next"

import { getSizeGuides } from "@/lib/data/catalog"
import { PageHeader } from "@/components/product/shop-view"
import { SizeTable } from "@/components/product/size-guide"

export const metadata: Metadata = {
  title: "Guía de tallas",
  description: "Medidas en centímetros de polos oversized, boxy fit, hoodies y joggers RIVIBE.",
}

export default async function SizeGuidePage() {
  const guides = await getSizeGuides()
  return (
    <div className="page-container">
      <PageHeader
        title="Guía de tallas"
        description="Medidas de la prenda en plano, en centímetros. Tallas disponibles: S, M y L."
        crumbs={[{ label: "Guía de tallas" }]}
      />
      <div className="grid gap-12 md:grid-cols-2">
        {guides.map((g) => (
          <SizeTable key={g.key} guide={g} />
        ))}
      </div>
      <div className="mt-section bg-warm-fog p-6 md:p-10">
        <h2 className="label-caps">Cómo medir</h2>
        <ul className="mt-4 grid gap-4 text-caption text-smoke-charcoal md:grid-cols-3">
          <li><strong className="font-medium text-black">Ancho:</strong> de axila a axila con la prenda extendida.</li>
          <li><strong className="font-medium text-black">Largo:</strong> desde el punto más alto del hombro hasta el borde inferior.</li>
          <li><strong className="font-medium text-black">Fit:</strong> oversized y boxy fit son amplios a propósito; si prefieres un calce más ajustado, elige una talla menos.</li>
        </ul>
      </div>
    </div>
  )
}
