import Image from "next/image"
import Link from "next/link"

import { type Product, formatPrice } from "@/lib/catalog"
import { SectionHeading } from "@/components/home/section-heading"

export function OffersStrip({ offers }: { offers: Product[] }) {
  return (
    <section className="page-container pt-section">
      <SectionHeading eyebrow="Shopping Days" title="Ofertas por tiempo limitado" link={{ label: "Ver ofertas", href: "/ofertas" }} />
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        {offers.map((o) => (
          <li key={o.slug} className="w-[72%] shrink-0 snap-start sm:w-auto">
            <Link href={`/producto/${o.slug}`} className="group block">
              <div className="relative aspect-[466/659] overflow-hidden bg-slate">
                <Image
                  src={o.lifestyle[0]}
                  alt={`${o.name} a ${formatPrice(o.price)}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 72vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex justify-between gap-3 pt-3 text-caption">
                <p className="group-hover:underline">{o.name}</p>
                <p className="shrink-0 font-medium">{formatPrice(o.price)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
