import Link from "next/link"
import type { HomeSection } from "@/lib/home"
import { cn } from "@/lib/utils"

/** Enlace "Ver …" de un bloque editable: solo si la marca escribió el texto del botón */
export const sectionLink = (s: Pick<HomeSection, "ctaLabel" | "ctaHref">) =>
  s.ctaLabel ? { label: s.ctaLabel, href: s.ctaHref || "/catalogo" } : undefined

export function SectionHeading({
  title,
  eyebrow,
  link,
  className,
}: {
  title?: string
  eyebrow?: string
  link?: { label: string; href: string }
  className?: string
}) {
  if (!title && !eyebrow && !link) return null
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4 md:mb-8", className)}>
      <div>
        {eyebrow && <p className="label-caps mb-2 text-smoke-charcoal">{eyebrow}</p>}
        {title && <h2 className="text-heading font-bold">{title}</h2>}
      </div>
      {link && (
        <Link href={link.href} className="label-caps shrink-0 underline underline-offset-4 hover:no-underline">
          {link.label}
        </Link>
      )}
    </div>
  )
}
