import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { byCategory } from "@/lib/catalog"
import { getCatalog } from "@/lib/data/catalog"
import { PageHeader } from "@/components/product/shop-view"
import { ProductGrid } from "@/components/product/product-card"
import { SectionHeading } from "@/components/home/section-heading"

export const metadata: Metadata = {
  title: "Productos",
  description: "Polos, camiseros, tank tops, hoodies, joggers y conjuntos RIVIBE, organizados por sección.",
}

const sectionHref = (slug: string) => (slug === "conjuntos" ? "/conjuntos" : `/productos/${slug}`)

export default async function ProductsPage() {
  const { products, categories, setsCategory } = await getCatalog()
  const sections = [...categories, setsCategory]
  return (
    <div className="page-container">
      <PageHeader
        title="Productos"
        description="Explora por sección. Precios especiales desde 3 y 5 unidades del mismo producto."
        crumbs={[{ label: "Productos" }]}
      />

      {/* Accesos por sección */}
      <nav aria-label="Secciones" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {sections.map((s) => (
          <Link key={s.slug} href={sectionHref(s.slug)} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-warm-fog">
              <Image
                src={s.cover}
                alt=""
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <p className="label-caps mt-3 group-hover:underline">{s.name}</p>
            <p className="text-micro text-smoke-charcoal">{byCategory(products, s.slug).length} productos</p>
          </Link>
        ))}
      </nav>

      {sections.map((s) => (
        <section key={s.slug} id={s.slug} className="scroll-mt-28 pt-section">
          <SectionHeading title={s.name} link={{ label: "Ver sección", href: sectionHref(s.slug) }} />
          <ProductGrid products={byCategory(products, s.slug)} />
        </section>
      ))}
    </div>
  )
}
