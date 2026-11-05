"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

import { useCatalog } from "@/components/catalog-provider"
import { useFavorites } from "@/lib/cart-store"
import { ProductGrid } from "@/components/product/product-card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FavoritesGrid() {
  const favorites = useFavorites()
  const { products } = useCatalog()
  const items = products.filter((p) => favorites.includes(p.slug))

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <Heart className="mx-auto size-8" strokeWidth={1} />
        <p className="mt-5 text-heading">Aún no tienes favoritos</p>
        <p className="mt-2 text-body text-smoke-charcoal">Toca el corazón en cualquier prenda para guardarla aquí.</p>
        <Link href="/catalogo" className={cn(buttonVariants({ variant: "ink", size: "cta" }), "mt-8")}>
          Ver catálogo
        </Link>
      </div>
    )
  }
  return <ProductGrid products={items} quickAdd />
}
