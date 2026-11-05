import Link from "next/link"
import { cn } from "@/lib/utils"

type TabItem = {
  value: string
  label: string
  active: boolean
  href?: string
  onSelect?: () => void
}

/** DESIGN.md — Category Tab Filter: texto, activo con fondo negro y esquinas rectas */
export function CategoryTabs({ items, className }: { items: TabItem[]; className?: string }) {
  const base = "label-caps inline-flex h-8 shrink-0 items-center px-3 transition-colors"
  return (
    <div className={cn("no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <ul className="flex gap-1.5" role="list">
        {items.map((item) => {
          const cls = cn(base, item.active ? "bg-carbon-ink text-white" : "text-black hover:bg-soft-mist")
          return (
            <li key={item.value}>
              {item.href ? (
                <Link href={item.href} aria-current={item.active ? "page" : undefined} className={cls}>
                  {item.label}
                </Link>
              ) : (
                <button type="button" aria-pressed={item.active} onClick={item.onSelect} className={cls}>
                  {item.label}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
