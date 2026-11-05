import type { Metadata } from "next"

import { site, store } from "@/lib/site"
import { Breadcrumbs } from "@/components/product/shop-view"
import { StoreMap } from "@/components/media/store-map"
import { StoreVideo } from "@/components/media/store-video"

export const metadata: Metadata = {
  title: "Nuestra tienda",
  description: `Tienda RIVIBE en ${store.address}, ${store.unit}, Gamarra. ${store.hours.label} de ${store.hours.time}. Te enseñamos cómo llegar.`,
}

/** Datos estructurados para Google (ficha de tienda: dirección, ubicación y horario) */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "RIVIBE",
  description: "Ropa para hombre: polos oversized, boxy fit, camiseros, joggers y conjuntos.",
  address: {
    "@type": "PostalAddress",
    streetAddress: `Jr. Agustín Gamarra 1095, Galería Kristales, Tienda 508, Piso 5`,
    addressLocality: "La Victoria",
    addressRegion: "Lima",
    postalCode: "15018",
    addressCountry: "PE",
  },
  geo: { "@type": "GeoCoordinates", latitude: store.geo.lat, longitude: store.geo.lng },
  hasMap: store.mapsLink,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: store.hours.opens,
      closes: store.hours.closes,
    },
  ],
  sameAs: [site.instagramUrl, site.tiktokUrl],
}

export default function StorePage() {
  return (
    <div className="page-container">
      <script
        type="application/ld+json"
        // JSON propio y estático (sin datos de usuarios): seguro de insertar
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumbs items={[{ label: "Tienda" }]} />

      {/*
        Computadora (≥1024px): texto + mapa a la izquierda, video a la derecha del alto de la pantalla.
        Celular y tablet: texto → mapa → video (entra completo en pantalla).
      */}
      <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:pt-10">
        <div className="flex flex-col">
          <p className="label-caps text-smoke-charcoal">Nuestra tienda</p>
          <h1 className="mt-3 max-w-xl text-display font-normal md:text-[40px] md:leading-[1.15]">
            ¿Estás buscando los mejores outfits clásicos?
          </h1>
          <p className="mt-4 text-heading font-normal">
            ¡Aquí te enseñamos cómo llegar a RIVIBE!{" "}
            <span role="img" aria-label="estrella">
              ⭐️
            </span>
          </p>
          <p className="mt-3 max-w-lg text-body text-smoke-charcoal">
            Ven a probarte tus prendas favoritas, mira todos los colores en persona y aprovecha los precios por volumen
            desde 3 unidades.
          </p>

          <StoreMap className="mt-8 aspect-[4/3] lg:aspect-auto lg:min-h-[320px] lg:flex-1" />
        </div>

        <StoreVideo
          src="/videos/rivibe-tienda.mp4"
          poster="/videos/rivibe-tienda-poster.jpg"
          label="Video: recorrido por Gamarra hasta la tienda RIVIBE, pasando por la Galería Azul y subiendo las escaleras hasta el local"
          className="mx-auto aspect-[9/16] h-auto w-full max-w-[calc((100svh-var(--announcement-h)-var(--header-h)-6rem)*9/16)] lg:h-[calc(100svh-var(--announcement-h)-var(--header-h)-7.5rem)] lg:max-h-[860px] lg:min-h-[420px] lg:w-auto lg:max-w-none"
        />
      </div>
    </div>
  )
}
