import Link from "next/link"

import type { HomeSection } from "@/lib/home"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Banner creado por la marca: foto a todo el ancho con título, texto y botón */
export function BannerSection({ section }: { section: HomeSection }) {
  const { align = "left", tone = "dark" } = section.data
  const light = tone === "light"
  const desktop = section.imageUrl
  const mobile = section.mobileImageUrl || section.imageUrl

  return (
    <section className="mt-section">
      <div className="relative min-h-[460px] overflow-hidden bg-stone-gray md:min-h-[560px]">
        {desktop && (
          <picture>
            <source media="(min-width: 768px)" srcSet={desktop} />
            <img src={mobile} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/50 to-transparent md:hidden" />
        <div
          className={cn(
            "page-container relative flex min-h-[460px] flex-col justify-end pb-12 md:min-h-[560px] md:justify-center md:pb-0",
            align === "right" && "md:items-end",
            align === "center" && "md:items-center md:text-center",
          )}
        >
          <div className={cn("max-w-md text-white", light ? "md:text-white" : "md:text-black")}>
            {section.eyebrow && <p className="label-caps mb-3 opacity-80">{section.eyebrow}</p>}
            {section.title && <h2 className="text-display font-normal md:text-[40px] md:leading-[1.1]">{section.title}</h2>}
            {section.body && <p className="mt-4 text-[14px] whitespace-pre-line opacity-85">{section.body}</p>}
            {section.ctaLabel && (
              <Link
                href={section.ctaHref || "/catalogo"}
                className={cn(
                  buttonVariants({ variant: light ? "light" : "ink", size: "cta" }),
                  "mt-7 max-md:border-white max-md:bg-transparent max-md:text-white max-md:hover:bg-white max-md:hover:text-black",
                )}
              >
                {section.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
