import Image from "next/image"
import Link from "next/link"

import { type Product, formatPrice } from "@/lib/catalog"
import { SectionHeading } from "@/components/home/section-heading"

/** DESIGN.md — Split Editorial Section: dos imágenes a 50%, casi sin separación */
export function EditorialSplit({ sets }: { sets: Product[] }) {
  return (
    <section className="pt-section">
      <div className="page-container">
        <SectionHeading
          eyebrow="Conjuntos"
          title="El outfit perfecto, en un solo set"
          link={{ label: "Ver conjuntos", href: "/conjuntos" }}
        />
      </div>
      <div className="grid gap-1 md:grid-cols-2">
        {sets.map((p) => (
          <Link key={p.slug} href={`/producto/${p.slug}`} className="group relative block">
            <div className="relative aspect-[4/5] overflow-hidden bg-warm-fog lg:aspect-square">
              <Image
                src={p.lifestyle[0]}
                alt={p.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
              />
            </div>
            <div className="page-container flex items-baseline justify-between py-4 md:px-4">
              <p className="label-caps group-hover:underline">{p.name}</p>
              <p className="text-caption">{formatPrice(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
