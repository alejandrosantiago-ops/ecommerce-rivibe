"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useFavorites } from "@/lib/cart-store"

export function FavoritesLink({ className }: { className?: string }) {
  const favorites = useFavorites()
  return (
    <Link href="/favoritos" aria-label={`Favoritos (${favorites.length})`} className={className}>
      <Heart className="size-[18px]" strokeWidth={1.5} fill={favorites.length ? "currentColor" : "none"} />
    </Link>
  )
}
