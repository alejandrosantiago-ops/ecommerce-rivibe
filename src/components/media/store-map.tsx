import { Clock, ExternalLink, MapPin, Navigation } from "lucide-react"

import { mapsDirectionsUrl, mapsEmbedUrl, store } from "@/lib/site"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Croquis de Google Maps con la ubicación de la tienda + dirección y horario */
export function StoreMap({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative min-h-[280px] flex-1 overflow-hidden border border-soft-mist bg-soft-mist">
        <iframe
          title={`Mapa de Google con la ubicación de la tienda RIVIBE: ${store.address}, ${store.unit}`}
          src={mapsEmbedUrl(store.mapsQuery)}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <address className="flex items-start gap-2 text-caption not-italic">
          <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          <span>
            <span className="block font-medium">{store.address}</span>
            <span className="block">{store.unit}</span>
            <span className="block text-smoke-charcoal">{store.district}</span>
          </span>
        </address>
        <p className="flex items-start gap-2 text-caption">
          <Clock className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          <span>
            <span className="block font-medium">Horario de atención</span>
            <span className="block">
              {store.hours.label} · {store.hours.time}
            </span>
          </span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={mapsDirectionsUrl(store.geo)}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: "cta" }))}
        >
          <Navigation className="size-3.5" /> Cómo llegar
        </a>
        <a href={store.mapsLink} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "ink", size: "cta" }))}>
          <ExternalLink className="size-3.5" /> Ver en Google Maps
        </a>
      </div>
    </div>
  )
}
