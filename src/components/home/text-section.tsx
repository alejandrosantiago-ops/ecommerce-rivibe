import Link from "next/link"

import type { HomeSection } from "@/lib/home"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TextSection({ section }: { section: HomeSection }) {
  return (
    <section className="page-container pt-section">
      <div className="mx-auto max-w-2xl border-t border-carbon-ink pt-12 text-center">
        {section.eyebrow && <p className="label-caps text-smoke-charcoal">{section.eyebrow}</p>}
        {section.title && <h2 className="mt-3 text-display font-normal md:text-[36px]">{section.title}</h2>}
        {section.body && <p className="mt-4 text-body whitespace-pre-line text-smoke-charcoal">{section.body}</p>}
        {section.ctaLabel && (
          <Link href={section.ctaHref || "/catalogo"} className={cn(buttonVariants({ variant: "ink", size: "cta" }), "mt-7")}>
            {section.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
