"use client"

import { useState } from "react"

import type { Product } from "@/lib/catalog"
import { useCatalog } from "@/components/catalog-provider"
import { ProductGrid } from "@/components/product/product-card"
import { SectionHeading } from "@/components/home/section-heading"
import { CategoryTabs } from "@/components/product/category-tabs"

export function BestSellers({ products }: { products: Product[] }) {
  const [active, setActive] = useState("todo")
  const { categories } = useCatalog()
  const present = categories.filter((c) => products.some((p) => p.categorySlug === c.slug))
  const tabs = [{ value: "todo", label: "Todo" }, ...present.map((c) => ({ value: c.slug, label: c.name }))]
  const visible = active === "todo" ? products : products.filter((p) => p.categorySlug === active)

  return (
    <section className="page-container pt-section">
      <SectionHeading title="Lo más vendido" link={{ label: "Ver catálogo", href: "/catalogo" }} />
      <CategoryTabs
        className="mb-8"
        items={tabs.map((t) => ({ ...t, active: t.value === active, onSelect: () => setActive(t.value) }))}
      />
      <ProductGrid products={visible.slice(0, 8)} />
    </section>
  )
}
