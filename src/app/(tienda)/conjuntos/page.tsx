import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { formatPrice } from "@/lib/catalog"
import { getCatalog } from "@/lib/data/catalog"
import { Breadcrumbs } from "@/components/product/shop-view"
import { buttonVariants } from "@/components/ui/button"
import { TierLine } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Conjuntos",
  description: "El outfit perfecto, en un solo set. Elige una talla distinta para cada prenda.",
}

export default async function SetsPage() {
  const sets = (await getCatalog()).products.filter((p) => p.kind === "conjunto")
  return (
    <>
      <div className="page-container">
        <Breadcrumbs items={[{ label: "Conjuntos" }]} />
        <header className="grid gap-4 pt-8 pb-10 md:grid-cols-2 md:items-end md:pt-12">
          <h1 className="text-display font-normal md:text-[40px] md:leading-[1.1]">
            El outfit perfecto, en un solo set
          </h1>
          <p className="max-w-md text-body text-smoke-charcoal md:justify-self-end">
            Prendas pensadas para usarse juntas. ¿Arriba eres M y abajo L? Sin problema: eliges la talla de cada pieza
            por separado.
          </p>
        </header>
      </div>

      <div className="space-y-1">
        {sets.map((p, i) => (
          <article key={p.slug} className="grid bg-warm-fog md:grid-cols-2">
            <div className={cn("grid grid-cols-2 gap-1", i % 2 === 1 && "md:order-2")}>
              {p.lifestyle.slice(0, 2).map((src) => (
                <div key={src} className="relative aspect-[3/4] bg-white">
                  <Image src={src} alt={p.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center px-4 py-10 md:px-12 lg:px-20">
              <p className="label-caps text-smoke-charcoal">{p.fit}</p>
              <h2 className="mt-3 text-display font-normal">{p.name}</h2>
              <p className="mt-3 max-w-md text-body text-smoke-charcoal">{p.description}</p>
              <ul className="mt-5 space-y-1 text-caption">
                {p.pieces?.map((piece) => (
                  <li key={piece.label}>— {piece.label} · tallas S / M / L</li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2">
                {p.colors.map((c) => (
                  <span key={c.slug} title={c.name} className="size-4 border border-black/15" style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <p className="mt-6 text-heading">{formatPrice(p.price)}</p>
              <TierLine product={p} className="mt-1 text-[12px]" />
              <Link
                href={`/producto/${p.slug}`}
                className={cn(buttonVariants({ variant: "ink", size: "cta" }), "mt-7 self-start")}
              >
                Elegir colores y tallas
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
