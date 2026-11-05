import { getCatalog } from "@/lib/data/catalog"
import { CatalogProvider } from "@/components/catalog-provider"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { WhatsAppButton } from "@/components/layout/whatsapp-button"

/** Layout de la tienda pública (el panel /admin usa el suyo) */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog()
  return (
    <CatalogProvider catalog={catalog}>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={catalog.categories} />
      <WhatsAppButton />
    </CatalogProvider>
  )
}
