"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu } from "lucide-react"

import { useCatalog } from "@/components/catalog-provider"
import { WhatsAppIcon } from "@/components/icons/social-icons"
import { mainNav, site } from "@/lib/site"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const { categories, setsCategory } = useCatalog()
  const [open, setOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(true)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label="Abrir menú" className="-ml-2 inline-flex size-9 items-center justify-center xl:hidden">
        <Menu className="size-5" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent side="left" className="w-[86%] gap-0 rounded-none border-carbon-ink shadow-none sm:max-w-sm">
        <div className="flex h-(--header-h) items-center border-b border-carbon-ink px-5">
          <SheetTitle className="label-caps">Menú</SheetTitle>
        </div>
        <nav aria-label="Menú móvil" className="flex-1 overflow-y-auto px-5 py-2">
          <ul>
            {mainNav.map((item) =>
              "menu" in item ? (
                <li key={item.href} className="border-b border-soft-mist">
                  <button
                    type="button"
                    aria-expanded={productsOpen}
                    onClick={() => setProductsOpen((o) => !o)}
                    className="flex w-full items-center justify-between py-4 text-heading"
                  >
                    {item.label}
                    <ChevronDown className={cn("size-4 transition-transform", productsOpen && "rotate-180")} />
                  </button>
                  {productsOpen && (
                    <ul className="space-y-3 pb-5 pl-1 text-body text-smoke-charcoal">
                      <li>
                        <Link href="/productos" onClick={close} className="text-black underline underline-offset-2">
                          Ver todos los productos
                        </Link>
                      </li>
                      {[...categories, setsCategory].map((c) => (
                        <li key={c.slug}>
                          <Link href={c.slug === "conjuntos" ? "/conjuntos" : `/productos/${c.slug}`} onClick={close}>
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.href} className="border-b border-soft-mist">
                  <Link href={item.href} onClick={close} className="block py-4 text-heading">
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <ul className="mt-8 space-y-3 text-caption text-smoke-charcoal">
            <li><Link href="/cuenta" onClick={close}>Mi cuenta</Link></li>
            <li><Link href="/favoritos" onClick={close}>Favoritos</Link></li>
            <li><Link href="/guia-de-tallas" onClick={close}>Guía de tallas</Link></li>
            <li>
              <a href={site.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                <WhatsAppIcon className="size-4" /> Atención por WhatsApp
              </a>
            </li>
          </ul>
        </nav>
        <p className="bg-carbon-ink px-5 py-3 text-center text-micro uppercase tracking-label text-white">
          {site.announcement}
        </p>
      </SheetContent>
    </Sheet>
  )
}
