import Link from "next/link"
import { User } from "lucide-react"

import { mainNav } from "@/lib/site"
import { Logo } from "@/components/layout/logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ProductsMenu } from "@/components/layout/products-menu"
import { SearchSheet } from "@/components/layout/search-sheet"
import { FavoritesLink } from "@/components/layout/favorites-link"
import { CartSheet } from "@/components/cart/cart-sheet"
import { cn } from "@/lib/utils"

export const iconBtn =
  "relative inline-flex size-9 items-center justify-center rounded-md text-foreground transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-carbon-ink bg-white">
      <div className="page-container grid h-(--header-h) grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center">
          <MobileNav />
          {/* Menú completo desde 1280px: con 6 opciones no cabe antes sin descentrar el logo */}
          <nav aria-label="Principal" className="hidden xl:block">
            <ul className="flex items-center gap-3.5 2xl:gap-6">
              {mainNav.map((item) => (
                <li key={item.href}>
                  {"menu" in item ? (
                    <ProductsMenu />
                  ) : (
                    <Link href={item.href} className="label-caps underline-offset-4 hover:underline">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Logo preload className="h-5 md:h-6" />

        <div className="flex items-center justify-end gap-0.5 md:gap-1">
          <SearchSheet triggerClassName={iconBtn} />
          <FavoritesLink className={cn(iconBtn, "hidden sm:inline-flex")} />
          <Link href="/cuenta" aria-label="Mi cuenta" className={cn(iconBtn, "hidden sm:inline-flex")}>
            <User className="size-[18px]" strokeWidth={1.5} />
          </Link>
          <CartSheet triggerClassName={iconBtn} />
        </div>
      </div>
    </header>
  )
}
