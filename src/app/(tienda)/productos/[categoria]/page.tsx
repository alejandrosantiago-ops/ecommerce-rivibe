import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { byCategory } from "@/lib/catalog"
import { getCatalog, getCategory } from "@/lib/data/catalog"
import { ShopView } from "@/components/product/shop-view"

export async function generateStaticParams() {
  const { categories } = await getCatalog()
  return categories.map((c) => ({ categoria: c.slug }))
}

export async function generateMetadata({ params }: PageProps<"/productos/[categoria]">): Promise<Metadata> {
  const { categoria } = await params
  const category = await getCategory(categoria)
  return category ? { title: category.name, description: category.description } : {}
}

export default async function CategoryPage({ params }: PageProps<"/productos/[categoria]">) {
  const { categoria } = await params
  if (categoria === "conjuntos") redirect("/conjuntos")
  const [category, { products, categories }] = await Promise.all([getCategory(categoria), getCatalog()])
  if (!category) notFound()

  return (
    <ShopView
      title={category.name}
      description={category.description}
      crumbs={[{ label: "Productos", href: "/productos" }, { label: category.name }]}
      products={byCategory(products, category.slug)}
      tabs={[
        { value: "todo", label: "Todo", href: "/productos", active: false },
        ...categories.map((c) => ({
          value: c.slug,
          label: c.name,
          href: `/productos/${c.slug}`,
          active: c.slug === category.slug,
        })),
      ]}
    />
  )
}
