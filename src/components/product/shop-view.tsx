import Link from "next/link"

import { type Product } from "@/lib/catalog"
import { CategoryTabs } from "@/components/product/category-tabs"
import { SortableGrid } from "@/components/product/sortable-grid"

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta" className="pt-6 text-micro uppercase tracking-label text-smoke-charcoal">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link href="/" className="hover:underline">Inicio</Link></li>
        {items.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {c.href ? (
              <Link href={c.href} className="hover:underline">{c.label}</Link>
            ) : (
              <span className="text-black" aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHeader({
  title,
  description,
  crumbs,
}: {
  title: string
  description?: string
  crumbs: Crumb[]
}) {
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <header className="pt-8 pb-8 md:pt-12">
        <h1 className="text-display font-normal md:text-[40px]">{title}</h1>
        {description && <p className="mt-3 max-w-lg text-body text-smoke-charcoal">{description}</p>}
      </header>
    </>
  )
}

export function ShopView({
  title,
  description,
  crumbs,
  products,
  tabs,
  quickAdd,
}: {
  title: string
  description?: string
  crumbs: Crumb[]
  products: Product[]
  tabs?: { value: string; label: string; href: string; active: boolean }[]
  quickAdd?: boolean
}) {
  return (
    <div className="page-container">
      <PageHeader title={title} description={description} crumbs={crumbs} />
      <SortableGrid
        products={products}
        quickAdd={quickAdd}
        tabs={tabs && <CategoryTabs className="min-w-0 flex-1" items={tabs} />}
      />
    </div>
  )
}
