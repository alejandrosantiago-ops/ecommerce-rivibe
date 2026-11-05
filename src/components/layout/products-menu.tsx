"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { byCategory } from "@/lib/catalog"
import { useCatalog } from "@/components/catalog-provider"
import { cn } from "@/lib/utils"

/** Menú "Productos": panel a todo el ancho con las secciones y sus prendas */
export function ProductsMenu() {
  const { products, categories, setsCategory } = useCatalog()
  const sections = [...categories, setsCategory]
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeTimer = useRef<number | undefined>(undefined)
  const [lastPath, setLastPath] = useState(pathname)

  // Cierra al navegar (patrón "ajustar estado durante el render", sin efectos)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Refs: mouseenter y click llegan casi juntos, antes de que React vuelva a renderizar
  const openRef = useRef(false)
  const openedAt = useRef(0)
  useEffect(() => {
    openRef.current = open
  }, [open])

  const set = (next: boolean) => {
    openRef.current = next
    setOpen(next)
  }
  const show = () => {
    window.clearTimeout(closeTimer.current)
    if (!openRef.current) openedAt.current = Date.now()
    set(true)
  }
  // Con mouse, el hover ya abrió el panel: un clic inmediato no debe cerrarlo
  const toggle = () => {
    if (openRef.current && Date.now() - openedAt.current < 500) return
    openedAt.current = Date.now()
    set(!openRef.current)
  }
  const hide = () => {
    closeTimer.current = window.setTimeout(() => set(false), 150)
  }

  return (
    <div onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="products-menu"
        onClick={toggle}
        className={cn(
          "label-caps inline-flex items-center gap-1 underline-offset-4 hover:underline",
          pathname.startsWith("/productos") && "underline",
        )}
      >
        Productos
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} strokeWidth={1.5} />
      </button>

      <div
        id="products-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-carbon-ink bg-white"
      >
        <div className="page-container grid grid-cols-6 gap-6 py-8">
          {sections.map((s) => {
            const href = s.slug === "conjuntos" ? "/conjuntos" : `/productos/${s.slug}`
            return (
              <div key={s.slug}>
                <Link href={href} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-warm-fog">
                    <Image
                      src={s.cover}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="label-caps mt-3 group-hover:underline">{s.name}</p>
                </Link>
                <ul className="mt-2 space-y-1.5 text-caption text-smoke-charcoal">
                  {byCategory(products, s.slug).map((p) => (
                    <li key={p.slug}>
                      <Link href={`/producto/${p.slug}`} className="hover:text-black hover:underline">
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <div className="border-t border-soft-mist">
          <div className="page-container flex justify-between py-3 text-caption">
            <Link href="/productos" className="label-caps underline underline-offset-4">
              Ver todos los productos
            </Link>
            <span className="text-smoke-charcoal">Precios especiales desde 3 y 5 unidades del mismo producto</span>
          </div>
        </div>
      </div>
    </div>
  )
}
