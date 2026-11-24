import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"
import { getAdminCatalog } from "@/lib/data/admin"
import { getAdminHomeSections } from "@/lib/data/home"
import { HomeAdmin, type LinkOption, type PickerProduct } from "@/components/admin/home-admin"

export const metadata: Metadata = { title: "Página de inicio" }

export default async function AdminHomeSectionsPage() {
  await requireAdmin()
  const [sections, { products, categories }] = await Promise.all([getAdminHomeSections(), getAdminCatalog()])

  const picker: PickerProduct[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? p.colors.find((c) => c.imageUrl)?.imageUrl ?? "",
    hasTiers: p.tier3 !== null || p.tier5 !== null,
    isActive: p.isActive,
  }))

  const links: LinkOption[] = [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/productos", label: "Productos" },
    { href: "/conjuntos", label: "Conjuntos" },
    { href: "/ofertas", label: "Ofertas" },
    { href: "/tienda", label: "Tienda física" },
    { href: "/contacto", label: "Contacto" },
    { href: "/guia-de-tallas", label: "Guía de tallas" },
    ...categories
      .filter((c) => c.slug !== "conjuntos" && c.slug !== "ofertas")
      .map((c) => ({ href: `/productos/${c.slug}`, label: `Sección: ${c.name}` })),
    ...products.filter((p) => p.isActive).map((p) => ({ href: `/producto/${p.slug}`, label: `Producto: ${p.name}` })),
  ]

  return <HomeAdmin sections={sections} products={picker} links={links} />
}
