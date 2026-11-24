import { Heart, MessageCircle, Package, Ruler, ShieldCheck, Star, Store, Tag, Truck } from "lucide-react"

import type { BenefitIcon, HomeSection } from "@/lib/home"

export const benefitIcons: Record<BenefitIcon, typeof Truck> = {
  truck: Truck,
  package: Package,
  ruler: Ruler,
  message: MessageCircle,
  star: Star,
  shield: ShieldCheck,
  tag: Tag,
  heart: Heart,
  store: Store,
}

export function Benefits({ section }: { section: HomeSection }) {
  const items = section.data.items ?? []
  if (!items.length) return null
  return (
    <section className="page-container pt-section">
      <ul className="grid grid-cols-2 border-t border-carbon-ink lg:grid-cols-4">
        {items.map(({ icon, title, text }, i) => {
          const Icon = benefitIcons[icon] ?? Star
          return (
            <li key={`${title}-${i}`} className="py-8 pr-4">
              <Icon className="size-5" strokeWidth={1.25} />
              <h3 className="label-caps mt-4">{title}</h3>
              <p className="mt-2 max-w-[24ch] text-caption text-smoke-charcoal">{text}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
