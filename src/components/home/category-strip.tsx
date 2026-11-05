import Image from "next/image"
import Link from "next/link"

import type { Category } from "@/lib/catalog"
import { SectionHeading } from "@/components/home/section-heading"

export function CategoryStrip({ sections }: { sections: Category[] }) {
  return (
    <section className="page-container pt-section">
      <SectionHeading title="Compra por sección" link={{ label: "Ver productos", href: "/productos" }} />
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-6">
        {sections.map((c) => (
          <li key={c.slug} className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <Link href={c.slug === "conjuntos" ? "/conjuntos" : `/productos/${c.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-warm-fog">
                <Image
                  src={c.cover}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 42vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="label-caps mt-3 group-hover:underline">{c.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
