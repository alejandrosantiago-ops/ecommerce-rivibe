import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getCatalog } from "@/lib/data/catalog"
import { CatalogProvider } from "@/components/catalog-provider"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { cn } from "@/lib/utils"

export default async function NotFound() {
  const catalog = await getCatalog()
  return (
    <CatalogProvider catalog={catalog}>
    <AnnouncementBar />
    <SiteHeader />
    <main className="flex-1">
    <div className="page-container flex min-h-[60svh] flex-col items-center justify-center py-24 text-center">
      <p className="label-caps text-smoke-charcoal">Error 404</p>
      <h1 className="mt-4 text-display font-normal">Esta página no existe</h1>
      <p className="mt-3 max-w-sm text-body text-smoke-charcoal">
        Puede que el producto ya no esté disponible o que el enlace sea incorrecto.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/catalogo" className={cn(buttonVariants({ size: "cta" }))}>Ver catálogo</Link>
        <Link href="/" className={cn(buttonVariants({ variant: "ink", size: "cta" }))}>Ir al inicio</Link>
      </div>
    </div>
    </main>
    <SiteFooter categories={catalog.categories} />
    </CatalogProvider>
  )
}
