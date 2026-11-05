import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCatalog, getCategory, getProduct, getSizeGuide } from "@/lib/data/catalog"
import { ProductDetail } from "@/components/product/product-detail"
import { ProductGrid } from "@/components/product/product-card"
import { Breadcrumbs, type Crumb } from "@/components/product/shop-view"

export async function generateStaticParams() {
  const { products } = await getCatalog()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  return product ? { title: product.name, description: product.description } : {}
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params
  const [product, { products }] = await Promise.all([getProduct(slug), getCatalog()])
  if (!product) notFound()
  const [category, sizeGuide] = await Promise.all([getCategory(product.categorySlug), getSizeGuide(product.sizeGuide)])

  const crumbs: Crumb[] =
    product.kind === "oferta"
      ? [{ label: "Ofertas", href: "/ofertas" }]
      : product.kind === "conjunto"
        ? [{ label: "Conjuntos", href: "/conjuntos" }]
        : [
            { label: "Productos", href: "/productos" },
            { label: category?.name ?? "", href: `/productos/${product.categorySlug}` },
          ]

  // Complementos: primero de otra categoría (para armar outfit)
  const related = products
    .filter((p) => p.slug !== product.slug && p.kind === "prenda")
    .sort((a, b) => Number(a.categorySlug === product.categorySlug) - Number(b.categorySlug === product.categorySlug))
    .slice(0, 4)

  return (
    <div className="page-container">
      <div className="pb-6">
        <Breadcrumbs items={[...crumbs, { label: product.name }]} />
      </div>
      <ProductDetail product={product} sizeGuide={sizeGuide} />
      <section className="pt-section">
        <h2 className="mb-8 text-heading font-bold">Completa tu outfit</h2>
        <ProductGrid products={related} />
      </section>
    </div>
  )
}
