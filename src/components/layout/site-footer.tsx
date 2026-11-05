import Link from "next/link"

import type { Category } from "@/lib/catalog"
import { helpLinks, site, store } from "@/lib/site"
import { Logo } from "@/components/layout/logo"
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons/social-icons"

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-section bg-carbon-ink text-white">
      <div className="page-container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo tone="light" className="h-7" />
          <p className="mt-5 max-w-xs text-caption text-white/70">
            Estilo + comodidad + actitud. Ropa para hombre con fits oversized y boxy fit, enviada a todo el Perú vía
            Shalom.
          </p>
          <Link href="/tienda" className="mt-5 block max-w-xs text-caption text-white/70 hover:text-white">
            <span className="block text-white">Tienda física</span>
            {store.address} · {store.unit}
            <span className="block">
              {store.hours.label} · {store.hours.time}
            </span>
          </Link>
        </div>

        <FooterColumn title="Tienda" className="md:col-span-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/productos/${c.slug}`} className="hover:underline">{c.name}</Link>
            </li>
          ))}
          <li><Link href="/catalogo" className="hover:underline">Catálogo</Link></li>
          <li><Link href="/conjuntos" className="hover:underline">Conjuntos</Link></li>
          <li><Link href="/ofertas" className="hover:underline">Ofertas</Link></li>
        </FooterColumn>

        <FooterColumn title="Ayuda" className="md:col-span-2">
          {helpLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:underline">{l.label}</Link>
            </li>
          ))}
          <li><Link href="/contacto" className="hover:underline">Contacto</Link></li>
        </FooterColumn>

        <div className="md:col-span-4">
          <h2 className="label-caps text-white">Novedades</h2>
          <p className="mt-4 text-caption text-white/70">
            Suscríbete y entérate primero de nuevos drops y de los próximos Shopping Days.
          </p>
          <form className="mt-5 flex items-end gap-3">
            <label htmlFor="newsletter" className="sr-only">Correo electrónico</label>
            <input
              id="newsletter"
              type="email"
              placeholder="Tu correo"
              className="h-10 min-w-0 flex-1 border-0 border-b border-white/60 bg-transparent px-0 text-caption text-white placeholder:text-white/50 focus:border-white focus:outline-none"
            />
            <button
              type="button"
              className="h-9 shrink-0 rounded-md border border-white px-4 text-[12px] font-medium uppercase tracking-label transition-colors hover:bg-white hover:text-black"
            >
              Suscribirme
            </button>
          </form>
          <ul className="mt-8 flex flex-wrap gap-5 text-caption">
            <li>
              <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <InstagramIcon className="size-4" /> Instagram
              </a>
            </li>
            <li>
              <a href={site.tiktokUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <TikTokIcon className="size-4" /> TikTok
              </a>
            </li>
            <li>
              <a href={site.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-onyx">
        <div className="page-container flex flex-col gap-2 py-5 text-micro uppercase tracking-label text-white/60 sm:flex-row sm:justify-between">
          <p>© 2026 RIVIBE. Todos los derechos reservados.</p>
          <p>Libro de reclamaciones · Términos · Privacidad</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="label-caps text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-caption text-white/70">{children}</ul>
    </div>
  )
}
