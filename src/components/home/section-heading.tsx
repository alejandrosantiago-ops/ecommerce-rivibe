import Link from "next/link"
import { cn } from "@/lib/utils"

export function SectionHeading({
  title,
  eyebrow,
  link,
  className,
}: {
  title: string
  eyebrow?: string
  link?: { label: string; href: string }
  className?: string
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4 md:mb-8", className)}>
      <div>
        {eyebrow && <p className="label-caps mb-2 text-smoke-charcoal">{eyebrow}</p>}
        <h2 className="text-heading font-bold">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="label-caps shrink-0 underline underline-offset-4 hover:no-underline">
          {link.label}
        </Link>
      )}
    </div>
  )
}
