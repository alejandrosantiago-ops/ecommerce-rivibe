import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { formatPrice } from "@/lib/catalog"
import { getCatalog } from "@/lib/data/catalog"
import { Breadcrumbs } from "@/components/product/shop-view"
import { ProductGrid } from "@/components/product/product-card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Ofertas — Shopping Days",
  description: "Packs Shopping Days y precios especiales desde 3 y 5 unidades del mismo producto.",
}

const steps = [
  { n: "01", title: "Elige un producto", text: "Cualquier prenda con precio por volumen." },
  { n: "02", title: "Suma 3 o 5 unidades", text: "Del mismo producto, combinando colores y tallas como quieras." },
  { n: "03", title: "Paga menos por cada una", text: "El precio especial se activa solo en tu carrito." },
]

export default async function OffersPage() {
  const { products } = await getCatalog()
  const offers = products.filter((p) => p.kind === "oferta")
  const volumeGarments = products.filter((p) => p.kind === "prenda" && p.tiers.length > 0)
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: "Ofertas" }]} />
      <header className="pt-8 pb-10 md:pt-12">
        <p className="label-caps text-smoke-charcoal">Shopping Days</p>
        <h1 className="mt-3 text-display font-normal md:text-[40px] md:leading-[1.1]">Más prendas, mejor precio</h1>
        <p className="mt-3 max-w-md text-body text-smoke-charcoal">
          Packs por tiempo limitado: elige la talla de cada prenda y agrégalo a tu carrito.
        </p>
      </header>

      <ul className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => (
          <li key={o.slug}>
            <article className="group">
              <Link href={`/producto/${o.slug}`} className="block">
                <div className="relative aspect-[466/659] overflow-hidden bg-slate">
                  <Image
                    src={o.lifestyle[0]}
                    alt={`Oferta Shopping Days: ${o.name} a ${formatPrice(o.price)}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              </Link>
              <div className="flex items-start justify-between gap-4 pt-4">
                <div>
                  <h2 className="text-body">
                    <Link href={`/producto/${o.slug}`} className="hover:underline">{o.name}</Link>
                  </h2>
                  <p className="mt-1 text-caption text-smoke-charcoal">
                    {o.pieces?.length} prendas · elige la talla de cada una
                  </p>
                </div>
                <p className="shrink-0 text-heading">{formatPrice(o.price)}</p>
              </div>
              <Link
                href={`/producto/${o.slug}`}
                className={cn(buttonVariants({ size: "cta" }), "mt-4 h-11 w-full")}
              >
                Elegir tallas
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <section className="mt-section bg-blush-sand px-4 py-12 md:px-12">
        <h2 className="text-heading font-bold">Precios por volumen</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="border-t border-carbon-ink pt-4">
              <p className="text-micro tracking-label text-smoke-charcoal">{s.n}</p>
              <h3 className="mt-2 text-body font-medium">{s.title}</h3>
              <p className="mt-1 text-caption text-smoke-charcoal">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pt-section">
        <h2 className="mb-8 text-heading font-bold">Productos con precio por volumen</h2>
        <ProductGrid products={volumeGarments} />
      </section>
    </div>
  )
}
