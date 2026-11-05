import type { Metadata } from "next"

import { site } from "@/lib/site"
import { Breadcrumbs } from "@/components/product/shop-view"
import { ContactForm } from "@/components/forms/contact-form"
import { StoreVideo } from "@/components/media/store-video"
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons/social-icons"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos: pedidos, pedidos por mayor, tallas, envíos vía Shalom y más.",
}

export default function ContactPage() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: "Contacto" }]} />

      {/*
        Laptop (≥1024px): video a la izquierda, del alto de la pantalla bajo el header y fijo al hacer scroll.
        Celular y tablet: título → video (entra completo en pantalla) → formulario.
      */}
      <div className="grid gap-8 pt-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0 lg:pt-10">
        <div className="lg:order-2">
          <h1 className="text-display font-normal md:text-[40px]">Contacto</h1>
          <p className="mt-3 max-w-md text-body text-smoke-charcoal">
            Cuéntanos qué buscas: prendas, colores, tallas, pedidos por mayor o dudas sobre tu envío. Te respondemos lo
            antes posible.
          </p>
        </div>

        <div className="lg:order-1 lg:row-span-2">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <StoreVideo
              src="/videos/rivibe-contacto.mp4"
              poster="/videos/rivibe-contacto-poster.jpg"
              label="Video de la tienda RIVIBE: hoodies y prendas en exhibición"
              className="mx-auto aspect-[9/16] h-auto w-full max-w-[calc((100svh-var(--announcement-h)-var(--header-h)-6rem)*9/16)] lg:h-[calc(100svh-var(--announcement-h)-var(--header-h)-7.5rem)] lg:max-h-[860px] lg:min-h-[420px] lg:w-auto lg:max-w-none" />
          </div>
        </div>

        <div className="lg:order-3">
          <ContactForm />

          <div className="mt-10 border-t border-carbon-ink pt-6">
            <p className="label-caps">¿Prefieres escribirnos directo?</p>
            <ul className="mt-4 space-y-3 text-body">
              <li>
                <a href={site.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                  <WhatsAppIcon className="size-5" /> WhatsApp
                </a>
              </li>
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                  <InstagramIcon className="size-5" /> Instagram · {site.instagramHandle}
                </a>
              </li>
              <li>
                <a href={site.tiktokUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                  <TikTokIcon className="size-5" /> TikTok · {site.tiktokHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
