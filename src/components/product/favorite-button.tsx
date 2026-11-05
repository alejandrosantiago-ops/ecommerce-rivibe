"use client"

import { Heart } from "lucide-react"
import { toggleFavorite, useFavorites } from "@/lib/cart-store"
import { cn } from "@/lib/utils"

export function FavoriteButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const active = useFavorites().includes(slug)
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Quitar ${name} de favoritos` : `Agregar ${name} a favoritos`}
      onClick={() => toggleFavorite(slug)}
      className={cn("flex size-8 items-center justify-center text-black transition-opacity hover:opacity-60", className)}
    >
      <Heart className="size-4" strokeWidth={1.5} fill={active ? "currentColor" : "none"} />
    </button>
  )
}
