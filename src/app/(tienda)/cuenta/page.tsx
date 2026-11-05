import type { Metadata } from "next"

import { Breadcrumbs } from "@/components/product/shop-view"
import { AccountForms } from "@/components/forms/account-forms"
import { StoreVideo } from "@/components/media/store-video"

export const metadata: Metadata = { title: "Mi cuenta" }

export default function AccountPage() {
  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: "Mi cuenta" }]} />

      {/*
        Computadora (≥1024px): formulario a la izquierda, video a la derecha del alto de la pantalla.
        Celular y tablet: formulario → video (entra completo en pantalla).
      */}
      <div className="grid gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:pt-10">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-display font-normal md:text-[40px]">Mi cuenta</h1>
          <p className="mt-3 text-body text-smoke-charcoal">Guarda tus datos de envío y revisa tus pedidos.</p>
          <AccountForms />
        </div>

        <StoreVideo
          src="/videos/rivibe-cuenta.mp4"
          poster="/videos/rivibe-cuenta-poster.jpg"
          label="Video de RIVIBE: modelo con polo oversized y pantalón negro"
          className="mx-auto aspect-[9/16] h-auto w-full max-w-[calc((100svh-var(--announcement-h)-var(--header-h)-6rem)*9/16)] lg:h-[calc(100svh-var(--announcement-h)-var(--header-h)-7.5rem)] lg:max-h-[860px] lg:min-h-[420px] lg:w-auto lg:max-w-none"
        />
      </div>
    </div>
  )
}
