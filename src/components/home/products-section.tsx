import type { Product } from "@/lib/catalog"
import type { HomeSection } from "@/lib/home"
import { ProductGrid } from "@/components/product/product-card"
import { SectionHeading, sectionLink } from "@/components/home/section-heading"

/** Grilla con los productos que eligió la marca, en su orden */
export function ProductsSection({ section, products }: { section: HomeSection; products: Product[] }) {
  const chosen = (section.data.productSlugs ?? [])
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => !!p)
  if (!chosen.length) return null

  return (
    <section className="page-container pt-section">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} link={sectionLink(section)} />
      <ProductGrid products={chosen} />
    </section>
  )
}
